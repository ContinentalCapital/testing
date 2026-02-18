# LeadSheet Now (Demo)

This repository now includes a runnable front-end demo for a lead-sheet app concept.

## How to view the app locally

From the repo root:

```bash
python3 -m http.server 4173
```

Then open:

- http://localhost:4173

## How to test it as a live app (shareable URL)

If you want other people to open your app from the internet, use one of these:

### Option A: Quick temporary live URL with Cloudflare Tunnel

1. Start the app locally:

```bash
python3 -m http.server 4173
```

2. In another terminal, run:

```bash
cloudflared tunnel --url http://localhost:4173
```

3. Cloudflare prints a public URL like:

- `https://random-name.trycloudflare.com`

Share that URL to test the app live.

### Option B: Quick temporary live URL with ngrok

1. Start the app locally:

```bash
python3 -m http.server 4173
```

2. In another terminal, run:

```bash
ngrok http 4173
```

3. ngrok prints a public URL like:

- `https://abcd-12-34-56-78.ngrok-free.app`

Share that URL to test the app live.

### Option C: Deploy to Vercel (persistent live URL)

If you want a stable URL, deploy this static site:

```bash
npm i -g vercel
vercel
```

Follow prompts and Vercel gives you a permanent hosted URL.

## What this demo does

- Lets you choose either:
  - **Upload audio file**, or
  - **Enter song name + artist**
- Simulates analysis progress
- Shows a generated demo lead sheet for:
  - Piano
  - Guitar
  - Drums

## Notes

- This is a **front-end prototype** and not a full ML transcription backend yet.
- The implementation plan for production-grade analysis remains in `PLAN.md`.
