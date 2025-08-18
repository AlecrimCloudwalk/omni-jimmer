const BRAND_GREEN = "#c1f732";
const BRAND_PURPLE = "#c87ef7";
const IS_LOCAL = (
  location.hostname === 'localhost' ||
  location.hostname === '127.0.0.1' ||
  location.protocol === 'file:'
);
const IS_VERCEL = location.hostname.includes('vercel.app');
const IS_GITHUB_PAGES = location.hostname.includes('github.io');

// API endpoints - detect deployment platform
const API_BASE = IS_LOCAL ? 'http://localhost:8787' : '/api';

// For GitHub Pages, we'll use direct API calls
const GITHUB_PAGES_MODE = IS_GITHUB_PAGES || (!IS_LOCAL && !IS_VERCEL);

// API Key Management Functions - Make them globally accessible
window.saveOpenAIKey = function() {
  const key = document.getElementById('openaiKeyInput').value.trim();
  if (key) {
    localStorage.setItem('openai_api_key', key);
    alert('OpenAI API key saved!');
    document.getElementById('openaiKeyInput').value = '';
    checkApiKeysAndHideNotice();
  }
}

window.saveReplicateKey = function() {
  const key = document.getElementById('replicateKeyInput').value.trim();
  if (key) {
    localStorage.setItem('replicate_api_key', key);
    alert('Replicate API key saved!');
    document.getElementById('replicateKeyInput').value = '';
    checkApiKeysAndHideNotice();
  }
}

window.hideApiNotice = function() {
  document.getElementById('apiKeyNotice').style.display = 'none';
}

function checkApiKeysAndHideNotice() {
  const hasOpenAI = localStorage.getItem('openai_api_key');
  const hasReplicate = localStorage.getItem('replicate_api_key');
  if (hasOpenAI && hasReplicate) {
    hideApiNotice();
  }
}

function showApiNoticeIfNeeded() {
  if (GITHUB_PAGES_MODE) {
    const hasOpenAI = localStorage.getItem('openai_api_key');
    const hasReplicate = localStorage.getItem('replicate_api_key');
    if (!hasOpenAI || !hasReplicate) {
      document.getElementById('apiKeyNotice').style.display = 'block';
      // Pre-fill keys if they exist
      if (hasOpenAI) document.getElementById('openaiKeyInput').value = '••••••••';
      if (hasReplicate) document.getElementById('replicateKeyInput').value = '••••••••';
    }
  }
}

const CNAE_OPTIONS = [
  "5611-2/01 - Restaurante",
  "4721-1/02 - Padaria",
  "4781-4/00 - Loja de Roupas",
  "9602-5/01 - Salão de Beleza",
  "4711-3/02 - Mercado/Supermercado",
  "4771-7/01 - Farmácia",
  "4520-0/01 - Oficina Mecânica",
  "4789-0/05 - Pet Shop",
  "8630-5/02 - Clínica Odontológica",
  "4761-0/01 - Papelaria",
  "5612-1/00 - Food Truck",
  "0161-0/01 - Agricultura (Plantação)",
  "4789-0/01 - Barraca de Praia",
  "8593-7/00 - Ensino de Idiomas",
  "9329-8/99 - Personal Trainer (Parque)",
  "4635-4/02 - Distribuidora de Bebidas",
  "7490-1/04 - Fotógrafo",
  "4744-0/01 - Loja de Materiais",
  "9491-0/00 - Organização Religiosa",
  "8630-5/01 - Clínica Médica",
  "4753-9/00 - Ótica",
  "4713-0/02 - Loja de Calçados",
  "4712-1/00 - Posto de Combustível",
  "9602-5/02 - Barbearia",
  "4729-6/99 - Loja de Eletrônicos",
  "5620-1/03 - Lanchonete",
  "0162-8/01 - Floricultura",
  "4632-0/01 - Atacadista",
  "9001-9/99 - Academia de Dança",
  "8650-0/02 - Consultório Veterinário",
  "4789-0/02 - Loja de Artesanato",
  "5620-1/04 - Açaíteria",
  "4789-0/03 - Loja de Perfumes",
  "5611-2/03 - Pizzaria",
  "4757-1/00 - Loja de Livros",
  "4772-5/00 - Loja de Suplementos",
  "8630-5/03 - Fisioterapia",
  "9602-5/03 - Manicure/Pedicure",
  "4789-0/04 - Loja de Presentes",
  "5611-2/04 - Sorveteria",
  "4713-0/03 - Loja de Bolsas",
  "4789-0/06 - Joalheria",
  "5620-1/05 - Hamburgueria",
  "4744-0/02 - Loja de Tintas",
  "9329-8/01 - Academia de Ginástica",
  "4789-0/07 - Loja de Móveis",
  "5611-2/05 - Confeitaria",
  "4637-1/01 - Distribuidora de Doces",
  "4789-0/08 - Loja de Decoração",
  "8511-2/00 - Escola Particular",
  "9602-5/04 - Estética e Cosméticos",
  "4789-0/09 - Loja de Informática",
  "5620-1/06 - Tapiocaria",
  "4713-0/04 - Loja de Acessórios",
  "9319-1/99 - Crossfit",
  "4789-0/10 - Loja de Brinquedos"
];

const REGIONS = {
  "Sudeste": ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Campinas", "Santos", "Ribeirão Preto", "Sorocaba", "Niterói", "Juiz de Fora", "Uberlândia", "Contagem", "São Bernardo do Campo", "Santo André", "Osasco", "Guarulhos"],
  "Sul": ["Curitiba", "Porto Alegre", "Florianópolis", "Londrina", "Maringá", "Pelotas", "Caxias do Sul", "Joinville", "Blumenau", "Ponta Grossa", "Cascavel", "Foz do Iguaçu"],
  "Nordeste": ["Salvador", "Recife", "Fortaleza", "João Pessoa", "Natal", "Maceió", "Aracaju", "São Luís", "Teresina", "Feira de Santana", "Caruaru", "Mossoró", "Vitória da Conquista", "Campina Grande", "Juazeiro do Norte"],
  "Centro-Oeste": ["Brasília", "Goiânia", "Cuiabá", "Campo Grande", "Anápolis", "Rondonópolis", "Várzea Grande", "Aparecida de Goiânia", "Dourados"],
  "Norte": ["Manaus", "Belém", "Porto Velho", "Macapá", "Rio Branco", "Boa Vista", "Palmas", "Santarém", "Ananindeua", "Marabá"],
};

const ETHNICITIES = [
  "parda, pele morena, traços mistos",
  "negra, pele escura, traços afrodescendentes",
  "branca, pele clara, traços europeus",
  "morena, pele bronzeada, traços brasileiros típicos",
  "negra retinta, pele bem escura, cabelos crespos",
  "parda clara, pele amorenada, cabelos ondulados",
  "asiática, descendente japonesa, traços orientais",
  "indígena, traços nativos brasileiros",
  "mulata, pele dourada, traços afro-brasileiros",
  "cafuza, mistura indígena e africana, pele acobreada"
];

const GENDER_BY_CNAE = {
  "Oficina Mecânica": "male",
  "Auto Peças": "male",
  "Auto Center": "male",
  "Salão de Beleza": "female",
  "Loja de Roupas": "female",
};

// API keys are now handled server-side via environment variables

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
const productCalloutEl = document.getElementById("productCallout");

const shuffleBtn = document.getElementById("shuffleBtn");
const generateBtn = document.getElementById("generateBtn");
const enableImageEl = document.getElementById("enableImage");
const enableVeo3El = document.getElementById("enableVeo3");

const imageStatus = document.getElementById("imageStatus");
const veo3Status = document.getElementById("veo3Status");
const imageContainer = document.getElementById("imageContainer");
const veo3Container = document.getElementById("veo3Container");
const videoOverlay = document.getElementById("videoOverlay");
const imagePromptEl = document.getElementById("imagePrompt");
const veo3PromptEl = document.getElementById("veo3Prompt");
const previewImageRadio = document.getElementById("previewImage");
const previewVideoRadio = document.getElementById("previewVideo");
const videoAudioToggle = document.getElementById("videoAudioToggle");

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

  // API keys are handled server-side, no localStorage needed

  shuffleBtn.addEventListener("click", onShuffle);
  generateBtn.addEventListener("click", onGenerate);

  // Preview mode switching
  previewImageRadio.addEventListener("change", updatePreviewMode);
  previewVideoRadio.addEventListener("change", updatePreviewMode);
  videoAudioToggle.addEventListener("change", updateVideoAudio);

  // No API card hiding needed since it's removed from HTML
}

function updateCities() {
  const region = regionEl.value || Object.keys(REGIONS)[0];
  cityEl.innerHTML = "";
  (REGIONS[region] || []).forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c; opt.textContent = c; cityEl.appendChild(opt);
  });
}

function getRandomFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomEthnicity() {
  return getRandomFromArray(ETHNICITIES);
}

function getRandomClothingColor() {
  const random = Math.random();
  if (random < 0.8) {
    // 80% - preto ou branco
    return Math.random() < 0.5 ? "roupa preta" : "roupa branca";
  } else if (random < 0.9) {
    // 10% - roxo da marca
    return "roupa roxa (#c87ef7)";
  } else {
    // 10% - verde da marca  
    return "roupa verde (#c1f732)";
  }
}

function updatePreviewMode() {
  if (!videoOverlay) return;
  
  const showImage = previewImageRadio.checked;
  const videoPlaceholder = videoOverlay.querySelector('.video-placeholder');
  
  if (showImage) {
    // Show the generated image in the preview
    const imageInCenter = imageContainer.querySelector('img');
    if (imageInCenter && videoPlaceholder) {
      videoPlaceholder.innerHTML = '';
      const previewImg = document.createElement('img');
      previewImg.src = imageInCenter.src;
      previewImg.style.width = '100%';
      previewImg.style.height = '100%';
      previewImg.style.objectFit = 'cover';
      videoPlaceholder.appendChild(previewImg);
    }
  } else {
    // Show the generated video in the preview (if available)
    const videoInCenter = veo3Container.querySelector('video');
    if (videoInCenter && videoPlaceholder) {
      videoPlaceholder.innerHTML = '';
      const previewVideo = document.createElement('video');
      previewVideo.src = videoInCenter.src;
      previewVideo.muted = !videoAudioToggle.checked; // Use audio toggle state
      previewVideo.loop = true;
      previewVideo.autoplay = true;
      previewVideo.style.width = '100%';
      previewVideo.style.height = '100%';
      previewVideo.style.objectFit = 'cover';
      previewVideo.id = 'previewVideoElement'; // Add ID for audio control
      videoPlaceholder.appendChild(previewVideo);
    }
  }
}

function updateVideoAudio() {
  const previewVideo = document.getElementById('previewVideoElement');
  if (previewVideo) {
    previewVideo.muted = !videoAudioToggle.checked;
  }
}

// Simular animação do carrossel
function animateCarousel() {
  const indicators = document.querySelectorAll('.indicator');
  if (indicators.length === 0) return;
  
  let currentIndex = 0;
  
  setInterval(() => {
    // Remove active de todos
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    // Adiciona active no atual
    indicators[currentIndex].classList.add('active');
    
    // Próximo índice
    currentIndex = (currentIndex + 1) % indicators.length;
  }, 2000); // Muda a cada 2 segundos
}

// Iniciar animação quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(animateCarousel, 1000); // Inicia após 1 segundo
  showApiNoticeIfNeeded(); // Show API key notice if on GitHub Pages
});

async function onShuffle() {
  try {
    const res = await fetch("./clients.sample.json");
    const list = await res.json();
    const sample = list[Math.floor(Math.random() * list.length)];
    
    // Add random time of day for variance
    const timesOfDay = ['Amanhecer', 'Meio-dia ensolarado', 'Final de tarde', 'Anoitecer', 'Noite'];
    const randomTime = timesOfDay[Math.floor(Math.random() * timesOfDay.length)];
    
    fillForm(sample);
    
    // Store random time for prompt generation
    window.randomTimeOfDay = randomTime;
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

// API key functions removed - handled server-side

async function onGenerate() {
  // API keys are handled server-side, no validation needed

  lockUI(true);
  clearOutputs();

  const profile = buildUserProfile();
  const promptResult = await callOpenAIForPrompts(profile);
  if (!promptResult) {
    lockUI(false);
    return;
  }

  // ALWAYS display prompts regardless of checkbox status
  displayPrompts(promptResult);

  // Generate based on checkbox selections
  const promises = [];
  
  if (enableImageEl.checked) {
    imageStatus.innerHTML = '🎨 Generating image… <img src="https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif" style="width: 20px; height: 20px; vertical-align: middle;">';
    promises.push(generateImage(promptResult.image_prompt));
  } else {
    imageStatus.textContent = "Disabled (checkbox unchecked)";
    promises.push(Promise.resolve(null));
  }
  
  if (enableVeo3El.checked) {
    if (veo3Status) veo3Status.innerHTML = '🎬 Generating video… <img src="https://media.giphy.com/media/xTkcEQACH24SMPxIQg/giphy.gif" style="width: 20px; height: 20px; vertical-align: middle;">';
    promises.push(generateVeo3Video(promptResult.video_prompt));
  } else {
    if (veo3Status) veo3Status.textContent = "Disabled (checkbox unchecked)";
    promises.push(Promise.resolve(null));
  }
  
  const [imageUrl, veo3Url] = await Promise.all(promises);
  
  console.log('Generation complete:', { 
    imageUrl: !!imageUrl, 
    veo3Url: !!veo3Url,
    imageEnabled: enableImageEl.checked,
    veo3Enabled: enableVeo3El.checked
  });

  lockUI(false);
}

function lockUI(disabled) {
  generateBtn.disabled = disabled;
  shuffleBtn.disabled = disabled;
}

function clearOutputs() {
  imageContainer.innerHTML = "";
  if (veo3Container) veo3Container.innerHTML = "";
  imagePromptEl.innerHTML = "";
  if (veo3PromptEl) veo3PromptEl.innerHTML = "";
  imagePromptEl.classList.remove("show");
  if (veo3PromptEl) veo3PromptEl.classList.remove("show");
  imageStatus.textContent = "Waiting…";
  if (veo3Status) veo3Status.textContent = "Waiting…";
}

function displayPrompts(promptResult) {
  // Always show image prompt
  imagePromptEl.textContent = `Image Prompt:\n${promptResult.image_prompt}`;
  imagePromptEl.classList.add("show");
  
  // Always show video prompt  
  if (veo3PromptEl) {
    veo3PromptEl.textContent = `Veo3 Video Prompt:\n${promptResult.video_prompt}`;
    veo3PromptEl.classList.add("show");
  }
  
  // Update overlay text in the app preview
  updateOverlayText(promptResult.overlay_text, promptResult.button_text);
}

function updateOverlayText(overlayText, buttonText) {
  // Update the text overlay in the app preview
  const textOverlay = document.querySelector('.text-overlay p');
  const ctaButton = document.querySelector('.cta-button');
  
  if (textOverlay && overlayText) {
    textOverlay.textContent = overlayText;
  }
  
  if (ctaButton && buttonText) {
    ctaButton.textContent = buttonText;
  }
  
  // Update the display boxes in center column
  const overlayTextDisplay = document.getElementById('overlayTextDisplay');
  const buttonTextDisplay = document.getElementById('buttonTextDisplay');
  
  if (overlayTextDisplay && overlayText) {
    overlayTextDisplay.textContent = overlayText;
  }
  
  if (buttonTextDisplay && buttonText) {
    buttonTextDisplay.textContent = buttonText;
  }
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
    productCallout: productCalloutEl.value.trim() || "JIM assistente virtual no app",
  };
}

async function callOpenAIForPrompts(profile) {
  try {
    const randomEthnicity = getRandomEthnicity();
    const randomClothing = getRandomClothingColor();
    
    const system = `Você é um roteirista e especialista em criação de prompts descritivos para geração de imagens e vídeos realistas em estilo POV (primeira pessoa) e selfie vlog com ultra realismo, 4K, efeitos sonoros integrados e coerência narrativa.

Sua tarefa é criar **dois prompts cinematográficos em português** para cada cliente:
1. Um para IMAGEM (pessoa segurando celular em selfie)
2. Um para VÍDEO Veo3 (pessoa falando para câmera)

⚠️ ALERTA CRÍTICO DE COMPLIANCE: NUNCA use dados pessoais reais (nomes, empresas). Crie SEMPRE personagens genéricos anônimos. Impersonation é proibida por lei.

RETORNE JSON com 'image_prompt' e 'video_prompt'.`;
    const brand = `Generate two separate cinematic prompts: one for image and one for video.`;
    const user = {
      instruction: "Create two separate cinematic prompts in Portuguese: one for image generation and one for video generation about promoting Dinn AI assistant to business owners.",
      constraints: {
        language: "pt-BR",
        videoModel: "google/veo-3-fast",
        imageModel: "bytedance/seedream-3",
      },
      profile,
      outputs: [
        "image_prompt",
        "video_prompt",
        "overlay_text",
        "button_text"
      ],
      brand,
      ethnicity: randomEthnicity,
      rules: [
        "CRÍTICO: NUNCA use nomes pessoais reais. NUNCA diga 'sou [nome]' ou 'meu nome é [nome]'. Use apenas 'Oi!' ou 'Olá!'.",
        "CRÍTICO: NUNCA use nomes de empresas reais. NUNCA mencione o nome da loja/empresa do cliente. Use termos genéricos como 'uma loja', 'um estabelecimento', 'uma empresa'.",
        "CRÍTICO: NUNCA use 'o personagem' - use 'uma mulher', 'um homem', etc. para evitar personagens de anime.",
        "CRÍTICO: SEM LETREIROS - Nunca inclua placas, letreiros, nomes de lojas, textos visíveis ou escritas de qualquer tipo nas descrições.",
        `HORÁRIOS: Use preferencialmente '${window.randomTimeOfDay || 'Meio-dia ensolarado'}' ou horários naturais similares como 'Seis horas da manhã', 'Final de tarde', 'Início da manhã'`,
        "AMBIENTES EXTERNOS: Para atividades ao ar livre, use pontos turísticos da cidade (Cristo Redentor-RJ, Elevador Lacerda-Salvador, Avenida Paulista-SP, Pelourinho-Salvador, Pão de Açúcar-RJ, etc.)",
        `ETNIA OBRIGATÓRIA: Use sempre '${randomEthnicity}' para garantir diversidade racial brasileira`,
        "",
        "ESTRUTURA PARA IMAGE_PROMPT:",
        "1. HORÁRIO + AMBIENTAÇÃO: '[horário do dia], interior/exterior do local baseado no CNAE, descrição cinematográfica'",
        `2. PERSONAGEM: 'Uma mulher/Um homem brasileiro(a) de [idade] anos, [etnia], [cidade/região], [aparência detalhada], ${randomClothing}.'`,
        "3. CÂMERA: 'Foto estilo selfie, perspectiva de primeira pessoa, ângulo de selfie, sem câmera visível.'",
        "",
        "ESTRUTURA PARA VIDEO_PROMPT:",  
        "1. HORÁRIO + AMBIENTAÇÃO: '[horário do dia], mesmo ambiente da imagem'",
        `2. PERSONAGEM: 'Uma mulher/Um homem brasileiro(a) de [idade] anos, [etnia], [cidade/região], [aparência detalhada], ${randomClothing}.'`,
        "3. CÂMERA: 'Foto estilo selfie, perspectiva de primeira pessoa, ângulo de selfie, sem câmera visível. Com a câmera Selfie VLOG, próxima ao rosto. Câmera subjetiva, POV.'",
        `4. FALA: 'fala da pessoa: "Oi! Aqui em [cidade], ${profile.productCallout || 'o Dinn'} está revolucionando os negócios! Vem usar você também!"'`,
        "",
        "Exemplo de estrutura:",
        "IMAGE: 'Meio-dia ensolarado, exterior de uma loja de roupas em Salvador, cercada por clientes e com vitrines exibindo vestidos leves e coloridos, sem letreiros visíveis. Uma mulher brasileira de 35 anos, parda, pele morena, Salvador BA, cabelos castanhos escuros e olhos castanhos, vestindo um vestido florido. Foto estilo selfie, perspectiva de primeira pessoa, ângulo de selfie, sem câmera visível.'",
        `VIDEO: 'Oito horas da noite, interior de uma loja brasileira aconchegante, com produtos organizados e ambiente acolhedor, sem letreiros visíveis. Uma mulher brasileira de 30 anos, negra, pele escura, São Paulo SP, cabelos crespos pretos e olhos castanhos. Foto estilo selfie, perspectiva de primeira pessoa, ângulo de selfie, sem câmera visível. Com a câmera Selfie VLOG, próxima ao rosto. Câmera subjetiva, POV.\\n\\nfala da pessoa: "Oi! Aqui em São Paulo, ${profile.productCallout || 'o Dinn'} está revolucionando os negócios! Vem usar você também!"'`,
        `OUTDOOR: 'Meio-dia ensolarado, em frente ao Cristo Redentor no Rio de Janeiro, movimento de turistas ao fundo. Um homem brasileiro de 40 anos, moreno, pele bronzeada, Rio de Janeiro RJ, personal trainer, roupas esportivas. Foto estilo selfie, perspectiva de primeira pessoa, ângulo de selfie, sem câmera visível. Com a câmera Selfie VLOG, próxima ao rosto. Câmera subjetiva, POV.\\n\\nfala da pessoa: "Oi! Aqui no Rio, ${profile.productCallout || 'o Dinn'} está ajudando profissionais como eu! Experimenta aí!"'`,
        "",
        "RETORNE JSON com 'image_prompt', 'video_prompt', 'overlay_text' (máximo 15 chars) e 'button_text' (máximo 12 chars) seguindo essas estruturas exatas.",
        "",
        "OVERLAY_TEXT: OBRIGATÓRIO 2 linhas exatas separadas por \\n. Exemplos: 'Pagamento de contas\\ne boletos', 'Indique a InfinitePay\\ne ganhe R$ 50', 'Gestão de Cobrança\\ninteligente', 'Emitir boletos\\ngratuitamente', 'Transforme seu celular\\nem uma maquininha', 'Cartão virtual gratuito\\ne sem anuidade'.",
        "BUTTON_TEXT: Texto do botão call-to-action. Exemplos: 'Pagar contas', 'Indicar agora', 'Começar a usar', 'Saber mais'.",
      ],
    };

    let json;
    
    if (GITHUB_PAGES_MODE) {
      // Direct OpenAI API call for GitHub Pages
      const openaiKey = localStorage.getItem('openai_api_key');
      if (!openaiKey) {
        showApiNoticeIfNeeded();
        throw new Error('Please provide your OpenAI API key using the key input above');
      }
      
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: promptTemplate.rules.join('\n') }],
          temperature: 0.8
        })
      });
      if (!r.ok) throw new Error(`OpenAI API error: ${await r.text()}`);
      const openaiResponse = await r.json();
      try {
        json = JSON.parse(openaiResponse.choices[0].message.content);
      } catch (e) {
        throw new Error('Failed to parse OpenAI response as JSON');
      }
    } else {
      // Use serverless function (Vercel/local)
      const endpoint = `${API_BASE}/gpt/prompts`;
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: profile })
      });
      if (!r.ok) {
        const t = await r.text();
        throw new Error(`Prompt generation error: ${t}`);
      }
      json = await r.json();
    }

    // Ensure we have both prompts with correct structure
    if (!json.image_prompt) {
      const city = profile.city || 'Brasil';
      json.image_prompt = `Meio da tarde, interior de uma loja brasileira moderna, iluminação natural, ao fundo produtos e clientes, sem letreiros visíveis. Uma pessoa brasileira de aparência simpática, ${randomEthnicity}, ${city}. Foto estilo selfie, perspectiva de primeira pessoa, ângulo de selfie, sem câmera visível.`;
    }
    
    if (!json.video_prompt) {
      const city = profile.city || 'sua cidade';
      const product = profile.productCallout || 'o Dinn';
      json.video_prompt = `Meio da tarde, interior de uma loja brasileira moderna, iluminação natural, ao fundo produtos e clientes, sem letreiros visíveis. Uma pessoa brasileira de aparência simpática, ${randomEthnicity}, ${city}. Foto estilo selfie, perspectiva de primeira pessoa, ângulo de selfie, sem câmera visível. Com a câmera Selfie VLOG, próxima ao rosto. Câmera subjetiva, POV.

fala da pessoa: "Oi! Aqui em ${city}, ${product} está ajudando empresários a revolucionar seus negócios! Vem usar você também!"`;
    }
    
    // Add default overlay and button text if not provided
    if (!json.overlay_text) {
      json.overlay_text = "Tap to Pay\nno iPhone";
    }
    if (!json.button_text) {
      json.button_text = "Começar a usar";
    }
    
    // Apply pronunciation improvements to video_prompt only
    if (json.video_prompt) {
      json.video_prompt = json.video_prompt
        .replace(/\bJIM\b/g, 'Din')
        .replace(/\bInfinitePay\b/g, 'Infinitipêi');
    }
    
    // Set default voice metadata  
    json.voice_metadata = {
      text: `Com ${profile.productCallout || 'o Dinn'}, consigo entender melhor as vendas e facilitar os pagamentos digitais para os meus clientes!`,
      voice_id: 'Wise_Woman',
      emotion: 'happy',
      speed: 1.5,
      pitch: 0,
      language_boost: 'Portuguese',
      english_normalization: false
    };
    
    // Debug log to see what OpenAI returned
    console.log('OpenAI returned voice_metadata:', json.voice_metadata);
    return json;
  } catch (e) {
    console.error(e);
    alert(`OpenAI prompt generation failed: ${e?.message || e}`);
    return null;
  }
}

async function generateImage(imagePrompt) {
  try {
    const finalPrompt = imagePrompt; // Use the generated Portuguese prompt directly
    
    // Prompt is already displayed by displayPrompts() function
    
    const body = {
      version: "bytedance/seedream-3",
      input: {
              prompt: finalPrompt,
      aspect_ratio: "16:9",
      size: "regular",
      guidance_scale: 5.0
      }
    };
         // Status is already set by caller function
     
     let imageUrl;
     if (GITHUB_PAGES_MODE) {
       // Direct Replicate API call with CORS proxy for GitHub Pages
       const replicateKey = localStorage.getItem('replicate_api_key');
       if (!replicateKey) {
         showApiNoticeIfNeeded();
         throw new Error('Please provide your Replicate API key using the key input above');
       }
       
       // Use CORS proxy for Replicate API (try multiple proxies for reliability)
       const proxies = [
         'https://api.allorigins.win/raw?url=',
         'https://corsproxy.io/?',
         'https://cors-anywhere.herokuapp.com/'
       ];
       const proxyUrl = proxies[0]; // Start with first proxy
       const replicateUrl = encodeURIComponent('https://api.replicate.com/v1/models/bytedance/seedream-3/predictions');
       
       const r = await fetch(proxyUrl + replicateUrl, {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${replicateKey}`,
           'Content-Type': 'application/json'
         },
         body: JSON.stringify(body)
       });
       if (!r.ok) throw new Error(await r.text());
       const prediction = await r.json();
       
       // Poll for completion
       let result = prediction;
       while (result.status === 'starting' || result.status === 'processing') {
         await new Promise(resolve => setTimeout(resolve, 2000));
         const pollUrl = proxyUrl + encodeURIComponent(result.urls.get);
         const pollR = await fetch(pollUrl, {
           headers: { 'Authorization': `Bearer ${replicateKey}` }
         });
         result = await pollR.json();
       }
       
       if (result.status === 'succeeded') {
         imageUrl = result.output[0];
       } else {
         throw new Error('Image generation failed');
       }
     } else {
       // Use serverless function (Vercel/local)
       const endpoint = `${API_BASE}/replicate/image`;
       const r = await fetch(endpoint, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ prompt: finalPrompt })
       });
       if (!r.ok) throw new Error(await r.text());
       const j = await r.json();
       imageUrl = j.url;
     }
    if (imageUrl) {
      const img = document.createElement("img");
      img.src = imageUrl;
      imageContainer.innerHTML = "";
      imageContainer.appendChild(img);
      const a = document.createElement("a");
      a.href = imageUrl; a.download = "image.png"; a.textContent = "📥 Download";
      a.className = "download-btn";
      imageContainer.appendChild(a);
      imageStatus.textContent = "Done.";
      
      // Update preview if showing image
      updatePreviewMode();
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



async function generateVeo3Video(videoPrompt) {
  try {
    // Prompt is already displayed by displayPrompts() function
         // Status is already set by caller function
     
     let videoUrl;
     if (GITHUB_PAGES_MODE) {
       // Direct Replicate API call with CORS proxy for GitHub Pages
       const replicateKey = localStorage.getItem('replicate_api_key');
       if (!replicateKey) {
         showApiNoticeIfNeeded();
         throw new Error('Please provide your Replicate API key using the key input above');
       }
       
       // Use CORS proxy for Replicate API - Veo3 model (try multiple proxies for reliability)
       const proxies = [
         'https://api.allorigins.win/raw?url=',
         'https://corsproxy.io/?',
         'https://cors-anywhere.herokuapp.com/'
       ];
       const proxyUrl = proxies[0]; // Start with first proxy
       const replicateUrl = encodeURIComponent('https://api.replicate.com/v1/models/tencent/hunyuan-video/predictions');
       
       const body = {
         input: {
           prompt: videoPrompt,
           seed: Math.floor(Math.random() * 1000000),
           video_length: "2s",
           flow_shift: 7
         }
       };
       
       const r = await fetch(proxyUrl + replicateUrl, {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${replicateKey}`,
           'Content-Type': 'application/json'
         },
         body: JSON.stringify(body)
       });
       if (!r.ok) throw new Error(await r.text());
       const prediction = await r.json();
       
       // Poll for completion
       let result = prediction;
       while (result.status === 'starting' || result.status === 'processing') {
         await new Promise(resolve => setTimeout(resolve, 5000)); // Longer wait for video
         const pollUrl = proxyUrl + encodeURIComponent(result.urls.get);
         const pollR = await fetch(pollUrl, {
           headers: { 'Authorization': `Bearer ${replicateKey}` }
         });
         result = await pollR.json();
       }
       
       if (result.status === 'succeeded') {
         videoUrl = result.output;
       } else {
         throw new Error('Video generation failed');
       }
     } else {
       // Use serverless function (Vercel/local)
       const endpoint = `${API_BASE}/replicate/veo3`;
       const r = await fetch(endpoint, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ prompt: videoPrompt })
       });
       if (!r.ok) throw new Error(await r.text());
       const j = await r.json();
       videoUrl = j.url;
     }
    if (videoUrl && veo3Container) {
      const video = document.createElement("video");
      video.controls = true;
      video.src = videoUrl;
      veo3Container.innerHTML = "";
      veo3Container.appendChild(video);
      const a = document.createElement("a");
      a.href = videoUrl; a.download = "veo3-video.mp4"; a.textContent = "📥 Download";
      a.className = "download-btn";
      veo3Container.appendChild(a);
      
      // Update preview based on current mode
      updatePreviewMode();
      
      if (veo3Status) veo3Status.textContent = "Done.";
    } else {
      if (veo3Status) veo3Status.textContent = "Veo3 video generation failed.";
    }
    return videoUrl;
  } catch (e) {
    console.error(e);
    if (veo3Status) veo3Status.textContent = "Veo3 video generation failed.";
    return null;
  }
}

// Polling function removed - handled server-side


