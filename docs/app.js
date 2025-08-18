const BRAND_GREEN = "#c1f732";
const BRAND_PURPLE = "#c87ef7";
const IS_LOCAL = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
const API_BASE = IS_LOCAL ? 'http://localhost:8787' : '';

const CNAE_OPTIONS = [
  "Padaria",
  "Restaurante",
  "Loja de Roupas",
  "Salão de Beleza",
  "Mercado",
  "Farmácia",
  "Oficina Mecânica",
  "Pet Shop",
  "Clínica Odontológica",
  "Papelaria",
];

const REGIONS = {
  "Sudeste": ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Campinas"],
  "Sul": ["Curitiba", "Porto Alegre", "Florianópolis"],
  "Nordeste": ["Salvador", "Recife", "Fortaleza"],
  "Centro-Oeste": ["Brasília", "Goiânia", "Cuiabá"],
  "Norte": ["Manaus", "Belém"],
};

const GENDER_BY_CNAE = {
  "Oficina Mecânica": "male",
  "Auto Peças": "male",
  "Auto Center": "male",
  "Salão de Beleza": "female",
  "Loja de Roupas": "female",
};

const openaiKeyEl = document.getElementById("openaiKey");
const replicateKeyEl = document.getElementById("replicateKey");
const rememberKeysEl = document.getElementById("rememberKeys");

const cnaeEl = document.getElementById("cnae");
const regionEl = document.getElementById("region");
const cityEl = document.getElementById("city");
const genderEl = document.getElementById("gender");

const businessNameEl = document.getElementById("businessName");
const ownerNameEl = document.getElementById("ownerName");
const tpvEl = document.getElementById("tpv");
const avgTicketEl = document.getElementById("avgTicket");
const salesCountEl = document.getElementById("salesCount");
const onlineShareEl = document.getElementById("onlineShare");
const storefrontEl = document.getElementById("storefront");
const signatureItemEl = document.getElementById("signatureItem");

const shuffleBtn = document.getElementById("shuffleBtn");
const generateBtn = document.getElementById("generateBtn");

const imageStatus = document.getElementById("imageStatus");
const audioStatus = document.getElementById("audioStatus");
const videoStatus = document.getElementById("videoStatus");
const imageContainer = document.getElementById("imageContainer");
const audioContainer = document.getElementById("audioContainer");
const videoContainer = document.getElementById("videoContainer");

init();

function init() {
  CNAE_OPTIONS.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c; opt.textContent = c; cnaeEl.appendChild(opt);
  });
  Object.keys(REGIONS).forEach((r) => {
    const opt = document.createElement("option");
    opt.value = r; opt.textContent = r; regionEl.appendChild(opt);
  });
  regionEl.addEventListener("change", updateCities);
  updateCities();

  const savedOpenAI = localStorage.getItem("openaiKey");
  const savedReplicate = localStorage.getItem("replicateKey");
  const savedRemember = localStorage.getItem("rememberKeys") === "true";
  if (savedRemember) {
    if (savedOpenAI) openaiKeyEl.value = savedOpenAI;
    if (savedReplicate) replicateKeyEl.value = savedReplicate;
    rememberKeysEl.checked = true;
  }

  shuffleBtn.addEventListener("click", onShuffle);
  generateBtn.addEventListener("click", onGenerate);
}

function updateCities() {
  const region = regionEl.value || Object.keys(REGIONS)[0];
  cityEl.innerHTML = "";
  (REGIONS[region] || []).forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c; opt.textContent = c; cityEl.appendChild(opt);
  });
}

async function onShuffle() {
  try {
    const res = await fetch("./clients.sample.json");
    const list = await res.json();
    const sample = list[Math.floor(Math.random() * list.length)];
    fillForm(sample);
  } catch (e) {
    console.error(e);
  }
}

function fillForm(d) {
  businessNameEl.value = d.businessName || "";
  ownerNameEl.value = d.ownerName || "";
  selectValue(cnaeEl, d.cnae);
  selectValue(regionEl, d.region);
  updateCities();
  selectValue(cityEl, d.city);
  selectValue(genderEl, d.gender || "");
  tpvEl.value = d.tpv ?? "";
  avgTicketEl.value = d.avgTicket ?? "";
  salesCountEl.value = d.salesCount ?? "";
  onlineShareEl.value = d.onlineShare ?? "";
  selectValue(storefrontEl, d.storefront || "street");
  signatureItemEl.value = d.signatureItem || "";
}

function selectValue(select, val) {
  const idx = Array.from(select.options).findIndex(o => o.value === val);
  select.selectedIndex = idx >= 0 ? idx : 0;
}

function saveKeysIfNeeded() {
  if (rememberKeysEl.checked) {
    localStorage.setItem("rememberKeys", "true");
    localStorage.setItem("openaiKey", openaiKeyEl.value.trim());
    localStorage.setItem("replicateKey", replicateKeyEl.value.trim());
  } else {
    localStorage.removeItem("rememberKeys");
    localStorage.removeItem("openaiKey");
    localStorage.removeItem("replicateKey");
  }
}

async function onGenerate() {
  const openaiKey = openaiKeyEl.value.trim();
  const replicateKey = replicateKeyEl.value.trim();
  if (!openaiKey || !replicateKey) {
    alert("Please provide both OpenAI and Replicate API keys.");
    return;
  }
  saveKeysIfNeeded();

  lockUI(true);
  clearOutputs();

  const profile = buildUserProfile();
  const promptResult = await callOpenAIForPrompts(openaiKey, profile);
  if (!promptResult) {
    lockUI(false);
    return;
  }

  const imageUrl = await generateImage(replicateKey, promptResult.image_prompt);
  const audioUrl = imageUrl ? await generateAudio(replicateKey, promptResult.voice_metadata) : null;
  const videoUrl = imageUrl && audioUrl ? await generateVideo(replicateKey, imageUrl, audioUrl) : null;

  if (!videoUrl && imageUrl && audioUrl) {
    videoStatus.textContent = "Video generation failed.";
  }

  lockUI(false);
}

function lockUI(disabled) {
  generateBtn.disabled = disabled;
  shuffleBtn.disabled = disabled;
}

function clearOutputs() {
  imageContainer.innerHTML = "";
  audioContainer.innerHTML = "";
  videoContainer.innerHTML = "";
  imageStatus.textContent = "Generating image…";
  audioStatus.textContent = "Waiting…";
  videoStatus.textContent = "Waiting…";
}

function buildUserProfile() {
  const cnae = cnaeEl.value;
  const region = regionEl.value;
  const city = cityEl.value;
  const gender = genderEl.value || (GENDER_BY_CNAE[cnae] || "");
  return {
    businessName: businessNameEl.value.trim(),
    ownerName: ownerNameEl.value.trim(),
    cnae, region, city,
    gender,
    tpv: Number(tpvEl.value || 0),
    avgTicket: Number(avgTicketEl.value || 0),
    salesCount: Number(salesCountEl.value || 0),
    onlineShare: Number(onlineShareEl.value || 0),
    storefront: storefrontEl.value,
    signatureItem: signatureItemEl.value.trim(),
  };
}

async function callOpenAIForPrompts(openaiKey, profile) {
  try {
    const system = `You are a creative assistant for InfinitePay. Generate concise JSON only. No explanations. Ensure Brazilian Portuguese for text. Choose voice to match gender.`;
    const brand = `Brand visual style: cinematic, photorealistic, daylight; neutral palette (90%) with subtle accents: avocado green ${BRAND_GREEN} and soft purple ${BRAND_PURPLE} (about 5% each). Composition: medium shot of subject at work; contextual background referencing the Brazilian city/region when natural; avoid heavy logos.`;
    const user = {
      instruction: "Create prompts for image and voice in JSON.",
      constraints: {
        language: "pt-BR",
        maxAudioSeconds: 14,
        voiceModel: "minimax/speech-02-hd",
        videoModel: "bytedance/omni-human",
        imageModel: "bytedance/seedream-3",
      },
      profile,
      outputs: [
        "image_prompt",
        "voice_metadata.text",
        "voice_metadata.voice_id",
        "voice_metadata.emotion",
        "voice_metadata.speed",
        "voice_metadata.pitch",
        "person.gender",
        "person.ageRange",
        "person.sceneNotes",
      ],
      brand,
      rules: [
        "All text must be Brazilian Portuguese",
        "Voice length ~8–12 seconds",
        "Reference city/region naturally",
        "Match voice gender to person",
      ],
    };

    let json;
    if (IS_LOCAL) {
      const r = await fetch(`${API_BASE}/api/gpt/prompts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: user.profile })
      });
      if (!r.ok) throw new Error(await r.text());
      json = await r.json();
    } else {
      const completion = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: system },
            { role: "user", content: `Respond ONLY with JSON. No markdown. User Profile and instructions: ${JSON.stringify(user)}` },
          ],
          temperature: 0.8,
          response_format: { type: "json_object" }
        }),
      });
      if (!completion.ok) {
        const t = await completion.text();
        throw new Error(`OpenAI error: ${t}`);
      }
      const data = await completion.json();
      const content = data.choices?.[0]?.message?.content || "";
      json = JSON.parse(content);
    }

    // Ensure voice fields
    const defaultVoice = profile.gender === "male" ? "Deep_Voice_Man" : "Friendly_Person";
    json.voice_metadata = json.voice_metadata || {};
    json.voice_metadata.voice_id = json.voice_metadata.voice_id || defaultVoice;
    json.voice_metadata.emotion = json.voice_metadata.emotion || "happy";
    json.voice_metadata.speed = json.voice_metadata.speed || 1.0;
    json.voice_metadata.pitch = json.voice_metadata.pitch || 0;
    json.voice_metadata.language_boost = "Portuguese";
    json.voice_metadata.english_normalization = false;
    return json;
  } catch (e) {
    console.error(e);
    alert("OpenAI prompt generation failed. Check console.");
    return null;
  }
}

async function generateImage(replicateKey, imagePrompt) {
  try {
    const finalPrompt = `${imagePrompt}\n\nEstilo da marca: fotografia cinematográfica diurna, tons neutros/naturais (90%), acentos sutis em verde abacate ${BRAND_GREEN} e roxo suave ${BRAND_PURPLE} (~5% cada), retratando o dia a dia do cliente.`;
    const body = {
      version: "bytedance/seedream-3",
      input: {
        prompt: finalPrompt,
        aspect_ratio: "9:16",
        size: "regular",
        guidance_scale: 2.5
      }
    };
    imageStatus.textContent = "Generating image…";
    let imageUrl;
    if (IS_LOCAL) {
      const r = await fetch(`${API_BASE}/api/replicate/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: finalPrompt })
      });
      if (!r.ok) throw new Error(await r.text());
      const j = await r.json();
      imageUrl = j.url;
    } else {
      const res = await fetch("https://api.replicate.com/v1/models/bytedance/seedream-3/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${replicateKey}`,
        },
        body: JSON.stringify({ input: body.input })
      });
      if (!res.ok) throw new Error(await res.text());
      const pred = await res.json();
      imageUrl = await waitForReplicatePrediction(replicateKey, pred.urls.get);
    }
    if (imageUrl) {
      const img = document.createElement("img");
      img.src = imageUrl;
      imageContainer.innerHTML = "";
      imageContainer.appendChild(img);
      const a = document.createElement("a");
      a.href = imageUrl; a.download = "image.png"; a.textContent = "Download image";
      a.style.margin = "10px";
      imageContainer.appendChild(a);
      imageStatus.textContent = "Done.";
    } else {
      imageStatus.textContent = "Image generation failed.";
    }
    return imageUrl;
  } catch (e) {
    console.error(e);
    imageStatus.textContent = "Image generation failed.";
    return null;
  }
}

async function generateAudio(replicateKey, voice) {
  try {
    audioStatus.textContent = "Generating audio…";
    let audioUrl;
    if (IS_LOCAL) {
      const r = await fetch(`${API_BASE}/api/replicate/audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voice })
      });
      if (!r.ok) throw new Error(await r.text());
      const j = await r.json();
      audioUrl = j.url;
    } else {
      const res = await fetch("https://api.replicate.com/v1/models/minimax/speech-02-hd/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${replicateKey}`,
        },
        body: JSON.stringify({
          input: {
            text: voice.text,
            voice_id: voice.voice_id,
            emotion: voice.emotion || "happy",
            speed: voice.speed || 1,
            pitch: voice.pitch || 0,
            english_normalization: false,
            sample_rate: 32000,
            bitrate: 128000,
            channel: "mono",
            language_boost: "Portuguese"
          }
        })
      });
      if (!res.ok) throw new Error(await res.text());
      const pred = await res.json();
      audioUrl = await waitForReplicatePrediction(replicateKey, pred.urls.get);
    }
    if (audioUrl) {
      const audio = document.createElement("audio");
      audio.controls = true;
      audio.src = audioUrl;
      audioContainer.innerHTML = "";
      audioContainer.appendChild(audio);
      const a = document.createElement("a");
      a.href = audioUrl; a.download = "audio.mp3"; a.textContent = "Download audio";
      a.style.margin = "10px";
      audioContainer.appendChild(a);
      audioStatus.textContent = "Done.";
    } else {
      audioStatus.textContent = "Audio generation failed.";
    }
    return audioUrl;
  } catch (e) {
    console.error(e);
    audioStatus.textContent = "Audio generation failed.";
    return null;
  }
}

async function generateVideo(replicateKey, imageUrl, audioUrl) {
  try {
    videoStatus.textContent = "Generating video…";
    let videoUrl;
    if (IS_LOCAL) {
      const r = await fetch(`${API_BASE}/api/replicate/video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, audioUrl })
      });
      if (!r.ok) throw new Error(await r.text());
      const j = await r.json();
      videoUrl = j.url;
    } else {
      const res = await fetch("https://api.replicate.com/v1/models/bytedance/omni-human/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${replicateKey}`,
        },
        body: JSON.stringify({
          input: { image: imageUrl, audio: audioUrl }
        })
      });
      if (!res.ok) throw new Error(await res.text());
      const pred = await res.json();
      videoUrl = await waitForReplicatePrediction(replicateKey, pred.urls.get);
    }
    if (videoUrl) {
      const video = document.createElement("video");
      video.controls = true;
      video.src = videoUrl;
      videoContainer.innerHTML = "";
      videoContainer.appendChild(video);
      const a = document.createElement("a");
      a.href = videoUrl; a.download = "video.mp4"; a.textContent = "Download video";
      a.style.margin = "10px";
      videoContainer.appendChild(a);
      videoStatus.textContent = "Done.";
    } else {
      videoStatus.textContent = "Video generation failed.";
    }
    return videoUrl;
  } catch (e) {
    console.error(e);
    videoStatus.textContent = "Video generation failed.";
    return null;
  }
}

async function waitForReplicatePrediction(replicateKey, getUrl) {
  // Poll until status succeeded and return the first output URL or delivery URL
  for (let i = 0; i < 120; i++) { // up to ~2 minutes
    const res = await fetch(getUrl, {
      headers: { "Authorization": `Token ${replicateKey}` }
    });
    const pred = await res.json();
    if (pred.status === "succeeded") {
      // seedream returns array of URLs; tts/video returns a single delivery URL in output
      const out = pred.output;
      if (Array.isArray(out)) return out[0];
      if (typeof out === "string") return out;
      if (out && out.url) return out.url; // some SDKs show as object
      return null;
    }
    if (pred.status === "failed" || pred.status === "canceled") return null;
    await new Promise(r => setTimeout(r, 1000));
  }
  return null;
}


