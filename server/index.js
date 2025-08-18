'use strict';

const path = require('path');
let dotenvResult = require('dotenv').config();
if (dotenvResult.error) {
  // Fallback: explicitly try project root relative to this file
  const altPath = path.resolve(__dirname, '../.env');
  dotenvResult = require('dotenv').config({ path: altPath });
  if (dotenvResult.error) {
    console.warn('WARN: .env not found via default or fallback paths.');
  } else {
    console.log(`Loaded .env from ${altPath}`);
  }
}
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 8787;

app.use(cors({ origin: '*'}));
app.use(express.json({ limit: '2mb' }));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

if (!OPENAI_API_KEY) console.warn('WARN: Missing OPENAI_API_KEY in .env');
if (!REPLICATE_API_TOKEN) console.warn('WARN: Missing REPLICATE_API_TOKEN in .env');

const BRAND_GREEN = '#c1f732';
const BRAND_PURPLE = '#c87ef7';

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/api/gpt/prompts', async (req, res) => {
  try {
    if (!OPENAI_API_KEY) return res.status(500).json({ error: 'missing OPENAI_API_KEY' });
    const profile = req.body?.profile || {};
    const system = 'You are a creative assistant for InfinitePay. Generate concise JSON only. No explanations. Ensure Brazilian Portuguese for text. Choose voice to match gender.';
    const brand = `Brand visual style: cinematic, photorealistic, daylight; neutral palette (90%) with subtle accents: avocado green ${BRAND_GREEN} and soft purple ${BRAND_PURPLE} (about 5% each). Composition: medium shot of subject at work; contextual background referencing the Brazilian city/region when natural; avoid heavy logos.`;
    const user = {
      instruction: 'Create prompts for image and voice in JSON.',
      constraints: {
        language: 'pt-BR',
        maxAudioSeconds: 14,
        voiceModel: 'minimax/speech-02-hd',
        videoModel: 'bytedance/omni-human',
        imageModel: 'bytedance/seedream-3',
      },
      profile,
      outputs: [
        'image_prompt',
        'voice_metadata.text',
        'voice_metadata.voice_id',
        'voice_metadata.emotion',
        'voice_metadata.speed',
        'voice_metadata.pitch',
        'person.gender',
        'person.ageRange',
        'person.sceneNotes',
      ],
      brand,
      rules: [
        'All text must be Brazilian Portuguese',
        'Voice length ~8–12 seconds',
        'Reference city/region naturally',
        'Match voice gender to person',
      ],
    };

    const r = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `Respond ONLY with JSON. No markdown. User Profile and instructions: ${JSON.stringify(user)}` },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      }
    });
    const data = r.data;
    const content = data.choices?.[0]?.message?.content || '{}';
    const json = JSON.parse(content);

    // defaults
    const defaultVoice = (profile.gender === 'male') ? 'Deep_Voice_Man' : 'Friendly_Person';
    json.voice_metadata = json.voice_metadata || {};
    json.voice_metadata.voice_id = json.voice_metadata.voice_id || defaultVoice;
    json.voice_metadata.emotion = json.voice_metadata.emotion || 'happy';
    json.voice_metadata.speed = json.voice_metadata.speed || 1.0;
    json.voice_metadata.pitch = json.voice_metadata.pitch || 0;
    json.voice_metadata.language_boost = 'Portuguese';
    json.voice_metadata.english_normalization = false;

    res.json(json);
  } catch (err) {
    console.error('GPT error:', err?.response?.data || err?.message || err);
    res.status(500).json({ error: 'prompt_generation_failed', detail: err?.response?.data || err?.message });
  }
});

app.post('/api/replicate/image', async (req, res) => {
  try {
    if (!REPLICATE_API_TOKEN) return res.status(500).json({ error: 'missing REPLICATE_API_TOKEN' });
    const prompt = req.body?.prompt;
    if (!prompt) return res.status(400).json({ error: 'missing prompt' });
    const input = {
      prompt,
      aspect_ratio: '16:9',
      size: 'regular',
      guidance_scale: 2.5,
    };
    const r = await axios.post('https://api.replicate.com/v1/models/bytedance/seedream-3/predictions', { input }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
      }
    });
    const pred = r.data;
    const url = await waitForReplicate(pred.urls.get);
    if (!url) return res.status(500).json({ error: 'image_generation_failed' });
    res.json({ url });
  } catch (err) {
    console.error('Image error:', err?.response?.data || err?.message || err);
    res.status(500).json({ error: 'image_generation_failed', detail: err?.response?.data || err?.message });
  }
});

app.post('/api/replicate/audio', async (req, res) => {
  try {
    if (!REPLICATE_API_TOKEN) return res.status(500).json({ error: 'missing REPLICATE_API_TOKEN' });
    const v = req.body?.voice || {};
    const validVoices = ['Wise_Woman', 'Friendly_Person', 'Inspirational_girl', 'Deep_Voice_Man', 'Calm_Woman', 'Casual_Guy', 'Lively_Girl', 'Patient_Man', 'Young_Knight', 'Determined_Man', 'Lovely_Girl', 'Decent_Boy', 'Imposing_Manner', 'Elegant_Man', 'Abbess', 'Sweet_Girl_2', 'Exuberant_Girl'];
    const voiceId = validVoices.includes(v.voice_id) ? v.voice_id : 'Friendly_Person';
    
    const input = {
      text: v.text,
      voice_id: voiceId,
      emotion: ['auto', 'neutral', 'happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised'].includes(v.emotion) ? v.emotion : 'happy',
      speed: Number(v.speed) || 1,
      pitch: parseInt(v.pitch) || 0,
      english_normalization: false,
      sample_rate: 32000,
      bitrate: 128000,
      channel: 'mono',
      language_boost: 'Portuguese'
    };
    console.log('Audio input being sent:', JSON.stringify(input, null, 2));
    const r = await axios.post('https://api.replicate.com/v1/models/minimax/speech-02-hd/predictions', { input }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
      }
    });
    const pred = r.data;
    const url = await waitForReplicate(pred.urls.get);
    if (!url) return res.status(500).json({ error: 'audio_generation_failed' });
    res.json({ url });
  } catch (err) {
    console.error('Audio error:', err?.response?.data || err?.message || err);
    res.status(500).json({ error: 'audio_generation_failed', detail: err?.response?.data || err?.message });
  }
});

app.post('/api/replicate/video', async (req, res) => {
  try {
    if (!REPLICATE_API_TOKEN) return res.status(500).json({ error: 'missing REPLICATE_API_TOKEN' });
    const image = req.body?.imageUrl;
    const audio = req.body?.audioUrl;
    if (!image || !audio) return res.status(400).json({ error: 'missing image or audio' });
    const r = await axios.post('https://api.replicate.com/v1/models/bytedance/omni-human/predictions', { input: { image, audio } }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
      }
    });
    const pred = r.data;
    const url = await waitForReplicate(pred.urls.get);
    if (!url) return res.status(500).json({ error: 'video_generation_failed' });
    res.json({ url });
  } catch (err) {
    console.error('Video error:', err?.response?.data || err?.message || err);
    res.status(500).json({ error: 'video_generation_failed', detail: err?.response?.data || err?.message });
  }
});

async function waitForReplicate(getUrl) {
  for (let i = 0; i < 120; i++) {
    const r = await axios.get(getUrl, { headers: { 'Authorization': `Token ${REPLICATE_API_TOKEN}` } });
    const pred = r.data;
    const s = pred.status;
    if (s === 'succeeded') {
      const out = pred.output;
      if (Array.isArray(out)) return out[0];
      if (typeof out === 'string') return out;
      if (out && out.url) return out.url;
      return null;
    }
    if (s === 'failed' || s === 'canceled') return null;
    await new Promise(r => setTimeout(r, 1000));
  }
  return null;
}

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});


