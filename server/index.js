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
    const brand = `Brand visual style: cinematic, photorealistic, natural daylight; shot with mobile phone camera POV, 25mm lens equivalent, shallow depth of field; 100% neutral and natural tones only. Composition: POV from mobile phone camera - business owner holding phone at arm's length speaking directly into the camera lens, medium close-up shot from phone perspective; MANDATORY: background must clearly show the specific Brazilian city/region through recognizable landmarks, architecture, local flora, or cultural elements typical of that location.`;
    const user = {
      instruction: 'Create prompts for image and voice targeting the BUSINESS OWNER (lojista) about using Dinn AI assistant.',
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
        'Audio should speak TO the business owner about using Dinn (InfinitePay\'s AI assistant) to improve sales, get insights, help with digital payments, etc.',
        'HEAVILY emphasize city/region context in both image and script',
        'CRITICAL: The person in the image and the voice MUST be the same gender - if image shows a woman, voice must be female; if image shows a man, voice must be male',
        'Image should show the business owner as the main focus, with regional/local context in background',
        'Audio tone: encouraging, helpful, focused on business growth',
        'Frame the person prominently - they are speaking directly to the camera/user',
        'IMPORTANT: Character must be looking DIRECTLY into the camera lens, making eye contact with viewer',
        'CRITICAL: POV shot from mobile phone camera perspective - person holding phone at arm\'s length speaking into the camera',
        'CRITICAL: DO NOT include any specific business names, store names, or person names in the image prompt',
        'Composition: mobile phone POV, 25mm equivalent lens, person looking directly at phone camera lens',
        'AVOID any text, writing, signs with words, or readable text in the image - focus on visual elements only',
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

    // STRICT gender consistency and faster speech
    const detectedGender = json.person?.gender || profile.gender || '';
    let voiceId;
    
    // FORCE strict gender matching
    if (detectedGender === 'female' || detectedGender.includes('female') || detectedGender.includes('woman')) {
      voiceId = 'Friendly_Person'; // Always female voice for female characters
    } else if (detectedGender === 'male' || detectedGender.includes('male') || detectedGender.includes('man')) {
      voiceId = 'Deep_Voice_Man'; // Always male voice for male characters
    } else {
      voiceId = 'Friendly_Person'; // Default to female
    }
    
    json.voice_metadata = json.voice_metadata || {};
    json.voice_metadata.voice_id = voiceId; // Override whatever OpenAI suggested
    json.voice_metadata.emotion = json.voice_metadata.emotion || 'happy';
    json.voice_metadata.speed = json.voice_metadata.speed || 1.3; // Faster speech
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


