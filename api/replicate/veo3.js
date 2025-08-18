import axios from 'axios';

async function waitForReplicate(getUrl, replicateToken) {
  for (let i = 0; i < 120; i++) {
    const r = await axios.get(getUrl, { 
      headers: { 'Authorization': `Token ${replicateToken}` } 
    });
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

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    if (!REPLICATE_API_TOKEN) return res.status(500).json({ error: 'missing REPLICATE_API_TOKEN' });
    
    const prompt = req.body?.prompt;
    if (!prompt) return res.status(400).json({ error: 'missing prompt' });
    
    const input = {
      prompt: prompt,
      aspect_ratio: '16:9',
      duration: 8
    };
    
    console.log('Veo3 input being sent:', JSON.stringify(input, null, 2));
    const r = await axios.post('https://api.replicate.com/v1/models/google/veo-3-fast/predictions', { input }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
      }
    });
    
    const pred = r.data;
    const url = await waitForReplicate(pred.urls.get, REPLICATE_API_TOKEN);
    if (!url) return res.status(500).json({ error: 'veo3_generation_failed' });
    
    res.json({ url });
  } catch (err) {
    console.error('Veo3 error:', err?.response?.data || err?.message || err);
    res.status(500).json({ error: 'veo3_generation_failed', detail: err?.response?.data || err?.message });
  }
}
