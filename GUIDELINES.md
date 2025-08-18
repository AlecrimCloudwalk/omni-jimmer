### InfinitePay Customer Story Generator — Project Guidelines

#### Overview
- **Goal**: A GitHub Pages web app that, given simple customer attributes (e.g., CNAE, region/city), automatically:
  1) Generates a brand-aligned customer image
  2) Generates a short Portuguese voiceover about their business
  3) Combines both into a lip-synced video
- **Models (Replicate)**:
  - **Image**: `bytedance/seedream-3` ([replicate page](https://replicate.com/bytedance/seedream-3))
  - **TTS**: `minimax/speech-02-hd`
  - **Video**: `bytedance/omni-human` ([replicate page](https://replicate.com/bytedance/omni-human))

#### Architecture
- **Frontend (GitHub Pages)**: Static site in `docs/` with dropdowns, shuffle button, and a “Generate” pipeline that renders each step progressively (image → audio → video) with loading states.
- **Secure API Proxy**: A minimal serverless proxy (Cloudflare Worker) to keep API keys secret and call:
  - GPT API (to author prompts + metadata)
  - Replicate API (to generate image/audio/video)
- **Why proxy**: GitHub Pages cannot host secrets; never expose API keys client-side.

#### Data Inputs (initial static options)
- **CNAE** (examples): Padaria, Restaurante, Loja de Roupas, Salão de Beleza, Mercado, Farmácia, Oficina Mecânica, Pet Shop, Clínica Odontológica, Papelaria.
- **Region/City** (examples):
  - Sudeste: São Paulo (SP), Rio de Janeiro (RJ), Belo Horizonte (MG), Campinas (SP)
  - Sul: Curitiba (PR), Porto Alegre (RS), Florianópolis (SC)
  - Nordeste: Salvador (BA), Recife (PE), Fortaleza (CE)
  - Centro-Oeste: Brasília (DF), Goiânia (GO), Cuiabá (MT)
  - Norte: Manaus (AM), Belém (PA)
- **Additional attributes** (for better prompts):
  - Business name, owner name, gender for the on-screen person, monthly TPV (R$), average ticket (R$), monthly sales count, online/offline share, storefront style (street/market/mall/home), opening hours, signature products/services.

#### Brand Visual Guidelines (to inject into image prompt)
- **Aesthetic**: “Day in the life”, candid, cinematic, photorealistic; sunlit scenes; natural textures; professional but warm.
- **Color usage**: Predominantly neutral/natural or black/white (~90%). Accents only: **avocado green** and **soft purple** (~5% each max). Keep accents subtle (e.g., signage, packaging, decor highlights).
- **Framing**: Prefer portrait 9:16. Medium shots of the subject at work; contextual background elements relating to city/region.
- **No heavy branding/watermarks**; rely on mood, palette, and composition.

#### LLM Prompting Guidelines
- **LLM responsibilities** (single call, strict JSON response):
  - Produce `image_prompt` that merges brand style with customer attributes (CNAE, city/region, storefront context, time-of-day if helpful). Specify gender/age cues to match TTS.
  - Produce `voice_script_ptbr` in Brazilian Portuguese, ~8–12 seconds spoken (fit < 15s), with 1–2 insights: e.g., monthly sales, average TPV, tip for selling online, local context.
  - Choose `voice_id` compatible with gender from the supported Minimax list, e.g.:
    - Female: Wise_Woman, Friendly_Person, Calm_Woman, Lively_Girl, Lovely_Girl, Sweet_Girl_2, Exuberant_Girl, Abbess
    - Male: Deep_Voice_Man, Casual_Guy, Patient_Man, Determined_Man, Elegant_Man, Young_Knight, Decent_Boy
  - Provide optional `emotion` (e.g., happy/calm) and pacing suggestions.
- **Constraints**:
  - Language: strictly Brazilian Portuguese.
  - Reference city/region context in both image and script when natural (e.g., landmarks, climate, local vibe).
  - Keep TTS length suitable for OmniHuman quality (< 15s audio).
  - Output must be valid JSON only.

#### Generation Pipeline
1) Frontend sends `userProfile` to proxy → GPT → returns JSON with:
   - `image_prompt`
   - `voice_metadata` { text, voice_id, emotion, speed, pitch, language_boost: "Portuguese", ... }
   - `person` { gender, ageRange, sceneNotes }
2) Frontend calls proxy → Replicate `bytedance/seedream-3` with final prompt (brand spec + `image_prompt`), `aspect_ratio: "9:16"`.
3) Frontend calls proxy → Replicate `minimax/speech-02-hd` with `voice_metadata` (text in pt-BR; select voice_id by gender).
4) Frontend calls proxy → Replicate `bytedance/omni-human` with image URL + audio URL to get an `.mp4`.
5) UI updates progressively as each artifact is ready; provide download links.

#### Security & Keys
- Store secrets in serverless environment vars: `REPLICATE_API_TOKEN`, `OPENAI_API_KEY` (or chosen GPT vendor key).
- Frontend reads `API_BASE_URL` only. Do not ship secrets to the browser.

#### Files & Structure
- `docs/` — GitHub Pages static site (UI + JS logic)
- `server/` — Cloudflare Worker (or similar) proxy endpoints
- `docs/config.example.js` — Configure `API_BASE_URL`
- `docs/clients.sample.json` — Example seed clients for shuffle

#### Replicate Model Notes
- **Image**: `bytedance/seedream-3` supports native 2K and strong text-image alignment. Prefer `aspect_ratio: "9:16"`, size `regular` for speed while testing. Ref: [Seedream-3 on Replicate](https://replicate.com/bytedance/seedream-3)
- **Video**: `bytedance/omni-human` requires an image and a short audio clip (< 15s recommended for quality). Ref: [OmniHuman on Replicate](https://replicate.com/bytedance/omni-human)
- **TTS**: `minimax/speech-02-hd` supports multilingual speech and several preset voices.

#### UX Requirements
- Static dropdowns for CNAE, Region/City; “Shuffle” fills random realistic values.
- “Generate” triggers pipeline with step-by-step loaders and progressive reveal.
- Match voice gender to visual subject; always Brazilian Portuguese.
- Provide simple error notices and the ability to retry each step.

#### Roadmap
- Add real user attribute ingestion (from internal systems) once backends are ready.
- Expand CNAE and geo coverage; enrich with seasonal/events context.
- Add face-matching or style-locking for returning customers.
- Add batching (multiple customers).
- Add analytics and usage limits.

#### Legal/Ethics
- Only use authorized images and user data; ensure consent for generated likeness.
- Follow Replicate model usage policies; avoid sensitive attributes.

#### Deployment
- Host `docs/` via GitHub Pages.
- Deploy the Worker; set `API_BASE_URL` in `docs/config.js` to the Worker endpoint.


