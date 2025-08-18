### InfinitePay — Customer Story Generator (POC)

Minimal GitHub Pages app to generate an image (Seedream-3), audio in pt-BR (Minimax Speech-02-HD), and a lip-synced video (OmniHuman) for Brazilian SMBs, using OpenAI to author prompts.

#### What’s included
- `docs/index.html` — UI (English) + form with CNAE/Region/City, shuffle, and progressive generation
- `docs/app.js` — Client-only calls to OpenAI + Replicate
- `docs/style.css` — Simple dark UI using brand accents (#c1f732, #c87ef7)
- `docs/clients.sample.json` — Realistic Brazilian sample clients for Shuffle
- `GUIDELINES.md` — Prompting and project guidelines

#### Requirements
- OpenAI API key
- Replicate API token

#### Quick start (local)
1) Open `docs/index.html` in a modern browser
2) Paste your OpenAI + Replicate keys (optionally “remember” in this browser)
3) Pick parameters or click “Shuffle” → “Generate”
4) Watch the pipeline: Image → Audio → Video

Notes:
- Keys are used directly from the browser for this POC; do not share publicly.
- Audio is kept short (<15s) to keep OmniHuman quality high.

#### Deploy to GitHub Pages
Option A (recommended): Use GitHub’s Pages, “Deploy from branch”, folder = `docs`.
Option B (CLI):
```
git init
git add .
git commit -m "init: infinitepay customer story poc"
git branch -M main
# Replace USER/REPO below
gh repo create USER/REPO --public --source . --remote origin --push
# Then in GitHub UI: Settings → Pages → Build and deployment: Deploy from branch → Branch: main, Folder: /docs
```

#### Customization
- Edit CNAE and region/city lists in `docs/app.js`
- Adjust brand accents or UI in `docs/style.css`

#### Models
- Seedream-3 (image): `bytedance/seedream-3` — see: https://replicate.com/bytedance/seedream-3
- OmniHuman (video): `bytedance/omni-human` — see: https://replicate.com/bytedance/omni-human
- TTS: `minimax/speech-02-hd`

#### Security caveat (POC)
This is intentionally minimal: keys are entered client-side. For production, use a server-side proxy and never expose secrets to the browser.


