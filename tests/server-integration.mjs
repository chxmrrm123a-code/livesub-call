import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const appPort = 43100;
const mockPort = 43101;
const appUrl = `http://127.0.0.1:${appPort}`;

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(body),
  });
  res.end(body);
}

async function consume(req) {
  for await (const _chunk of req) {
    // The mock only verifies request shape; OpenAI parses the multipart body in production.
  }
}

const mockOpenAI = http.createServer(async (req, res) => {
  assert.equal(req.headers.authorization, "Bearer test-key");
  if (req.url === "/v1/audio/transcriptions") {
    assert.match(req.headers["content-type"] || "", /^multipart\/form-data; boundary=/);
    await consume(req);
    sendJson(res, 200, { text: "hello there" });
    return;
  }
  if (req.url === "/v1/responses") {
    let body = "";
    for await (const chunk of req) body += chunk;
    const payload = JSON.parse(body);
    assert.equal(payload.model, "gpt-4o-mini");
    assert.equal(payload.input, "hello there");
    sendJson(res, 200, { output_text: "안녕하세요" });
    return;
  }
  sendJson(res, 404, { error: { message: "not found" } });
});

await new Promise((resolve) => mockOpenAI.listen(mockPort, "127.0.0.1", resolve));
const app = spawn(process.execPath, ["server.mjs"], {
  cwd: root,
  env: {
    ...process.env,
    HOST: "127.0.0.1",
    PORT: String(appPort),
    OPENAI_API_KEY: "test-key",
    OPENAI_BASE_URL: `http://127.0.0.1:${mockPort}/v1`,
    OPENAI_TRANSCRIPTION_MODEL: "gpt-4o-mini-transcribe",
    OPENAI_CAPTION_TRANSLATION_MODEL: "gpt-4o-mini",
    ENABLE_AI_CAPTIONS: "true",
    ENABLE_REALTIME_TRANSLATION: "false",
  },
  stdio: ["ignore", "pipe", "pipe"],
});

let appOutput = "";
app.stdout.on("data", (chunk) => { appOutput += chunk; });
app.stderr.on("data", (chunk) => { appOutput += chunk; });
const sseController = new AbortController();

try {
  let health;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      health = await fetch(`${appUrl}/api/health`);
      if (health.ok) break;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.equal(health?.status, 200, appOutput);
  assert.deepEqual(await health.json(), { ok: true, aiCaptions: true });

  const missingSession = await fetch(
    `${appUrl}/api/caption?room=ROOM-1&client=missing&sourceLanguage=en&targetLanguage=ko&durationMs=1200`,
    { method: "POST", headers: { "content-type": "audio/webm" }, body: Buffer.alloc(2_000) },
  );
  assert.equal(missingSession.status, 403);

  const sse = await fetch(`${appUrl}/api/events?room=ROOM-1&client=caller-1&name=Caller&language=en`, {
    signal: sseController.signal,
  });
  assert.equal(sse.status, 200);

  const caption = await fetch(
    `${appUrl}/api/caption?room=ROOM-1&client=caller-1&sourceLanguage=en&targetLanguage=ko&durationMs=1200`,
    { method: "POST", headers: { "content-type": "audio/webm;codecs=opus" }, body: Buffer.alloc(2_000) },
  );
  const captionBody = await caption.text();
  assert.equal(caption.status, 200, captionBody);
  const payload = JSON.parse(captionBody);
  assert.equal(payload.originalText, "hello there");
  assert.equal(payload.translatedText, "안녕하세요");
  assert.equal(payload.transcriptionModel, "gpt-4o-mini-transcribe");
  assert.equal(payload.translationModel, "gpt-4o-mini");

  console.log("Server caption integration test passed");
} finally {
  sseController.abort();
  app.kill();
  await new Promise((resolve) => mockOpenAI.close(resolve));
}
