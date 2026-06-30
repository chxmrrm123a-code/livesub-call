import http from "node:http";
import { createReadStream, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "public");
const preferredPort = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";
const realtimeTranslationEnabled = process.env.ENABLE_REALTIME_TRANSLATION === "true";

const rooms = new Map();
const languages = new Map([
  ["ko", "Korean"],
  ["en", "English"],
  ["vi", "Vietnamese"],
]);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function roomClients(roomId) {
  if (!rooms.has(roomId)) rooms.set(roomId, new Map());
  return rooms.get(roomId);
}

function sendSse(client, event, payload) {
  client.res.write(`event: ${event}\n`);
  client.res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function broadcast(roomId, event, payload, exceptClientId = null) {
  const clients = roomClients(roomId);
  for (const [clientId, client] of clients) {
    if (clientId !== exceptClientId) sendSse(client, event, payload);
  }
}

async function readJson(req, limit = 1_000_000) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (Buffer.byteLength(body) > limit) throw new Error("Request body is too large");
  }
  if (!body) return {};
  return JSON.parse(body);
}

function json(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body),
  });
  res.end(body);
}

function cleanRoomId(roomId) {
  return String(roomId || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 32);
}

function cleanClientId(clientId) {
  return String(clientId || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 64);
}

function validateLanguage(code) {
  return languages.has(code) ? code : null;
}

function extractOutputText(payload) {
  if (typeof payload.output_text === "string") return payload.output_text.trim();
  const chunks = [];
  for (const item of payload.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) chunks.push(content.text);
    }
  }
  return chunks.join("").trim();
}

function demoTranslate(text, targetLanguage) {
  const dictionary = {
    ko: {
      "hello": "안녕하세요",
      "hi": "안녕하세요",
      "thank you": "감사합니다",
      "how are you": "어떻게 지내세요?",
      "nice to meet you": "만나서 반갑습니다",
    },
    en: {
      "안녕하세요": "Hello",
      "감사합니다": "Thank you",
      "어떻게 지내세요": "How are you?",
      "만나서 반갑습니다": "Nice to meet you",
      "xin chào": "Hello",
      "cảm ơn": "Thank you",
    },
    vi: {
      "hello": "Xin chao",
      "hi": "Xin chao",
      "thank you": "Cam on",
      "안녕하세요": "Xin chao",
      "감사합니다": "Cam on",
    },
  };
  const normalized = text.toLowerCase().replace(/[.!?。？！]/g, "").trim();
  const exact = dictionary[targetLanguage]?.[normalized] || dictionary[targetLanguage]?.[text.trim()];
  return exact || `[demo ${targetLanguage}] ${text}`;
}

async function translateText({ text, sourceLanguage, targetLanguage }) {
  if (sourceLanguage === targetLanguage) return { text, mode: "same-language" };
  if (!process.env.OPENAI_API_KEY) {
    return { text: demoTranslate(text, targetLanguage), mode: "demo" };
  }

  const sourceName = languages.get(sourceLanguage);
  const targetName = languages.get(targetLanguage);
  const model = process.env.OPENAI_TRANSLATION_MODEL || "gpt-5.4-nano";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      instructions: [
        `Translate from ${sourceName} to ${targetName}.`,
        "Preserve meaning, names, numbers, and tone.",
        "Return only the translated sentence. Do not add quotes or explanations.",
      ].join(" "),
      input: text,
      max_output_tokens: 220,
      reasoning: { effort: "low" },
      text: { verbosity: "low" },
      store: false,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload.error?.message || `OpenAI request failed with ${response.status}`;
    throw new Error(message);
  }

  const translated = extractOutputText(payload);
  if (!translated) throw new Error("Translation returned no text");
  return { text: translated, mode: "openai", model };
}

async function handleEvents(req, res, url) {
  const roomId = cleanRoomId(url.searchParams.get("room"));
  const clientId = cleanClientId(url.searchParams.get("client"));
  const name = String(url.searchParams.get("name") || "Guest").slice(0, 40);
  const language = validateLanguage(url.searchParams.get("language")) || "ko";
  if (!roomId || !clientId) {
    json(res, 400, { error: "Missing room or client" });
    return;
  }

  res.writeHead(200, {
    "content-type": "text/event-stream; charset=utf-8",
    "cache-control": "no-cache, no-transform",
    "connection": "keep-alive",
    "x-accel-buffering": "no",
  });
  res.write("\n");

  const clients = roomClients(roomId);
  const peerProfiles = [...clients.entries()]
    .filter(([id]) => id !== clientId)
    .map(([id, client]) => ({
      id,
      name: client.name,
      language: client.language,
    }));
  const existing = clients.get(clientId);
  if (existing) existing.res.end();
  const client = { id: clientId, name, language, res };
  clients.set(clientId, client);

  sendSse(client, "ready", { room: roomId, client: clientId, peers: peerProfiles });
  broadcast(roomId, "peer-joined", { from: clientId, id: clientId, name, language }, clientId);

  const keepAlive = setInterval(() => {
    try {
      res.write(": keep-alive\n\n");
    } catch {
      clearInterval(keepAlive);
    }
  }, 20000);

  req.on("close", () => {
    clearInterval(keepAlive);
    const current = roomClients(roomId);
    if (current.get(clientId) === client) {
      current.delete(clientId);
      broadcast(roomId, "peer-left", { from: clientId }, clientId);
    }
    if (current.size === 0) rooms.delete(roomId);
  });
}

async function handleSignal(req, res) {
  const body = await readJson(req);
  const roomId = cleanRoomId(body.room);
  const from = cleanClientId(body.from);
  const to = body.to ? cleanClientId(body.to) : null;
  const type = String(body.type || "");
  const data = body.data ?? {};

  if (!roomId || !from || !type) {
    json(res, 400, { error: "Missing room, from, or type" });
    return;
  }

  const payload = { from, to, type, data, sentAt: Date.now() };
  const clients = roomClients(roomId);
  if (type === "profile" && clients.has(from)) {
    const client = clients.get(from);
    const language = validateLanguage(data.language);
    if (language) client.language = language;
    if (data.name) client.name = String(data.name).slice(0, 40);
  }
  if (to && clients.has(to)) {
    sendSse(clients.get(to), "signal", payload);
  } else {
    broadcast(roomId, "signal", payload, from);
  }
  json(res, 200, { ok: true });
}

async function handleTranslate(req, res) {
  try {
    const body = await readJson(req);
    const text = String(body.text || "").trim();
    const sourceLanguage = validateLanguage(body.sourceLanguage);
    const targetLanguage = validateLanguage(body.targetLanguage);
    if (!text || !sourceLanguage || !targetLanguage) {
      json(res, 400, { error: "Missing text or supported language" });
      return;
    }
    if (text.length > 1200) {
      json(res, 413, { error: "Caption is too long" });
      return;
    }

    const result = await translateText({ text, sourceLanguage, targetLanguage });
    json(res, 200, {
      translatedText: result.text,
      mode: result.mode,
      model: result.model,
    });
  } catch (error) {
    json(res, 500, { error: error.message || "Translation failed" });
  }
}

async function handleRealtimeTranslationToken(req, res) {
  try {
    if (!realtimeTranslationEnabled) {
      json(res, 503, { error: "Realtime translation is temporarily disabled" });
      return;
    }

    const body = await readJson(req, 20_000);
    const targetLanguage = validateLanguage(body.targetLanguage);
    const clientId = cleanClientId(body.clientId);
    if (!targetLanguage) {
      json(res, 400, { error: "Missing supported target language" });
      return;
    }
    if (!process.env.OPENAI_API_KEY) {
      json(res, 503, { error: "OpenAI API key is not configured" });
      return;
    }

    const model = process.env.OPENAI_REALTIME_TRANSLATION_MODEL || "gpt-realtime-translate";
    const response = await fetch("https://api.openai.com/v1/realtime/translations/client_secrets", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        ...(clientId ? { "openai-safety-identifier": `livesub-${clientId}` } : {}),
      },
      body: JSON.stringify({
        session: {
          model,
          audio: {
            output: {
              language: targetLanguage,
            },
          },
        },
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = payload.error?.message || `OpenAI Realtime request failed with ${response.status}`;
      json(res, response.status >= 400 && response.status < 600 ? response.status : 500, { error: message });
      return;
    }
    json(res, 200, payload);
  } catch (error) {
    json(res, 500, { error: error.message || "Realtime token failed" });
  }
}

async function serveStatic(req, res, url) {
  const requestPath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const safePath = path
    .normalize(requestPath)
    .replace(/^[/\\]+/, "")
    .replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(publicDir, safePath);
  if (!filePath.startsWith(publicDir) || !existsSync(filePath)) {
    json(res, 404, { error: "Not found" });
    return;
  }
  const extension = path.extname(filePath);
  res.writeHead(200, { "content-type": mimeTypes[extension] || "application/octet-stream" });
  createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    if (req.method === "GET" && url.pathname === "/api/health") return json(res, 200, { ok: true });
    if (req.method === "GET" && url.pathname === "/api/events") return handleEvents(req, res, url);
    if (req.method === "POST" && url.pathname === "/api/signal") return handleSignal(req, res);
    if (req.method === "POST" && url.pathname === "/api/translate") return handleTranslate(req, res);
    if (req.method === "POST" && url.pathname === "/api/realtime/translation-token") return handleRealtimeTranslationToken(req, res);
    if (req.method === "GET") return serveStatic(req, res, url);
    json(res, 405, { error: "Method not allowed" });
  } catch (error) {
    json(res, 500, { error: error.message || "Server error" });
  }
});

let activePort = preferredPort;

server.on("error", (error) => {
  if (error.code === "EADDRINUSE" && !process.env.PORT && activePort < preferredPort + 20) {
    activePort += 1;
    server.listen(activePort, host);
    return;
  }
  throw error;
});

server.on("listening", () => {
  const address = server.address();
  const actualPort = typeof address === "object" && address ? address.port : activePort;
  console.log(`LiveSub Call is running at http://localhost:${actualPort}`);
});

server.listen(activePort, host);
