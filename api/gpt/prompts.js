import axios from 'axios';

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
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not found in environment');
      return res.status(500).json({ error: 'missing OPENAI_API_KEY' });
    }
    
    const profile = req.body?.profile || {};
    const randomEthnicity = getRandomEthnicity();
    
    console.log('Processing request with profile:', JSON.stringify(profile, null, 2));
    console.log('Random ethnicity selected:', randomEthnicity);
    
    const system = `Você é um roteirista e especialista em criação de prompts descritivos para geração de imagens e vídeos realistas em estilo POV (primeira pessoa) e selfie vlog com ultra realismo, 4K, efeitos sonoros integrados e coerência narrativa.

Sua tarefa é criar **dois prompts cinematográficos em português** para cada cliente:
1. Um para IMAGEM (pessoa segurando celular em selfie)
2. Um para VÍDEO Veo3 (pessoa falando para câmera)

⚠️ ALERTA CRÍTICO DE COMPLIANCE: NUNCA use dados pessoais reais (nomes, empresas). Crie SEMPRE personagens genéricos anônimos. Impersonation é proibida por lei.

RETORNE JSON com 'image_prompt', 'video_prompt', 'overlay_text' (máximo 15 chars) e 'button_text' (máximo 12 chars).`;

    const user = {
      instruction: 'Create two separate cinematic prompts in Portuguese: one for image generation and one for video generation about promoting Dinn AI assistant to business owners.',
      constraints: {
        language: 'pt-BR',
        videoModel: 'google/veo-3-fast',
        imageModel: 'bytedance/seedream-3',
      },
      profile,
      outputs: ['image_prompt', 'video_prompt', 'overlay_text', 'button_text'],
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
        '4. FALA: \'fala da pessoa: "Oi! Aqui em [cidade], o Dinn está revolucionando..."\'',
        '',
        'RETORNE JSON com \'image_prompt\', \'video_prompt\', \'overlay_text\' (máximo 15 chars) e \'button_text\' (máximo 12 chars) seguindo essas estruturas exatas.',
        '',
        'OVERLAY_TEXT: Texto curto para sobreposição no vídeo (ex: \'Tap to Pay\', \'Pix Rápido\', \'Vendas+\').',
        'BUTTON_TEXT: Texto do botão call-to-action (ex: \'Começar\', \'Usar agora\', \'Testar\').',
      ],
    };

    console.log('Making OpenAI API call...');
    const r = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `Respond ONLY with JSON. No markdown. Use ethnicity: "${randomEthnicity}". User Profile and instructions: ${JSON.stringify(user)}` },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      timeout: 30000 // 30 second timeout
    });

    console.log('OpenAI API call successful');
    const data = r.data;
    const content = data.choices?.[0]?.message?.content || '{}';
    console.log('OpenAI response content:', content);
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
    
    // Add default overlay and button text if not provided
    if (!json.overlay_text) {
      json.overlay_text = "Tap to Pay\nno iPhone";
    }
    if (!json.button_text) {
      json.button_text = "Começar a usar";
    }
    
    res.json(json);
  } catch (err) {
    console.error('GPT error:', err?.response?.data || err?.message || err);
    res.status(500).json({ error: 'prompt_generation_failed', detail: err?.response?.data || err?.message });
  }
}
