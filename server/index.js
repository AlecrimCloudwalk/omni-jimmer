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

// SECURITY FIX: Restrict CORS to allowed origins
const allowedOrigins = [
  'https://alecrimcloudwalk.github.io',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
];

app.use(cors({ 
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

if (!OPENAI_API_KEY) console.warn('WARN: Missing OPENAI_API_KEY in .env');
if (!REPLICATE_API_TOKEN) console.warn('WARN: Missing REPLICATE_API_TOKEN in .env');

const BRAND_GREEN = '#c1f732';
const BRAND_PURPLE = '#c87ef7';

const ETHNICITIES = [
  'parda, pele morena, traços mistos',
  'negra, pele escura, traços afrodescendentes',
  'branca, pele clara, traços europeus',
  'morena, pele bronzeada, traços brasileiros típicos',
  'negra retinta, pele bem escura, cabelos crespos',
  'parda clara, pele amorenada, cabelos ondulados',
  'asiática, descendente japonesa, traços orientais',
  'indígena, traços nativos brasileiros',
  'mulata, pele dourada, traços afro-brasileiros',
  'cafuza, mistura indígena e africana, pele acobreada'
];

function getRandomEthnicity() {
  return ETHNICITIES[Math.floor(Math.random() * ETHNICITIES.length)];
}

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/api/gpt/prompts', async (req, res) => {
  try {
    if (!OPENAI_API_KEY) return res.status(500).json({ error: 'missing OPENAI_API_KEY' });
    const profile = req.body?.profile || {};
    const randomEthnicity = getRandomEthnicity();
    
    console.log('Random ethnicity selected:', randomEthnicity);
    
    const system = `Você é um roteirista e especialista em criação de prompts descritivos para geração de imagens e vídeos realistas em estilo POV (primeira pessoa) e selfie vlog com ultra realismo, 4K, efeitos sonoros integrados e coerência narrativa.

Sua tarefa é criar **dois prompts cinematográficos em português** para cada cliente:
1. Um para IMAGEM (pessoa segurando celular em selfie)
2. Um para VÍDEO Veo3 (pessoa falando para câmera)

⚠️ ALERTA CRÍTICO DE COMPLIANCE: NUNCA use dados pessoais reais (nomes, empresas). Crie SEMPRE personagens genéricos anônimos. Impersonation é proibida por lei.

RETORNE JSON com 'image_prompt' e 'video_prompt'.`;
    const brand = `Generate two separate cinematic prompts: one for image and one for video.`;
    const user = {
      instruction: 'Create two separate cinematic prompts in Portuguese: one for image generation and one for video generation about promoting Dinn AI assistant to business owners.',
      constraints: {
        language: 'pt-BR',
        videoModel: 'google/veo-3-fast',
        imageModel: 'bytedance/seedream-3',
      },
      profile,
      outputs: [
        'image_prompt',
        'video_prompt'
      ],
      brand,
      ethnicity: randomEthnicity,
      rules: [
        'CRÍTICO: NUNCA use nomes pessoais reais. NUNCA diga \'sou [nome]\' ou \'meu nome é [nome]\'. Use apenas \'Oi!\' ou \'Olá!\'.',
        'CRÍTICO: NUNCA use nomes de empresas reais. NUNCA mencione o nome da loja/empresa do cliente. Use termos genéricos como \'uma loja\', \'um estabelecimento\', \'uma empresa\'.',
        'CRÍTICO: NUNCA use \'o personagem\' - use \'uma mulher\', \'um homem\', etc. para evitar personagens de anime.',
        'CRÍTICO: SEM LETREIROS - Nunca inclua placas, letreiros, nomes de lojas, textos visíveis ou escritas de qualquer tipo nas descrições.',
        'HORÁRIOS: Use horários naturais como \'Seis horas da manhã\', \'Meio-dia ensolarado\', \'Oito horas da noite\', \'Final de tarde\', \'Início da manhã\'',
        'AMBIENTES EXTERNOS: Para atividades ao ar livre, use pontos turísticos da cidade (Cristo Redentor-RJ, Elevador Lacerda-Salvador, Avenida Paulista-SP, Pelourinho-Salvador, Pão de Açúcar-RJ, etc.)',
        `ETNIA OBRIGATÓRIA: Use sempre '${randomEthnicity}' para garantir diversidade racial brasileira`,
        '',
        'ESTRUTURA PARA IMAGE_PROMPT:',
        '1. HORÁRIO + AMBIENTAÇÃO: \'[horário do dia], interior/exterior do local baseado no CNAE, descrição cinematográfica\'',
        '2. PERSONAGEM: \'Uma mulher/Um homem brasileiro(a) de [idade] anos, [etnia], [cidade/região], [aparência detalhada].\'',
        '3. CÂMERA: \'Foto estilo selfie, perspectiva de primeira pessoa, ângulo de selfie, sem câmera visível.\'',
        '',
        'ESTRUTURA PARA VIDEO_PROMPT:',  
        '1. HORÁRIO + AMBIENTAÇÃO: \'[horário do dia], mesmo ambiente da imagem\'',
        '2. PERSONAGEM: \'Uma mulher/Um homem brasileiro(a) de [idade] anos, [etnia], [cidade/região], [aparência detalhada].\'',
        '3. CÂMERA: \'Com a câmera Selfie VLOG, próxima ao rosto. Câmera subjetiva, POV.\'',
        '4. FALA: \'fala da pessoa: \"Oi! Aqui em [cidade], o Dinn está revolucionando...\"\'',
        '',
        'Exemplo de estrutura:',
        'IMAGE: \'Meio-dia ensolarado, exterior de uma loja de roupas em Salvador, cercada por clientes e com vitrines exibindo vestidos leves e coloridos, sem letreiros visíveis. Uma mulher brasileira de 35 anos, parda, pele morena, Salvador BA, cabelos castanhos escuros e olhos castanhos, vestindo um vestido florido. Foto estilo selfie, perspectiva de primeira pessoa, ângulo de selfie, sem câmera visível.\'',
        'VIDEO: \'Oito horas da noite, interior de uma loja brasileira aconchegante, com produtos organizados e ambiente acolhedor, sem letreiros visíveis. Uma mulher brasileira de 30 anos, negra, pele escura, São Paulo SP, cabelos crespos pretos e olhos castanhos. Com a câmera Selfie VLOG, próxima ao rosto. Câmera subjetiva, POV.\\n\\nfala da pessoa: \"Oi! Aqui em São Paulo, o Dinn está revolucionando os negócios!\"\'',
        'OUTDOOR: \'Meio-dia ensolarado, em frente ao Cristo Redentor no Rio de Janeiro, movimento de turistas ao fundo. Um homem brasileiro de 40 anos, moreno, pele bronzeada, Rio de Janeiro RJ, personal trainer, roupas esportivas. Com a câmera Selfie VLOG, próxima ao rosto. Câmera subjetiva, POV.\\n\\nfala da pessoa: \"Oi! Aqui no Rio, o Dinn está ajudando profissionais como eu!\"\'',
        '',
        'RETORNE JSON com \'image_prompt\' e \'video_prompt\' seguindo essas estruturas exatas.',
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

    // Ensure we have both prompts with correct structure
    if (!json.image_prompt) {
      const city = profile.city || 'Brasil';
      json.image_prompt = `Meio da tarde, interior de uma loja brasileira moderna, iluminação natural, ao fundo produtos e clientes, sem letreiros visíveis. Uma pessoa brasileira de aparência simpática, ${randomEthnicity}, ${city}. Foto estilo selfie, perspectiva de primeira pessoa, ângulo de selfie, sem câmera visível.`;
    }
    
    if (!json.video_prompt) {
      const city = profile.city || 'sua cidade';
      json.video_prompt = `Meio da tarde, interior de uma loja brasileira moderna, iluminação natural, ao fundo produtos e clientes. Uma pessoa brasileira de aparência simpática, ${randomEthnicity}, ${city}. Com a câmera Selfie VLOG, próxima ao rosto. Câmera subjetiva, POV.

fala da pessoa: "Oi! Aqui em ${city}, o Dinn está ajudando empresários a revolucionar seus negócios!"`;
    }
    
    // Note: voice_metadata kept for compatibility but not used

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
      guidance_scale: 5.0,
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

// DEPRECATED: Audio and OmniHuman routes kept for compatibility but not used in simplified pipeline
// app.post('/api/replicate/audio', ...) 
// app.post('/api/replicate/video', ...)

app.post('/api/replicate/veo3', async (req, res) => {
  try {
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
    const url = await waitForReplicate(pred.urls.get);
    if (!url) return res.status(500).json({ error: 'veo3_generation_failed' });
    res.json({ url });
  } catch (err) {
    console.error('Veo3 error:', err?.response?.data || err?.message || err);
    res.status(500).json({ error: 'veo3_generation_failed', detail: err?.response?.data || err?.message });
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


