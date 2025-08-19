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
  console.log('saveOpenAIKey called'); // Debug
  try {
    const input = document.getElementById('openaiKeyInput');
    console.log('Input element:', input); // Debug
    const key = input ? input.value.trim() : '';
    console.log('Key length:', key.length); // Debug
    if (key) {
      SecurityUtils.secureStore('openai_api_key', key);
      alert('OpenAI API key saved!');
      input.value = '';
      checkApiKeysAndHideNotice();
    } else {
      alert('Please enter a valid OpenAI API key');
    }
  } catch (e) {
    console.error('Error in saveOpenAIKey:', e);
    alert('Error saving API key: ' + e.message);
  }
}

window.saveReplicateKey = function() {
  console.log('saveReplicateKey called'); // Debug
  try {
    const input = document.getElementById('replicateKeyInput');
    console.log('Input element:', input); // Debug
    const key = input ? input.value.trim() : '';
    console.log('Key length:', key.length); // Debug
    if (key) {
      SecurityUtils.secureStore('replicate_api_key', key);
      alert('Replicate API key saved!');
      input.value = '';
      checkApiKeysAndHideNotice();
    } else {
      alert('Please enter a valid Replicate API key');
    }
  } catch (e) {
    console.error('Error in saveReplicateKey:', e);
    alert('Error saving API key: ' + e.message);
  }
}

window.hideApiNotice = function() {
  console.log('hideApiNotice called'); // Debug
  try {
    const notice = document.getElementById('apiKeyNotice');
    if (notice) {
      notice.style.display = 'none';
    }
  } catch (e) {
    console.error('Error in hideApiNotice:', e);
  }
}

window.pasteCombinedKeys = function() {
  const combinedInput = document.getElementById('combinedKeys');
  const combined = combinedInput.value.trim();
  
  if (!combined) {
    alert('❌ Please paste the combined keys (openai_key,replicate_key)');
    return;
  }
  
  const keys = combined.split(',').map(k => k.trim());
  if (keys.length !== 2) {
    alert('❌ Please use format: openai_key,replicate_key\n\nExample:\nsk-proj-abc123...,r8_xyz789...');
    return;
  }
  
  const [openaiKey, replicateKey] = keys;
  
  // Enhanced validation with better error messages
  if (!openaiKey.startsWith('sk-')) {
    alert('❌ OpenAI key format error!\n\n✅ Should start with "sk-" (usually "sk-proj-...")\n❌ Your key starts with: "' + openaiKey.substring(0, 10) + '..."');
    return;
  }
  
  if (!replicateKey.startsWith('r8_')) {
    alert('❌ Replicate key format error!\n\n✅ Should start with "r8_"\n❌ Your key starts with: "' + replicateKey.substring(0, 10) + '..."');
    return;
  }
  
  // Additional length validation
  if (openaiKey.length < 50) {
    alert('❌ OpenAI key seems too short!\n\n✅ Should be 50+ characters\n❌ Your key is only ' + openaiKey.length + ' characters');
    return;
  }
  
  if (replicateKey.length < 40) {
    alert('❌ Replicate key seems too short!\n\n✅ Should be 40+ characters\n❌ Your key is only ' + replicateKey.length + ' characters');
    return;
  }
  
  SecurityUtils.secureStore('openai_api_key', openaiKey);
  SecurityUtils.secureStore('replicate_api_key', replicateKey);
  
  // Update the individual input fields
  document.getElementById('openaiKeyInput').value = openaiKey;
  document.getElementById('replicateKeyInput').value = replicateKey;
  
  combinedInput.value = '';
  alert('✅ Both keys saved successfully!\n\n🎯 Ready to generate!\n\n📋 Debug: F12 → Console to see detailed logs');
  checkApiKeysAndHideNotice();
}

window.copyCombinedKeys = function() {
  const openaiKey = SecurityUtils.secureRetrieve('openai_api_key') || '';
  const replicateKey = SecurityUtils.secureRetrieve('replicate_api_key') || '';
  
  if (!openaiKey || !replicateKey) {
    alert('Both keys must be saved first');
    return;
  }
  
  const combined = `${openaiKey},${replicateKey}`;
  
  navigator.clipboard.writeText(combined).then(() => {
    alert('Combined keys copied to clipboard!');
  }).catch(() => {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = combined;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('Combined keys copied to clipboard!');
  });
}

window.clearAllKeys = function() {
  console.log('clearAllKeys called'); // Debug
  try {
    SecurityUtils.secureClear('openai_api_key');
    SecurityUtils.secureClear('replicate_api_key');
    
    // Clear the input fields
    const openaiInput = document.getElementById('openaiKeyInput');
    const replicateInput = document.getElementById('replicateKeyInput');
    if (openaiInput) openaiInput.value = '';
    if (replicateInput) replicateInput.value = '';
    
    alert('All API keys cleared! You can now enter new keys.');
    
    // Show the notice again if it was hidden
    showApiNoticeIfNeeded();
  } catch (e) {
    console.error('Error in clearAllKeys:', e);
    alert('Error clearing keys: ' + e.message);
  }
}

function checkApiKeysAndHideNotice() {
  const hasOpenAI = SecurityUtils.secureRetrieve('openai_api_key');
  const hasReplicate = SecurityUtils.secureRetrieve('replicate_api_key');
  if (hasOpenAI && hasReplicate) {
    hideApiNotice();
  }
}

function showApiNoticeIfNeeded() {
  if (GITHUB_PAGES_MODE) {
    const hasOpenAI = SecurityUtils.secureRetrieve('openai_api_key');
    const hasReplicate = SecurityUtils.secureRetrieve('replicate_api_key');
    if (!hasOpenAI || !hasReplicate) {
      document.getElementById('apiKeyNotice').style.display = 'block';
      // Pre-fill keys if they exist
      if (hasOpenAI) document.getElementById('openaiKeyInput').value = '••••••••';
      if (hasReplicate) document.getElementById('replicateKeyInput').value = '••••••••';
    }
  }
}

const CNAE_OPTIONS = [
  "1623-9/01 - Marcenaria",
  "1813-0/01 - Gráfica",
  "2391-5/01 - Marmoraria",
  "2511-0/00 - Serralheria",
  "4520-0/01 - Oficina Mecânica",
  "4520-0/03 - Oficina de Motos",
  "4520-0/04 - Borracharia",
  "4637-1/01 - Distribuidora de Doces",
  "4711-3/02 - Supermercado",
  "4721-1/02 - Padaria",
  "4722-9/01 - Açougue",
  "4724-5/00 - Frutaria",
  "4757-1/00 - Loja de Livros",
  "4759-8/01 - Loja de Móveis",
  "4763-6/03 - Loja de Esportes",
  "4771-7/01 - Farmácia",
  "4781-4/00 - Loja de Roupas",
  "4782-2/01 - Loja de Calçados",
  "4789-0/03 - Loja de Perfumes",
  "4789-0/04 - Ótica",
  "4789-0/06 - Joalheria",
  "4789-0/07 - Papelaria",
  "4789-0/08 - Pet Shop",
  "4789-0/09 - Loja de Informática",
  "4789-0/10 - Loja de Brinquedos",
  "4789-0/11 - Loja de Instrumentos",
  "4789-0/12 - Floricultura",
  "4789-0/13 - Loja de Celulares",
  "4789-0/14 - Loja de Bicicletas",
  "4789-0/15 - Loja de Artesanato",
  "4930-2/01 - Transportadora",
  "5110-2/00 - Taxi Aéreo",
  "5510-8/02 - Pousada",
  "5611-2/01 - Churrascaria",
  "5611-2/02 - Restaurante",
  "5611-2/03 - Pizzaria",
  "5611-2/04 - Sorveteria",
  "5611-2/05 - Confeitaria",
  "5611-2/07 - Restaurante Japonês",
  "5620-1/03 - Lanchonete",
  "5620-1/04 - Açaíteria",
  "5620-1/05 - Hamburgueria",
  "5620-1/06 - Tapiocaria",
  "5620-1/07 - Casa de Sucos",
  "6911-7/01 - Escritório de Advocacia",
  "7500-1/00 - Clínica Veterinária",
  "7722-2/00 - Locadora",
  "8511-2/00 - Escola Particular",
  "8511-2/01 - Creche",
  "8549-2/00 - Autoescola",
  "8592-9/01 - Escola de Dança",
  "8593-7/00 - Escola de Idiomas",
  "8630-5/01 - Odontologia",
  "8630-5/03 - Fisioterapia",
  "8630-5/04 - Psicologia",
  "8630-5/05 - Laboratório",
  "8630-5/06 - Nutrição",
  "8630-5/07 - Acupuntura",
  "9319-1/01 - Studio de Pilates",
  "9319-1/99 - Crossfit",
  "9329-8/01 - Academia de Ginástica",
  "9511-8/00 - Assistência Técnica",
  "9601-7/01 - Lavanderia",
  "9602-5/01 - Salão de Beleza",
  "9602-5/02 - Barbearia",
  "9602-5/04 - Estética e Cosméticos",
  "9609-2/06 - Studio de Tatuagem"
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
const enableSeededitEl = document.getElementById("enableSeededit");
const useStartFrameEl = document.getElementById("useStartFrame");
const enableVeo3El = document.getElementById("enableVeo3");
const totalPriceEl = document.getElementById("totalPrice");

const imageStatus = document.getElementById("imageStatus");
const seededitStatus = document.getElementById("seededitStatus");
const veo3Status = document.getElementById("veo3Status");
const imageContainer = document.getElementById("imageContainer");
const seededitContainer = document.getElementById("seededitContainer");
const veo3Container = document.getElementById("veo3Container");
const videoOverlay = document.getElementById("videoOverlay");
const imagePromptEl = document.getElementById("imagePrompt");
const veo3PromptEl = document.getElementById("veo3Prompt");
const previewImageRadio = document.getElementById("previewImage");
const previewEditedRadio = document.getElementById("previewEdited");
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
  previewEditedRadio.addEventListener("change", updatePreviewMode);
  previewVideoRadio.addEventListener("change", updatePreviewMode);
  videoAudioToggle.addEventListener("change", updateVideoAudio);

  // Pricing calculation event listeners
  if (enableImageEl) enableImageEl.addEventListener('change', updatePricing);
  if (enableSeededitEl) enableSeededitEl.addEventListener('change', updatePricing);
  if (enableVeo3El) enableVeo3El.addEventListener('change', updatePricing);
  if (useStartFrameEl) useStartFrameEl.addEventListener('change', updatePricing);

  // Initialize pricing
  updatePricing();

  // No API card hiding needed since it's removed from HTML
}

// Profile toggle function  
window.toggleProfile = function() {
  console.log('toggleProfile called');
  const profileSection = document.querySelector('.profile-section');
  if (profileSection) {
    profileSection.classList.toggle('collapsed');
    console.log('Profile collapsed state:', profileSection.classList.contains('collapsed'));
  } else {
    console.error('Profile section not found');
  }
}

// Pricing calculation
function updatePricing() {
  let total = 0;
  
  if (enableImageEl && enableImageEl.checked) {
    total += 0.03; // Seedream
  }
  
  if (enableSeededitEl && enableSeededitEl.checked) {
    total += 0.03; // Seededit
  }
  
  if (enableVeo3El && enableVeo3El.checked) {
    total += 3.20; // Veo3 Fast
  }
  
  // Start frame is free, no cost
  
  if (totalPriceEl) {
    totalPriceEl.textContent = `$${total.toFixed(2)}`;
  }
}

function updateCities() {
  const region = regionEl.value || Object.keys(REGIONS)[0];
  cityEl.innerHTML = "";
  (REGIONS[region] || []).forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c; opt.textContent = c; cityEl.appendChild(opt);
  });
}

// Better random seed generation
function generateBetterRandomSeed() {
  if (window.crypto && window.crypto.getRandomValues) {
    const randomArray = new Uint32Array(1);
    window.crypto.getRandomValues(randomArray);
    return randomArray[0] % 1000000;
  } else {
    // Fallback with better entropy
    return Math.floor((Math.random() * Date.now()) % 1000000);
  }
}

// Generate seed variation based on master seed for different models
function generateSeedVariation(masterSeed, variation) {
  // Create predictable but different seeds for each model based on master
  const hash = (masterSeed + variation) * 9973; // Large prime for distribution
  return Math.abs(hash) % 1000000;
}

function getRandomFromArray(array) {
  if (window.crypto && window.crypto.getRandomValues) {
    const randomArray = new Uint32Array(1);
    window.crypto.getRandomValues(randomArray);
    return array[randomArray[0] % array.length];
  } else {
    return array[Math.floor(Math.random() * array.length)];
  }
}

function getRandomEthnicity() {
  return getRandomFromArray(ETHNICITIES);
}

function getRandomClothingColor() {
  const random = Math.random();
  
  if (random < 0.75) {
    // 75% - black, white, or tan
    const neutralColors = [
      "roupa preta", 
      "roupa branca", 
      "roupa bege claro", 
      "roupa marrom claro", 
      "roupa creme",
      "roupa off-white"
    ];
    return neutralColors[Math.floor(Math.random() * neutralColors.length)];
    
  } else if (random < 0.87) {
    // 12% - purple hues (soft, pale, lilac, lavender)
    const purpleColors = [
      "roupa lilás suave",
      "roupa lavanda pálida", 
      "roupa roxo claro",
      "roupa violeta suave",
      "roupa lilás pastel",
      "roupa lavanda delicada"
    ];
    return purpleColors[Math.floor(Math.random() * purpleColors.length)];
    
  } else {
    // 12% - green tones (soft lime, avocado, pale green)
    const greenColors = [
      "roupa verde lima suave",
      "roupa verde abacate", 
      "roupa verde claro",
      "roupa verde menta pálido",
      "roupa verde lima pálido",
      "roupa verde pistache suave"
    ];
    return greenColors[Math.floor(Math.random() * greenColors.length)];
  }
}

function updatePreviewMode() {
  if (!videoOverlay) return;
  
  const showImage = previewImageRadio.checked;
  const showEdited = previewEditedRadio.checked;
  const showVideo = previewVideoRadio.checked;
  const videoPlaceholder = videoOverlay.querySelector('.video-placeholder');
  
  if (showImage) {
    // Show the original generated image in the preview
    const imageInCenter = imageContainer.querySelector('img');
    if (imageInCenter && videoPlaceholder) {
      videoPlaceholder.innerHTML = '';
      videoPlaceholder.className = 'video-placeholder with-content'; // Add class for content centering
      const previewImg = document.createElement('img');
      previewImg.src = imageInCenter.src;
      previewImg.style.width = '100%';
      previewImg.style.height = '100%';
      previewImg.style.objectFit = 'cover';
      videoPlaceholder.appendChild(previewImg);
    }
  } else if (showEdited) {
    // Show the edited image in the preview
    const editedImageInCenter = seededitContainer.querySelector('img');
    if (editedImageInCenter && videoPlaceholder) {
      videoPlaceholder.innerHTML = '';
      videoPlaceholder.className = 'video-placeholder with-content'; // Add class for content centering
      const previewImg = document.createElement('img');
      previewImg.src = editedImageInCenter.src;
      previewImg.style.width = '100%';
      previewImg.style.height = '100%';
      previewImg.style.objectFit = 'cover';
      videoPlaceholder.appendChild(previewImg);
    }
  } else if (showVideo) {
    // Show the generated video in the preview (if available)
    const videoInCenter = veo3Container.querySelector('video');
    if (videoInCenter && videoPlaceholder) {
      videoPlaceholder.innerHTML = '';
      videoPlaceholder.className = 'video-placeholder with-content'; // Add class for content centering
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
    } else {
      // No video available, show placeholder
      videoPlaceholder.className = 'video-placeholder'; // Reset to default for placeholder text
      videoPlaceholder.innerHTML = '<span>Generated video will appear here</span>';
    }
  } else {
    // Default case - show placeholder
    if (videoPlaceholder) {
      videoPlaceholder.className = 'video-placeholder'; // Reset to default for placeholder text
      videoPlaceholder.innerHTML = '<span>Generated video will appear here</span>';
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
    // Prevent rapid clicking
    if (shuffleBtn.disabled) return;
    shuffleBtn.disabled = true;
    shuffleBtn.textContent = "Shuffling...";
    
    // Add cache-busting timestamp for better randomization
    const timestamp = Date.now();
    const res = await fetch(`./clients.sample.json?t=${timestamp}`);
    const list = await res.json();
    
    // Better randomization: use crypto.getRandomValues if available, fallback to Math.random
    let randomIndex;
    if (window.crypto && window.crypto.getRandomValues) {
      const randomArray = new Uint32Array(1);
      window.crypto.getRandomValues(randomArray);
      randomIndex = randomArray[0] % list.length;
    } else {
      randomIndex = Math.floor(Math.random() * list.length);
    }
    
    const sample = list[randomIndex];
    console.log(`🎲 Shuffled profile ${randomIndex}/${list.length}:`, sample.businessName, '-', sample.ownerName);
    
    // Add random time of day for variance
    const timesOfDay = ['Amanhecer', 'Meio-dia ensolarado', 'Final de tarde', 'Anoitecer', 'Noite'];
    const randomTime = timesOfDay[Math.floor(Math.random() * timesOfDay.length)];
    
    fillForm(sample);
    
    // Store random time for prompt generation
    window.randomTimeOfDay = randomTime;
    
    // Re-enable button after a short delay
    setTimeout(() => {
      shuffleBtn.disabled = false;
      shuffleBtn.textContent = "🎲 Shuffle";
    }, 1000);
  } catch (e) {
    console.error(e);
    shuffleBtn.disabled = false;
    shuffleBtn.textContent = "🎲 Shuffle";
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
  // Check authentication first
  if (window.cloudwalkAuth && !window.cloudwalkAuth.requireAuth()) {
    return;
  }

  // Pre-flight checks for GitHub Pages mode
  if (GITHUB_PAGES_MODE) {
    console.log('🔍 Pre-flight Check:');
    console.log('• User:', window.cloudwalkAuth?.user?.email || 'Not authenticated');
    console.log('• Mode: GitHub Pages');
    
    // Check if user is authenticated with Supabase (preferred method)
    if (window.cloudwalkAuth?.isAuthenticated && window.cloudwalkAuth?.user?.accessToken) {
      console.log('🔑 Using Supabase authenticated session - server-side API keys');
      // Will use Supabase Edge Functions with server-side keys
    } else {
      // Fallback to client-side API keys with security warning
      console.warn('⚠️ SECURITY WARNING: Using client-side API keys as fallback');
      
      const openaiKey = SecurityUtils.secureRetrieve('openai_api_key');
      const replicateKey = SecurityUtils.secureRetrieve('replicate_api_key');
      
      if (!openaiKey || !replicateKey) {
        alert('❌ Missing API Keys!\n\n🔐 Please sign in with your Cloudwalk account for secure server-side API handling,\n\nOR provide client-side keys as fallback:\n• OpenAI: https://platform.openai.com/api-keys\n• Replicate: https://replicate.com/account/api-tokens\n\n⚠️ Client-side keys are less secure');
        showApiNoticeIfNeeded();
        return;
      }
    }
  } else {
    console.log('🔍 Mode: Serverless (Vercel/Local)');
  }

  // Generate MASTER SEED for this generation cycle
  const masterSeed = generateBetterRandomSeed();
  console.log(`🎲 MASTER SEED for this generation: ${masterSeed}`);
  
  // Store master seed globally for this generation cycle
  window.currentMasterSeed = masterSeed;

  lockUI(true);
  clearOutputs();

  const profile = buildUserProfile();
  console.log('🔍 Profile data being sent to OpenAI:', profile); // Debug
  const promptResult = await callOpenAIForPrompts(profile);
  if (!promptResult) {
    lockUI(false);
    return;
  }

  // ALWAYS display prompts regardless of checkbox status
  displayPrompts(promptResult);

  // Generate based on checkbox selections in proper order: image, seededit, video
  let imageUrl = null;
  let editedImageUrl = null;
  let veo3Url = null;
  
  // Step 1: Generate image first if needed
  if (enableImageEl.checked) {
    imageStatus.innerHTML = '🎨 Generating image (~30s)… <img src="https://media.giphy.com/media/xTkcEQACH24SMPxIQg/giphy.gif" style="width: 20px; height: 20px; vertical-align: middle;">';
    // Add loading GIF to image container
    imageContainer.innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 200px; flex-direction: column;"><img src="https://media.giphy.com/media/xTkcEQACH24SMPxIQg/giphy.gif" style="width: 80px; height: 80px;"><p style="margin-top: 10px; color: #a8a8ad; font-size: 14px;">Generating image...</p></div>';
    imageUrl = await generateImage(promptResult.image_prompt);
  } else {
    imageStatus.textContent = "Disabled (checkbox unchecked)";
  }
  
  // Step 2: Remove text from image if needed and image was generated
  if (enableSeededitEl.checked && imageUrl) {
    if (seededitStatus) seededitStatus.innerHTML = '🔧 Removing text (~45s)… <img src="https://media.giphy.com/media/xTkcEQACH24SMPxIQg/giphy.gif" style="width: 20px; height: 20px; vertical-align: middle;">';
    // Add loading GIF to seededit container
    if (seededitContainer) seededitContainer.innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 200px; flex-direction: column;"><img src="https://media.giphy.com/media/xTkcEQACH24SMPxIQg/giphy.gif" style="width: 80px; height: 80px;"><p style="margin-top: 10px; color: #a8a8ad; font-size: 14px;">Removing text...</p></div>';
    editedImageUrl = await generateSeededit(imageUrl);
  } else if (enableSeededitEl.checked && !imageUrl) {
    if (seededitStatus) seededitStatus.textContent = "No image to process (image generation disabled or failed)";
  } else {
    if (seededitStatus) seededitStatus.textContent = "Disabled (checkbox unchecked)";
  }
  
  // Step 3: Generate video with or without start frame
  if (enableVeo3El.checked) {
    if (veo3Status) veo3Status.innerHTML = '🎬 Generating video (~3-5 min)… <img src="https://media.giphy.com/media/xTkcEQACH24SMPxIQg/giphy.gif" style="width: 20px; height: 20px; vertical-align: middle;">';
    // Add loading GIF to video container
    if (veo3Container) veo3Container.innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 200px; flex-direction: column;"><img src="https://media.giphy.com/media/xTkcEQACH24SMPxIQg/giphy.gif" style="width: 80px; height: 80px;"><p style="margin-top: 10px; color: #a8a8ad; font-size: 14px;">Generating video...</p></div>';
    
    // Use start frame: prefer edited image, fallback to original image
    let startFrameUrl = null;
    if (useStartFrameEl.checked) {
      startFrameUrl = editedImageUrl || imageUrl;
    }
    
    veo3Url = await generateVeo3Video(promptResult.video_prompt, startFrameUrl);
  } else {
    if (veo3Status) veo3Status.textContent = "Disabled (checkbox unchecked)";
  }
  
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
  // Set placeholder content for image and video containers
  imageContainer.innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 200px; color: #666; font-size: 14px;">Image will appear here</div>';
  if (seededitContainer) seededitContainer.innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 200px; color: #666; font-size: 14px;">Text removed image will appear here</div>';
  if (veo3Container) veo3Container.innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 200px; color: #666; font-size: 14px;">Video will appear here</div>';
  
  imagePromptEl.innerHTML = "";
  if (veo3PromptEl) veo3PromptEl.innerHTML = "";
  imagePromptEl.classList.remove("show");
  if (veo3PromptEl) veo3PromptEl.classList.remove("show");
  imageStatus.textContent = "Waiting…";
  if (seededitStatus) seededitStatus.textContent = "Waiting…";
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
    console.log('🎯 OpenAI prompt generation for profile:', profile); // Debug
    console.log('📝 CNAE:', profile.cnae);
    console.log('👤 Dono:', profile.ownerName, '| Gênero:', profile.gender);
    console.log('🏙️ Local:', profile.city, profile.region);
    
    // Randomize time of day for each generation
    const timesOfDay = ['Amanhecer', 'Meio-dia ensolarado', 'Final de tarde', 'Anoitecer', 'Noite'];
    const randomTimeOfDay = timesOfDay[Math.floor(Math.random() * timesOfDay.length)];
    
    // Random video text templates with varied themes (~20 words each)
    const videoTexts = [
      `Iaí pessoal! Aqui em {city}, {product} triplicou meu faturamento! Negócio que era difícil ficou super fácil!`,
      `Bom dia galera! {product} mudou tudo aqui em {city}! Agora consigo focar no que realmente importa: crescer!`,
      `E aí! Desde que comecei a usar {product} em {city}, meus clientes ficaram impressionados com a praticidade!`,
      `Oi gente! {product} é o futuro dos negócios aqui em {city}! Quem não usar vai ficar pra trás!`,
      `Salve! Meu negócio em {city} explodiu depois que descobri {product}! Agora tudo funciona no automático!`,
      `Eaí galera! {product} economizou tanto tempo aqui em {city} que sobra pra família! Vale cada centavo!`,
      `Opa! Todo empresário de {city} deveria conhecer {product}! Minha vida de empreendedor nunca foi tão tranquila!`,
      `Beleza! Com {product} aqui em {city}, consegui automatizar coisas que antes davam muito trabalho! Sensacional!`,
      `E aí pessoal! {product} é tipo ter um assistente pessoal 24h aqui em {city}! Revolucionou meu dia!`,
      `Oi! Quem tem negócio em {city} precisa conhecer {product}! Meus resultados melhoraram em todas as áreas!`,
      `Olá! {product} transformou meu negócio em {city} numa máquina de fazer dinheiro! Recomendo demais!`,
      `Iaí! Antes de usar {product} em {city}, eu vivia estressado. Hoje meu negócio roda sozinho!`,
      `Salve galera! {product} deixou meu negócio em {city} tão organizado que até sobra tempo pra inovar!`,
      `Opa pessoal! Desde que uso {product} aqui em {city}, meus concorrentes perguntam qual é meu segredo!`,
      `E aí! {product} é a melhor decisão que tomei pro meu negócio em {city}! Mudança total de vida!`,
      `Beleza galera! Com {product}, meu negócio em {city} cresceu tanto que tive que contratar mais gente!`,
      `Oi! {product} fez meu negócio em {city} funcionar 10x melhor! Agora sim sou um empreendedor de verdade!`,
      `Iaí pessoal! {product} é como ter superpoderes para negócios aqui em {city}! Eficiência no máximo!`,
      `Salve! Todo mundo em {city} quer saber como meu negócio cresceu tanto! A resposta é {product}!`,
      `E aí galera! {product} transformou meu negócio em {city} de sobrevivência pra sucesso! Incrível mesmo!`
    ];
    const randomVideoText = videoTexts[Math.floor(Math.random() * videoTexts.length)];
    console.log('🌅 Horário randomizado:', randomTimeOfDay); // Debug
    
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
        `HORÁRIOS: Use preferencialmente '${randomTimeOfDay}' ou horários naturais similares como 'Seis horas da manhã', 'Final de tarde', 'Início da manhã'`,
        "AMBIENTES EXTERNOS: Para atividades ao ar livre, use pontos turísticos da cidade (Cristo Redentor-RJ, Elevador Lacerda-Salvador, Avenida Paulista-SP, Pelourinho-Salvador, Pão de Açúcar-RJ, etc.)",
        `ETNIA OBRIGATÓRIA: Use sempre '${randomEthnicity}' para garantir diversidade racial brasileira`,
        `CIDADE OBRIGATÓRIA: Use sempre '${profile.city}' (SEM região) - NUNCA use outras cidades como Rio, São Paulo, Salvador, etc.`,
        `CNAE DO CLIENTE: ${profile.cnae || 'negócio genérico'} - USE O TIPO ESPECÍFICO DE NEGÓCIO (joalheria, marcenaria, restaurante, etc.)`,
        `GÊNERO DA PESSOA: ${profile.gender || 'Auto'} - NOME DO DONO: "${profile.ownerName}" - Se for nome masculino (João, Carlos, Rodrigo, etc.), use "Um homem brasileiro". Se feminino (Maria, Ana, etc.), use "Uma mulher brasileira". OBRIGATÓRIO analisar o nome!`,
        "",
        "ESTRUTURA PARA IMAGE_PROMPT:",
        `1. HORÁRIO + AMBIENTAÇÃO: '[horário do dia], interior/exterior de uma ${profile.cnae ? profile.cnae.split(' - ')[1] || 'loja' : 'loja'} em ${profile.city}, ${profile.region}, descrição cinematográfica, sem letreiros visíveis'`,
        `2. PERSONAGEM: 'Um(a) proprietário(a) brasileiro(a) de [idade] anos, [etnia], ${profile.city}, ${profile.region}, [aparência detalhada], ${randomClothing}.'`,
        "3. CÂMERA: 'Foto estilo selfie, perspectiva de primeira pessoa, ângulo de selfie, sem câmera visível.'",
        "",
        "ESTRUTURA PARA VIDEO_PROMPT:",  
        `1. HORÁRIO + AMBIENTAÇÃO: '[horário do dia], mesmo ambiente da imagem na ${profile.cnae ? profile.cnae.split(' - ')[1] || 'loja' : 'loja'} em ${profile.city}, ${profile.region}'`,
        `2. PERSONAGEM: 'Um(a) proprietário(a) brasileiro(a) de [idade] anos, [etnia], ${profile.city}, ${profile.region}, [aparência detalhada], ${randomClothing}.'`,
        "3. CÂMERA: 'Foto estilo selfie, perspectiva de primeira pessoa, ângulo de selfie, sem câmera visível. Com a câmera Selfie VLOG, próxima ao rosto. Câmera subjetiva, POV.'",
        `4. FALA: 'fala da pessoa: "${randomVideoText.replace('{city}', profile.city).replace('{product}', profile.productCallout || 'o Dinn')}"'`,
        "",
        `Exemplo de estrutura (USE OS DADOS EXATOS DO PERFIL):`,
        `IMAGE: '${randomTimeOfDay}, exterior de uma ${profile.cnae ? profile.cnae.split(' - ')[1] || 'loja' : 'loja'} em ${profile.city}, ${profile.region}, ambiente brasileiro, sem letreiros visíveis. Um(a) proprietário(a) brasileiro(a) de [idade] anos, ${randomEthnicity}, ${profile.city}, ${profile.region}, [aparência detalhada], ${randomClothing}. Foto estilo selfie, perspectiva de primeira pessoa, ângulo de selfie, sem câmera visível.'`,
        `VIDEO: '${randomTimeOfDay}, mesmo ambiente da ${profile.cnae ? profile.cnae.split(' - ')[1] || 'loja' : 'loja'} em ${profile.city}. Um(a) proprietário(a) brasileiro(a) de [idade] anos, ${randomEthnicity}, ${profile.city}, [aparência detalhada], ${randomClothing}. Foto estilo selfie, perspectiva de primeira pessoa, ângulo de selfie, sem câmera visível. Com a câmera Selfie VLOG, próxima ao rosto. Câmera subjetiva, POV.\\n\\nfala da pessoa: "${randomVideoText.replace('{city}', profile.city).replace('{product}', profile.productCallout || 'o Dinn')}"'`,
        "",
        "",
        "INSTRUÇÕES CRÍTICAS FINAIS:",
        `- OBRIGATÓRIO usar "${profile.city}" (SEM região, não outras cidades)`,
        `- OBRIGATÓRIO usar tipo específico do CNAE: "${profile.cnae}" (não "loja genérica")`,
        `- OBRIGATÓRIO analisar o nome "${profile.ownerName}" para determinar o gênero`,
        `- OBRIGATÓRIO usar horário "${randomTimeOfDay}"`,
        `- OBRIGATÓRIO criar overlay_text baseado em "${profile.productCallout}" (não usar exemplos genéricos)`,
        "",
        "RETORNE JSON com 'image_prompt', 'video_prompt', 'overlay_text' (máximo 15 chars) e 'button_text' (máximo 12 chars) seguindo essas estruturas exatas.",
        "",
        `OVERLAY_TEXT: OBRIGATÓRIO 2 linhas exatas separadas por \\n baseado no produto "${profile.productCallout}". Se for "JIM assistente virtual no app", use algo como "Assistente Virtual\\nInteligente" ou "Gestão Automatizada\\ncom IA". Máximo 15 caracteres por linha.`,
        "BUTTON_TEXT: Texto do botão call-to-action. Exemplos: 'Pagar contas', 'Indicar agora', 'Começar a usar', 'Saber mais'.",
      ],
    };

    let json;
    
    if (GITHUB_PAGES_MODE) {
      // GitHub Pages always uses direct OpenAI API calls
      // Note: Even with auth, we don't have serverless functions on GitHub Pages
      // Direct OpenAI API call (GitHub Pages doesn't have serverless functions)
      const openaiKey = SecurityUtils.secureRetrieve('openai_api_key');
      if (!openaiKey) {
        showApiNoticeIfNeeded();
        throw new Error('Please provide your OpenAI API key using the key input above');
      }
      
      try {
        
        const r = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json'
          },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a JSON generator. Always respond with valid JSON only, no explanations or extra text.'
            },
            {
              role: 'user', 
              content: user.rules.join('\n') + '\n\nRETURNE APENAS JSON VÁLIDO:'
            }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
          })
        });
        if (!r.ok) {
          const errorText = await r.text();
          console.error('❌ OpenAI API Error Details:', {
            status: r.status,
            statusText: r.statusText,
            error: errorText
          });
          
          if (r.status === 401) {
            throw new Error('❌ OpenAI API Key Invalid!\n\n🔍 Possible issues:\n• Wrong API key format\n• Expired or revoked key\n• Key without GPT-4 access\n\n💡 Get new key: https://platform.openai.com/api-keys');
          } else if (r.status === 429) {
            throw new Error('❌ OpenAI Rate Limit!\n\n🔍 Possible issues:\n• Too many requests\n• Insufficient credits\n• Free tier limitations\n\n💡 Check usage: https://platform.openai.com/usage');
          } else {
            throw new Error(`❌ OpenAI API Error (${r.status}): ${errorText}\n\n💡 Check your account: https://platform.openai.com/`);
          }
        }
        const openaiResponse = await r.json();
        try {
          const content = openaiResponse.choices[0].message.content;
          console.log('OpenAI raw response:', content); // Debug
          json = JSON.parse(content);
        } catch (e) {
          console.error('JSON parse error:', e);
          console.error('OpenAI response was:', openaiResponse.choices[0].message.content);
          throw new Error(`Failed to parse OpenAI response as JSON: ${e.message}`);
        }
      } catch (error) {
        console.error('GitHub Pages API call error:', error);
        throw error;
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

fala da pessoa: "Iaí pessoal! ${product} triplicou meu faturamento aqui em ${city}! Negócio que era difícil ficou super fácil!"`;
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
    
    const imageSeed = generateSeedVariation(window.currentMasterSeed || generateBetterRandomSeed(), 1);
    console.log(`🎨 Image Seed: ${imageSeed} (Master: ${window.currentMasterSeed})`);
    
    const body = {
      input: {
        prompt: finalPrompt,
        aspect_ratio: "16:9",
        size: "regular",
        guidance_scale: 5.0,
        seed: imageSeed
      }
    };
         // Status is already set by caller function
     
     let imageUrl;
     if (GITHUB_PAGES_MODE) {
       // Direct Replicate API call with CORS proxy for GitHub Pages
       const replicateKey = SecurityUtils.secureRetrieve('replicate_api_key');
       if (!replicateKey) {
         showApiNoticeIfNeeded();
         throw new Error('Please provide your Replicate API key using the key input above');
       }
       
       // Use corsproxy.io which supports Authorization headers
       const corsProxy = 'https://corsproxy.io/?';
       const replicateUrl = 'https://api.replicate.com/v1/models/bytedance/seedream-3/predictions';
       
       console.log('Making Replicate Image API call:', corsProxy + replicateUrl);
       console.log('Image request body:', JSON.stringify(body, null, 2));
       
       const r = await fetch(corsProxy + replicateUrl, {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${replicateKey}`,
           'Content-Type': 'application/json'
         },
         body: JSON.stringify(body)
       });
       
       console.log('Replicate image response status:', r.status);
       if (!r.ok) {
         const errorText = await r.text();
         console.error('❌ Replicate Image API Error Details:', {
           status: r.status,
           statusText: r.statusText,
           error: errorText,
           corsProxy: corsProxy,
           apiUrl: replicateUrl
         });
         
         if (r.status === 401) {
           throw new Error('❌ Replicate API Key Invalid!\n\n🔍 Possible issues:\n• Wrong API key format\n• Expired or revoked key\n• Key without model access\n\n💡 Get new key: https://replicate.com/account/api-tokens');
         } else if (r.status === 429) {
           throw new Error('❌ Replicate Rate Limit!\n\n🔍 Possible issues:\n• Too many requests\n• Insufficient credits\n• Daily spending limit reached\n\n💡 Check billing: https://replicate.com/account/billing');
         } else if (r.status === 400) {
           throw new Error('❌ Replicate Bad Request!\n\n🔍 Possible issues:\n• Invalid prompt format\n• Unsupported parameters\n• Model restrictions\n\n💡 Error: ' + errorText);
         } else {
           throw new Error(`❌ Replicate API Error (${r.status}): ${errorText}\n\n🌐 Network issue? Try:\n• Different browser\n• Disable ad-blocker\n• Check corsproxy.io status`);
         }
       }
       
       const prediction = await r.json();
       console.log('Replicate image prediction:', prediction);
       
       // Poll for completion
       let result = prediction;
       let pollAttempts = 0;
       const maxPollAttempts = 30; // 60 seconds max
       
       while ((result.status === 'starting' || result.status === 'processing') && pollAttempts < maxPollAttempts) {
         pollAttempts++;
         console.log(`Polling attempt ${pollAttempts}, status: ${result.status}`);
         await new Promise(resolve => setTimeout(resolve, 2000));
         
         if (!result.urls || !result.urls.get) {
           console.error('No polling URL available:', result);
           throw new Error('No polling URL available from Replicate');
         }
         
         const pollUrl = corsProxy + result.urls.get;
         console.log('Polling URL:', pollUrl);
         
         const pollR = await fetch(pollUrl, {
           headers: { 'Authorization': `Bearer ${replicateKey}` }
         });
         
         if (!pollR.ok) {
           console.error('Polling failed:', await pollR.text());
           throw new Error(`Polling failed: ${pollR.status}`);
         }
         
         result = await pollR.json();
         console.log('Poll result:', result);
       }
       
       if (result.status === 'succeeded') {
         imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
         console.log('Image generation succeeded:', imageUrl);
       } else if (result.status === 'failed') {
         console.error('Image generation failed:', result.error || result);
         throw new Error(`Image generation failed: ${result.error || 'Unknown error'}`);
       } else if (pollAttempts >= maxPollAttempts) {
         throw new Error('Image generation timed out');
       } else {
         throw new Error(`Unexpected status: ${result.status}`);
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



async function generateSeededit(imageUrl) {
  try {
    if (!imageUrl) {
      if (seededitStatus) seededitStatus.textContent = "No image to process.";
      return null;
    }

    let editedImageUrl;
    if (GITHUB_PAGES_MODE) {
      // Direct Replicate API call with CORS proxy for GitHub Pages
      const replicateKey = SecurityUtils.secureRetrieve('replicate_api_key');
      if (!replicateKey) {
        showApiNoticeIfNeeded();
        return null;
      }
      
      // Use corsproxy.io which supports Authorization headers
      const corsProxy = 'https://corsproxy.io/?';
      const replicateUrl = 'https://api.replicate.com/v1/models/bytedance/seededit-3.0/predictions';
      
      const seededitSeed = generateSeedVariation(window.currentMasterSeed || generateBetterRandomSeed(), 2);
      console.log(`🔧 Seededit Seed: ${seededitSeed} (Master: ${window.currentMasterSeed})`);
      
      const body = {
        input: {
          image: imageUrl,
          prompt: "remove text from image, remove name of the shop, remove letterings, remove subtitle, remove storefront name, remove text, remove all written, remove every text",
          guidance_scale: 5.5,
          seed: seededitSeed
        }
      };
      
      console.log('Making Replicate Seededit API call:', corsProxy + replicateUrl);
      console.log('Seededit request body:', JSON.stringify(body, null, 2));
      
      const r = await fetch(corsProxy + replicateUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${replicateKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      if (!r.ok) {
        const errorText = await r.text();
        throw new Error(`HTTP ${r.status}: ${errorText}`);
      }
      
      const prediction = await r.json();
      console.log('Seededit prediction:', prediction);
      
      // Poll for completion
      let result = prediction;
      for (let i = 0; i < 120; i++) {
        console.log(`Polling attempt ${i + 1}, status: ${result.status}`);
        
        if (result.status === 'succeeded') {
          editedImageUrl = result.output;
          break;
        } else if (result.status === 'failed' || result.status === 'canceled') {
          throw new Error('Seededit generation failed');
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const pollR = await fetch(corsProxy + result.urls.get, {
          headers: { 'Authorization': `Token ${replicateKey}` }
        });
        result = await pollR.json();
      }
      
      if (result.status === 'succeeded') {
        editedImageUrl = result.output;
      } else {
        throw new Error('Seededit generation failed');
      }
    } else {
      // Use serverless function (Vercel/local)
      const endpoint = `${API_BASE}/replicate/seededit`;
      const requestBody = { imageUrl: imageUrl };
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      if (!r.ok) throw new Error(await r.text());
      const j = await r.json();
      editedImageUrl = j.url;
    }
    
    if (editedImageUrl && seededitContainer) {
      const img = document.createElement("img");
      img.src = editedImageUrl;
      seededitContainer.innerHTML = "";
      seededitContainer.appendChild(img);
      const a = document.createElement("a");
      a.href = editedImageUrl; a.download = "text-removed-image.png"; a.textContent = "📥 Download";
      a.className = "download-btn";
      seededitContainer.appendChild(a);
      if (seededitStatus) seededitStatus.textContent = "Done.";
      
      // Update preview if showing image
      updatePreviewMode();
    } else {
      if (seededitStatus) seededitStatus.textContent = "Text removal failed.";
    }
    return editedImageUrl;
  } catch (e) {
    console.error(e);
    if (seededitStatus) seededitStatus.textContent = "Text removal failed.";
    return null;
  }
}

async function generateVeo3Video(videoPrompt, startFrameUrl = null) {
  try {
    // Prompt is already displayed by displayPrompts() function
         // Status is already set by caller function
     
     let videoUrl;
     if (GITHUB_PAGES_MODE) {
       // Direct Replicate API call with CORS proxy for GitHub Pages
       const replicateKey = SecurityUtils.secureRetrieve('replicate_api_key');
       if (!replicateKey) {
         showApiNoticeIfNeeded();
         throw new Error('Please provide your Replicate API key using the key input above');
       }
       
       // Use corsproxy.io which supports Authorization headers
       const corsProxy = 'https://corsproxy.io/?';
       const replicateUrl = 'https://api.replicate.com/v1/models/google/veo-3-fast/predictions';
       
       const videoSeed = generateSeedVariation(window.currentMasterSeed || generateBetterRandomSeed(), 3);
       console.log(`🎬 Video Seed: ${videoSeed} (Master: ${window.currentMasterSeed})`);
       
       const body = {
         input: {
           prompt: videoPrompt,
           aspect_ratio: "16:9",
           duration: 5,
           seed: videoSeed
         }
       };
       
       // Add start frame image if provided
       if (startFrameUrl) {
         body.input.image = startFrameUrl;
         console.log('🖼️ Using start frame:', startFrameUrl);
       }
       
       console.log('Making Replicate Video API call:', corsProxy + replicateUrl);
       console.log('Video request body:', JSON.stringify(body, null, 2));
       
       const r = await fetch(corsProxy + replicateUrl, {
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
         const pollUrl = corsProxy + result.urls.get;
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
       const requestBody = { prompt: videoPrompt };
       if (startFrameUrl) {
         requestBody.startFrame = startFrameUrl;
         console.log('🖼️ Using start frame for serverless:', startFrameUrl);
       }
       const r = await fetch(endpoint, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(requestBody)
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


