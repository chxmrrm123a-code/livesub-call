# Render Deploy

This app should be deployed as a Render Web Service.

## Steps

1. Create a GitHub repo and push this folder.
2. In Render, choose New > Web Service.
3. Connect the GitHub repo.
4. Use these settings:
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: Free
5. Add environment variables:
   - `OPENAI_API_KEY`: your OpenAI API key
   - `OPENAI_TRANSLATION_MODEL`: `gpt-5.4-nano`
6. Deploy.
7. Open the Render HTTPS URL on both phones.
8. One person creates or copies a room link, sends it to the other person, and both tap start call.

## Notes

- Do not deploy as a Static Site. The server is needed for room signaling and API-key-safe translation.
- TURN is not configured in this MVP. Most simple tests may work peer-to-peer; if some mobile networks fail to connect, add TURN later.
- Browser speech recognition support varies by mobile browser. Chrome/Edge usually have the best chance for this no-STT-cost version.
