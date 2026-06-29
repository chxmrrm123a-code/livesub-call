# LiveSub Call

1:1 browser voice call prototype with live translated captions for Korean, English, and Vietnamese.

## Run

```powershell
$env:OPENAI_API_KEY="sk-your-key"
$env:OPENAI_TRANSLATION_MODEL="gpt-5.4-nano"
.\start-local.ps1
```

Open `http://localhost:3000` in two browser tabs, join the same room, and start the call in both tabs.

For another person to join from their phone, deploy the same app to a public HTTPS URL, then send the room link. `localhost` only works on the computer running the server.

## Render Deploy

Use Render Web Service, not Static Site, because this app needs a small server for room signaling and translation requests.

1. Push this folder to GitHub.
2. In Render, create a new Web Service from the repo.
3. Use:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: Free
4. Add `OPENAI_API_KEY` as an environment variable.
5. Open the generated `https://your-service.onrender.com` URL on both phones and join the same room.

See `DEPLOY_RENDER.md` for the short phone-first deploy checklist.

## Cost Shape

- WebRTC voice/video traffic can be peer-to-peer, so there is no required per-minute call API fee.
- This MVP does not include TURN, so some strict mobile networks may fail to connect. Add TURN only after that actually happens.
- A production app still needs hosting for the signaling server.
- This prototype uses browser speech recognition to avoid separate speech-to-text API cost. Production reliability may require a paid STT service.
- Translation captions use the OpenAI API when `OPENAI_API_KEY` is set. Without a key, the app runs in demo translation mode.

## Notes

- Microphone access works on `localhost`; deployed versions should use HTTPS.
- Browser speech recognition is best supported in Chrome and Edge.
- The WebRTC layer is voice-only now, but it is structured so camera tracks can be added later.
