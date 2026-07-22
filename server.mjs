import http from "node:http";
import { createReadStream, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "public");
const preferredPort = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";
const realtimeTranslationEnabled = process.env.ENABLE_REALTIME_TRANSLATION === "true";
const aiCaptionsEnabled = process.env.ENABLE_AI_CAPTIONS !== "false";
const openAiBaseUrl = String(process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
const captionMaxBytes = Math.max(100_000, Number(process.env.CAPTION_MAX_BYTES || 750_000));
const captionMaxRequestsPerMinute = Math.max(6, Number(process.env.CAPTION_MAX_REQUESTS_PER_MINUTE || 30));
const captionMaxMinutesPerClient = Math.max(1, Number(process.env.CAPTION_MAX_MINUTES_PER_CLIENT || 90));

const rooms = new Map();
const captionUsage = new Map();
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

async function readBuffer(req, limit) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new Error("Request body is too large");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
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

async function translateText({ text, sourceLanguage, targetLanguage, model: modelOverride }) {
  if (sourceLanguage === targetLanguage) return { text, mode: "same-language" };
  if (!process.env.OPENAI_API_KEY) {
    return { text: demoTranslate(text, targetLanguage), mode: "demo" };
  }

  const sourceName = languages.get(sourceLanguage);
  const targetName = languages.get(targetLanguage);
  const model = modelOverride || process.env.OPENAI_TRANSLATION_MODEL || "gpt-4o-mini";
  const response = await fetch(`${openAiBaseUrl}/responses`, {
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
      store: false,
    }),
    signal: AbortSignal.timeout(15_000),
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

function getCaptionUsage(clientId) {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  let usage = captionUsage.get(clientId);
  if (!usage || now - usage.startedAt >= dayMs) {
    usage = { startedAt: now, audioMs: 0, requestTimes: [], inFlight: false };
    captionUsage.set(clientId, usage);
  }
  usage.requestTimes = usage.requestTimes.filter((time) => now - time < 60_000);
  return usage;
}

function captionFileType(contentType) {
  const mimeType = String(contentType || "").split(";", 1)[0].trim().toLowerCase();
  const extensions = new Map([
    ["audio/webm", "webm"],
    ["video/webm", "webm"],
    ["audio/mp4", "mp4"],
    ["audio/mpeg", "mp3"],
    ["audio/wav", "wav"],
    ["audio/x-wav", "wav"],
  ]);
  const extension = extensions.get(mimeType);
  return extension ? { mimeType, extension } : null;
}

async function transcribeCaptionAudio({ audio, fileType, sourceLanguage, clientId }) {
  const model = process.env.OPENAI_TRANSCRIPTION_MODEL || "gpt-4o-mini-transcribe";
  const form = new FormData();
  form.append("file", new Blob([audio], { type: fileType.mimeType }), `caption.${fileType.extension}`);
  form.append("model", model);
  form.append("language", sourceLanguage);
  form.append("response_format", "json");

  const response = await fetch(`${openAiBaseUrl}/audio/transcriptions`, {
    method: "POST",
    headers: {
      "authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "openai-safety-identifier": `livesub-${clientId}`,
    },
    body: form,
    signal: AbortSignal.timeout(20_000),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error?.message || `OpenAI transcription failed with ${response.status}`);
  }
  return { text: String(payload.text || "").trim(), model };
}

async function handleCaption(req, res, url) {
  const roomId = cleanRoomId(url.searchParams.get("room"));
  const clientId = cleanClientId(url.searchParams.get("client"));
  const sourceLanguage = validateLanguage(url.searchParams.get("sourceLanguage"));
  const targetLanguage = validateLanguage(url.searchParams.get("targetLanguage"));
  const durationMs = Number(url.searchParams.get("durationMs"));
  const room = rooms.get(roomId);

  if (!aiCaptionsEnabled) {
    json(res, 503, { error: "AI captions are disabled", code: "caption_unavailable" });
    return;
  }
  if (!process.env.OPENAI_API_KEY) {
    json(res, 503, { error: "OpenAI API key is not configured", code: "caption_unavailable" });
    return;
  }
  if (!roomId || !clientId || !sourceLanguage || !targetLanguage || !room?.has(clientId)) {
    json(res, 403, { error: "Active call and supported languages are required", code: "caption_session" });
    return;
  }
  if (!Number.isFinite(durationMs) || durationMs < 400 || durationMs > 7_000) {
    json(res, 400, { error: "Audio segment duration is invalid", code: "caption_duration" });
    return;
  }

  const fileType = captionFileType(req.headers["content-type"]);
  if (!fileType) {
    json(res, 415, { error: "Unsupported audio format", code: "caption_format" });
    return;
  }
  const contentLength = Number(req.headers["content-length"] || 0);
  if (contentLength > captionMaxBytes) {
    json(res, 413, { error: "Audio segment is too large", code: "caption_size" });
    return;
  }

  const usage = getCaptionUsage(clientId);
  if (usage.inFlight) {
    json(res, 429, { error: "A caption is already being processed", code: "caption_busy" });
    return;
  }
  if (usage.requestTimes.length >= captionMaxRequestsPerMinute) {
    json(res, 429, { error: "Caption request rate limit reached", code: "caption_rate" });
    return;
  }
  if (usage.audioMs + durationMs > captionMaxMinutesPerClient * 60_000) {
    json(res, 429, { error: "Daily caption audio limit reached", code: "caption_limit" });
    return;
  }

  try {
    const audio = await readBuffer(req, captionMaxBytes);
    if (audio.length < 1_200) {
      json(res, 400, { error: "Audio segment is empty", code: "caption_empty" });
      return;
    }

    usage.inFlight = true;
    usage.requestTimes.push(Date.now());
    usage.audioMs += durationMs;
    room.get(clientId).language = sourceLanguage;

    const transcription = await transcribeCaptionAudio({
      audio,
      fileType,
      sourceLanguage,
      clientId,
    });
    if (!transcription.text) {
      json(res, 200, {
        originalText: "",
        translatedText: "",
        transcriptionModel: transcription.model,
      });
      return;
    }

    const translationModel = process.env.OPENAI_CAPTION_TRANSLATION_MODEL || "gpt-4o-mini";
    const translation = await translateText({
      text: transcription.text.slice(0, 1_200),
      sourceLanguage,
      targetLanguage,
      model: translationModel,
    });
    json(res, 200, {
      originalText: transcription.text,
      translatedText: translation.text,
      transcriptionModel: transcription.model,
      translationModel: translation.model,
      remainingAudioMs: Math.max(0, captionMaxMinutesPerClient * 60_000 - usage.audioMs),
    });
  } catch (error) {
    const tooLarge = error.message === "Request body is too large";
    json(res, tooLarge ? 413 : 502, {
      error: error.message || "Caption processing failed",
      code: tooLarge ? "caption_size" : "caption_upstream",
    });
  } finally {
    usage.inFlight = false;
  }
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
    if (req.method === "GET" && url.pathname === "/api/health") {
      return json(res, 200, { ok: true, aiCaptions: aiCaptionsEnabled });
    }
    if (req.method === "GET" && url.pathname === "/api/events") return handleEvents(req, res, url);
    if (req.method === "POST" && url.pathname === "/api/signal") return handleSignal(req, res);
    if (req.method === "POST" && url.pathname === "/api/caption") return handleCaption(req, res, url);
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
