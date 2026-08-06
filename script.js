/* =========================================================
   EXTRUSA — script.js
   Vanilla JS, zero deps. Everything persists to localStorage.
   ========================================================= */

// Guard: if this file ever gets included twice on the same page
// (e.g. a duplicate <script src="script.js"> tag), the second
// execution stops here instead of crashing the whole app.
if (window.__extrusaLoaded) {
  console.warn('script.js já foi carregado nesta página — ignorando execução duplicada. Verifique se index.html tem <script src="script.js"> repetido.');
} else {
  window.__extrusaLoaded = true;
(function () {
'use strict';

/* ---------------------------------------------------------
   1. CONSTANTS & UTILITIES
--------------------------------------------------------- */
const STORAGE_KEY = 'extrusa_state_v1';
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const todayISO = () => new Date().toISOString().slice(0, 10);
const brl = n => (Number(n) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = iso => { if (!iso) return '—'; const [y,m,d] = iso.split('-'); return `${d}/${m}/${y}`; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const QUOTES = [
  'Toda peça perfeita começou com uma primeira camada torta.',
  'Warping é só o plástico testando sua paciência.',
  'Print in progress: sua evolução também está sendo fatiada em camadas.',
  'Um bom suporte hoje evita uma peça quebrada amanhã.',
  'A precisão vem do paquímetro, a constância vem de você.',
  'Cada Benchy impresso é um degrau a mais na escada da maestria.',
  'Negócios sólidos, como peças bem calibradas, são feitos de tolerância e ajuste.',
  'Falha de aderência na mesa? Recomece — a próxima camada gruda melhor.',
  'Você não precisa imprimir rápido. Precisa imprimir certo.',
  'De hobby a negócio: a diferença está no infill de disciplina.'
];

/* ---------------------------------------------------------
   2. STUDY PLAN SEED DATA (12-week bootcamp)
--------------------------------------------------------- */
function buildStudySeed() {
  const mk = (title, desc, time, diff, prio, type) => ({
    id: uid(), title, desc, time, difficulty: diff, priority: prio, type,
    notes: '', done: false, link: ''
  });

  const weeks = [];

  weeks.push({ id: uid(), month: 1, weekNum: 1, title: 'Conhecendo a impressora',
    topics: ['FDM', 'PLA', 'PETG', 'AMS', 'Bambu Studio', 'Layer Height', 'Infill', 'Supports', 'Orientação da peça'],
    activities: [
      mk('Conhecer a impressora', 'Entenda os componentes físicos e o fluxo de trabalho da sua impressora FDM.', '1h', 'facil', 'alta', 'topico'),
      mk('FDM, PLA e PETG', 'Estude o processo de impressão por fusão de filamento e as diferenças entre os materiais.', '45min', 'facil', 'alta', 'topico'),
      mk('AMS e Bambu Studio', 'Configure o sistema de múltiplos materiais e explore a interface do fatiador.', '1h', 'medio', 'media', 'topico'),
      mk('Layer Height, Infill e Supports', 'Entenda como esses três parâmetros afetam qualidade, resistência e tempo.', '1h', 'medio', 'alta', 'topico'),
      mk('Orientação da peça', 'Aprenda a decidir o melhor ângulo de impressão para cada geometria.', '30min', 'medio', 'media', 'topico'),
      mk('Benchy', 'Imprima o benchmark clássico e avalie pontes, overhangs e detalhes finos.', '2h', 'facil', 'alta', 'exercicio'),
      mk('Cubo de calibração', 'Imprima um cubo e meça com paquímetro para calibrar dimensões.', '1h', 'facil', 'media', 'exercicio'),
      mk('Porta-copos', 'Modele e imprima um porta-copos simples.', '1h30', 'facil', 'media', 'exercicio'),
      mk('Gancho', 'Imprima um gancho de parede funcional.', '45min', 'facil', 'baixa', 'exercicio'),
      mk('Porta-cartão', 'Imprima um porta-cartão de mesa.', '45min', 'facil', 'baixa', 'exercicio'),
    ]});

  weeks.push({ id: uid(), month: 1, weekNum: 2, title: 'Modelagem no Fusion 360',
    topics: ['Sketch', 'Extrude', 'Fillet', 'Chamfer', 'Mirror', 'Pattern', 'Shell'],
    activities: [
      mk('Sketch e Extrude', 'Fundamentos de esboço 2D e extrusão para volume 3D.', '1h30', 'medio', 'alta', 'topico'),
      mk('Fillet e Chamfer', 'Arredondamentos e chanfros para acabamento e resistência.', '1h', 'medio', 'media', 'topico'),
      mk('Mirror e Pattern', 'Ferramentas de repetição e simetria para agilizar modelagem.', '1h', 'medio', 'media', 'topico'),
      mk('Shell', 'Esvaziamento de sólidos para peças mais leves.', '45min', 'medio', 'media', 'topico'),
      mk('Caixa', 'Modele uma caixa com tampa encaixável.', '2h', 'medio', 'alta', 'projeto'),
      mk('Tampa', 'Modele uma tampa com tolerância de encaixe.', '1h', 'medio', 'media', 'projeto'),
      mk('Organizador', 'Modele um organizador com múltiplos compartimentos.', '2h', 'dificil', 'media', 'projeto'),
      mk('Suporte para celular', 'Modele um suporte ajustável para smartphone.', '1h30', 'medio', 'alta', 'projeto'),
    ]});

  weeks.push({ id: uid(), month: 1, weekNum: 3, title: 'Precisão e encaixes',
    topics: ['Paquímetro', 'Tolerâncias', 'Encaixes', 'Modelagem baseada em objetos reais'],
    activities: [
      mk('Uso do paquímetro', 'Pratique medições precisas de objetos do dia a dia.', '45min', 'facil', 'alta', 'topico'),
      mk('Tolerâncias de impressão', 'Entenda folgas ideais para encaixes macho/fêmea.', '1h', 'medio', 'alta', 'topico'),
      mk('Encaixes por pressão', 'Modele e teste um encaixe por pressão (snap).', '1h30', 'dificil', 'media', 'projeto'),
      mk('Reprodução de objeto real', 'Escolha um objeto, meça e modele uma réplica funcional.', '2h', 'dificil', 'alta', 'projeto'),
    ]});

  weeks.push({ id: uid(), month: 1, weekNum: 4, title: 'Engenharia reversa',
    topics: ['Engenharia reversa aplicada'],
    activities: [
      mk('Objeto 1 de 10', 'Escolha e reproduza um objeto da casa.', '1h', 'medio', 'media', 'projeto'),
      mk('Objeto 2 de 10', 'Escolha e reproduza um objeto da casa.', '1h', 'medio', 'media', 'projeto'),
      mk('Objeto 3 de 10', 'Escolha e reproduza um objeto da casa.', '1h', 'medio', 'media', 'projeto'),
      mk('Objeto 4 de 10', 'Escolha e reproduza um objeto da casa.', '1h', 'medio', 'media', 'projeto'),
      mk('Objeto 5 de 10', 'Escolha e reproduza um objeto da casa.', '1h', 'medio', 'media', 'projeto'),
      mk('Objeto 6 de 10', 'Escolha e reproduza um objeto da casa.', '1h', 'medio', 'media', 'projeto'),
      mk('Objeto 7 de 10', 'Escolha e reproduza um objeto da casa.', '1h', 'medio', 'media', 'projeto'),
      mk('Objeto 8 de 10', 'Escolha e reproduza um objeto da casa.', '1h', 'medio', 'media', 'projeto'),
      mk('Objeto 9 de 10', 'Escolha e reproduza um objeto da casa.', '1h', 'medio', 'media', 'projeto'),
      mk('Objeto 10 de 10', 'Escolha e reproduza um objeto da casa.', '1h', 'medio', 'media', 'projeto'),
    ]});

  weeks.push({ id: uid(), month: 2, weekNum: 5, title: 'Home office',
    topics: ['Suporte notebook', 'Headset', 'Cabos', 'Canetas', 'Webcam'],
    activities: [
      mk('Suporte para notebook', 'Modele e imprima um suporte ergonômico.', '2h', 'medio', 'alta', 'projeto'),
      mk('Suporte para headset', 'Modele e imprima um gancho para headset.', '1h', 'facil', 'media', 'projeto'),
      mk('Organizador de cabos', 'Modele clipes ou canaletas para cabos.', '45min', 'facil', 'media', 'projeto'),
      mk('Porta-canetas', 'Modele um porta-canetas para a mesa.', '1h', 'facil', 'baixa', 'projeto'),
      mk('Suporte para webcam', 'Modele um suporte ajustável de webcam.', '1h30', 'medio', 'media', 'projeto'),
    ]});

  weeks.push({ id: uid(), month: 2, weekNum: 6, title: 'Casa',
    topics: ['Porta-chaves', 'Organizador', 'Controle remoto', 'Cozinha', 'Banheiro'],
    activities: [
      mk('Porta-chaves', 'Modele um porta-chaves de parede.', '1h', 'facil', 'media', 'projeto'),
      mk('Organizador doméstico', 'Modele um organizador multiuso.', '1h30', 'medio', 'media', 'projeto'),
      mk('Suporte de controle remoto', 'Modele um suporte para controles.', '1h', 'facil', 'baixa', 'projeto'),
      mk('Utilitário de cozinha', 'Modele um acessório funcional de cozinha.', '1h30', 'medio', 'media', 'projeto'),
      mk('Utilitário de banheiro', 'Modele um acessório funcional de banheiro.', '1h', 'facil', 'baixa', 'projeto'),
    ]});

  weeks.push({ id: uid(), month: 2, weekNum: 7, title: 'Produtos para a própria impressora',
    topics: ['Suporte ferramentas', 'Organizador AMS', 'Suporte espátula', 'Clip filamento', 'Suporte bicos'],
    activities: [
      mk('Suporte de ferramentas', 'Modele um organizador de ferramentas de impressão.', '1h', 'medio', 'media', 'projeto'),
      mk('Organizador de AMS', 'Modele acessórios para organizar bobinas.', '1h30', 'medio', 'media', 'projeto'),
      mk('Suporte de espátula', 'Modele um suporte para espátula de remoção.', '30min', 'facil', 'baixa', 'projeto'),
      mk('Clip de filamento', 'Modele um clip para pontas de filamento.', '30min', 'facil', 'baixa', 'projeto'),
      mk('Suporte de bicos', 'Modele um organizador de bicos (nozzles).', '45min', 'facil', 'baixa', 'projeto'),
    ]});

  weeks.push({ id: uid(), month: 2, weekNum: 8, title: 'Personalização',
    topics: ['Texto', 'Logo', 'Baixo relevo', 'Alto relevo', 'Chaveiros', 'Brindes'],
    activities: [
      mk('Texto 3D', 'Aprenda a inserir e extrudar texto em modelos.', '45min', 'facil', 'media', 'topico'),
      mk('Importar logo', 'Vetorize e importe um logo para relevo.', '1h', 'medio', 'media', 'topico'),
      mk('Baixo relevo', 'Aplique gravação em baixo relevo numa peça.', '1h', 'medio', 'media', 'projeto'),
      mk('Alto relevo', 'Aplique elementos em alto relevo numa peça.', '1h', 'medio', 'media', 'projeto'),
      mk('Chaveiros personalizados', 'Modele uma linha de chaveiros com nomes/logos.', '1h30', 'facil', 'alta', 'projeto'),
      mk('Brindes personalizados', 'Modele um brinde promocional personalizável.', '1h30', 'medio', 'alta', 'projeto'),
    ]});

  weeks.push({ id: uid(), month: 3, weekNum: 9, title: 'Encaixes avançados',
    topics: ['Snap fit', 'Roscas', 'Imãs', 'Parafusos', 'Caixas modulares'],
    activities: [
      mk('Snap fit', 'Modele um encaixe por pressão reutilizável.', '1h30', 'dificil', 'alta', 'topico'),
      mk('Roscas impressas', 'Modele roscas macho/fêmea funcionais.', '1h30', 'dificil', 'alta', 'topico'),
      mk('Inserção de imãs', 'Projete cavidades para imãs de fixação.', '1h', 'medio', 'media', 'topico'),
      mk('Inserção de parafusos (heat-set)', 'Projete furos para insertos rosqueados.', '1h', 'medio', 'media', 'topico'),
      mk('Caixa modular', 'Modele um sistema de caixas empilháveis/modulares.', '2h', 'dificil', 'alta', 'projeto'),
    ]});

  weeks.push({ id: uid(), month: 3, weekNum: 10, title: 'Primeiros produtos comerciais',
    topics: ['Criação de 5 produtos comerciais'],
    activities: [
      mk('Produto comercial 1', 'Defina, modele e prototipe o 1º produto para venda.', '2h', 'medio', 'alta', 'projeto'),
      mk('Produto comercial 2', 'Defina, modele e prototipe o 2º produto para venda.', '2h', 'medio', 'alta', 'projeto'),
      mk('Produto comercial 3', 'Defina, modele e prototipe o 3º produto para venda.', '2h', 'medio', 'alta', 'projeto'),
      mk('Produto comercial 4', 'Defina, modele e prototipe o 4º produto para venda.', '2h', 'medio', 'alta', 'projeto'),
      mk('Produto comercial 5', 'Defina, modele e prototipe o 5º produto para venda.', '2h', 'medio', 'alta', 'projeto'),
    ]});

  weeks.push({ id: uid(), month: 3, weekNum: 11, title: 'Produção em escala',
    topics: ['Fila de impressão', 'Custos', 'Tempo', 'AMS'],
    activities: [
      mk('Fila de impressão', 'Organize um plano de produção com múltiplas peças.', '1h', 'medio', 'alta', 'topico'),
      mk('Planilha de custos', 'Calcule custo por grama, tempo de máquina e mão de obra.', '1h30', 'medio', 'alta', 'topico'),
      mk('Otimização de tempo', 'Ajuste parâmetros para reduzir tempo sem perder qualidade.', '1h', 'medio', 'media', 'topico'),
      mk('Produção com AMS', 'Planeje trocas de material para lotes maiores.', '1h', 'medio', 'media', 'topico'),
    ]});

  weeks.push({ id: uid(), month: 3, weekNum: 12, title: 'Montando a loja',
    topics: ['Instagram', 'Shopee', 'Mercado Livre', 'Catálogo', 'Fotografia'],
    activities: [
      mk('Perfil no Instagram', 'Crie e configure um perfil comercial.', '1h', 'facil', 'alta', 'topico'),
      mk('Loja na Shopee', 'Configure uma loja e cadastre produtos.', '1h30', 'medio', 'media', 'topico'),
      mk('Loja no Mercado Livre', 'Configure uma loja e cadastre produtos.', '1h30', 'medio', 'media', 'topico'),
      mk('Catálogo de produtos', 'Monte um catálogo organizado com preços e fotos.', '2h', 'medio', 'alta', 'projeto'),
      mk('Fotografia de produto', 'Monte um pequeno estúdio caseiro e fotografe as peças.', '1h30', 'medio', 'alta', 'projeto'),
    ]});

  return weeks;
}

function buildAchievementSeed() {
  return [
    { id: 'first_print',   title: 'Primeira impressão', desc: 'Concluiu a primeira atividade do plano.', icon: '🖨️' },
    { id: 'first_benchy',  title: 'Primeiro Benchy',    desc: 'Imprimiu o clássico barco de calibração.', icon: '🚤' },
    { id: 'first_model',   title: 'Primeira modelagem', desc: 'Concluiu o primeiro projeto no Fusion 360.', icon: '📐' },
    { id: 'first_product', title: 'Primeiro produto',   desc: 'Cadastrou o primeiro produto no catálogo.', icon: '📦' },
    { id: 'first_sale',    title: 'Primeira venda',     desc: 'Registrou a primeira venda.', icon: '🛒' },
    { id: 'sales_10',      title: '10 vendas',          desc: 'Alcançou 10 unidades vendidas.', icon: '🔟' },
    { id: 'sales_50',      title: '50 vendas',          desc: 'Alcançou 50 unidades vendidas.', icon: '⭐' },
    { id: 'sales_100',     title: '100 vendas',         desc: 'Alcançou 100 unidades vendidas.', icon: '💯' },
    { id: 'profit_1000',   title: 'R$ 1.000 em lucro',  desc: 'Bateu a marca de mil reais de lucro.', icon: '💵' },
    { id: 'profit_5000',   title: 'R$ 5.000 em lucro',  desc: 'Bateu a marca de cinco mil reais de lucro.', icon: '💰' },
    { id: 'profit_10000',  title: 'R$ 10.000 em lucro', desc: 'Bateu a marca de dez mil reais de lucro.', icon: '🏆' },
  ].map(a => ({ ...a, unlocked: false, unlockedDate: null }));
}

/* ---------------------------------------------------------
   3. STATE
--------------------------------------------------------- */
function defaultState() {
  return {
    profile: { name: 'Maker', photo: '', goal: 5000, weeklyHours: 10 },
    theme: 'dark',
    streak: { current: 0, lastDate: null, totalHours: 0, history: {} },
    study: { weeks: buildStudySeed() },
    daily: [
      { id: uid(), text: 'Assistir 1 aula do bootcamp', done: false },
      { id: uid(), text: 'Fatiar e revisar 1 modelo', done: false },
    ],
    weeklyGoals: [{ id: uid(), text: 'Concluir a Semana 1 do bootcamp', done: false }],
    monthlyGoals: [{ id: uid(), text: 'Concluir o Mês 1 do bootcamp', done: false }],
    projects: [],
    ideas: [],
    products: [],
    finance: { entries: [], filamentPrice: 120, energyPrice: 0.95, printerPower: 120, goal: 5000 },
    filaments: [
      { id: uid(), name: 'PLA padrão', pricePerKg: 120, priceHistory: [{ price: 120, date: todayISO(), note: 'Preço inicial' }] },
    ],
    productCategories: [
      { id: uid(), name: 'Home Office' },
      { id: uid(), name: 'Casa' },
      { id: uid(), name: 'Personalizado' },
      { id: uid(), name: 'Acessórios 3D' },
    ],
    personalCreations: [],
    achievements: buildAchievementSeed(),
    quoteIndex: Math.floor(Math.random() * QUOTES.length),
  };
}

/* ---------------------------------------------------------
   3.1 SUPABASE CLIENT (cloud sync, optional)
--------------------------------------------------------- */
const SUPABASE_CONFIGURED =
  typeof SUPABASE_URL !== 'undefined' && typeof SUPABASE_ANON_KEY !== 'undefined' &&
  SUPABASE_URL && SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes('SEU-PROJETO') && !SUPABASE_ANON_KEY.includes('SUA_ANON_KEY');

let supabase = null;
let SUPABASE_INIT_ERROR = null;
if (SUPABASE_CONFIGURED && window.supabase) {
  try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (e) {
    SUPABASE_INIT_ERROR = e.message || String(e);
    console.error('Erro ao inicializar o Supabase — confira o config.js:', e);
  }
} else if (SUPABASE_CONFIGURED && !window.supabase) {
  SUPABASE_INIT_ERROR = 'O SDK do Supabase não carregou (verifique sua conexão ou se o CDN foi bloqueado).';
  console.error(SUPABASE_INIT_ERROR);
}

let currentUser = null;   // set once signed in
let cloudMode = false;    // true when data lives in Supabase for this session
let cloudSaveTimer = null;

function localKey() {
  // separate cache per account so switching users on the same device
  // never mixes data; guest mode uses the plain key.
  return currentUser ? `${STORAGE_KEY}:${currentUser.id}` : STORAGE_KEY;
}

function mergeWithDefaults(parsed) {
  const base = defaultState();
  if (!parsed || typeof parsed !== 'object') return base;
  return { ...base, ...parsed,
    profile: { ...base.profile, ...(parsed.profile||{}) },
    streak: { ...base.streak, ...(parsed.streak||{}) },
    study: parsed.study && parsed.study.weeks ? parsed.study : base.study,
    finance: { ...base.finance, ...(parsed.finance||{}) },
    filaments: (parsed.filaments && parsed.filaments.length ? parsed.filaments : base.filaments).map(f => ({
      ...f,
      // migrate: if no priceHistory, seed it from pricePerKg
      priceHistory: f.priceHistory || [{ price: f.pricePerKg || 0, date: todayISO(), note: 'Preço migrado' }],
    })),
    productCategories: parsed.productCategories && parsed.productCategories.length ? parsed.productCategories : base.productCategories,
    personalCreations: parsed.personalCreations || [],
    achievements: parsed.achievements && parsed.achievements.length ? parsed.achievements : base.achievements,
  };
}

function loadLocalState() {
  try {
    const raw = localStorage.getItem(localKey());
    return raw ? mergeWithDefaults(JSON.parse(raw)) : defaultState();
  } catch (e) {
    console.error('Falha ao carregar dados locais, iniciando novo estado.', e);
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(localKey(), JSON.stringify(state));
  if (cloudMode) scheduleCloudSave();
}

function setSyncStatus(status) {
  const dot = $('#syncDot'); const label = $('#syncLabel');
  if (!dot || !label) return;
  dot.className = 'sync-dot' + (status === 'synced' ? ' is-synced' : status === 'syncing' ? ' is-syncing' : status === 'offline' ? ' is-offline' : '');
  label.textContent = { local: 'local', synced: 'sincronizado', syncing: 'sincronizando…', offline: 'sem conexão' }[status] || status;
}

function scheduleCloudSave() {
  if (!supabase || !currentUser) return;
  setSyncStatus('syncing');
  clearTimeout(cloudSaveTimer);
  cloudSaveTimer = setTimeout(pushCloudStateNow, 900);
}

async function pushCloudStateNow() {
  if (!supabase || !currentUser) return;
  const { error } = await supabase.from('user_data').upsert({ user_id: currentUser.id, state });
  setSyncStatus(error ? 'offline' : 'synced');
  if (error) console.error('Erro ao sincronizar com Supabase:', error);
}

async function fetchOrCreateCloudState(user) {
  const { data, error } = await supabase.from('user_data').select('state').eq('user_id', user.id).single();
  if (data && data.state) return mergeWithDefaults(data.state);
  // no row yet for this user: seed one from local cache (if any) or a fresh default
  const seed = loadLocalState();
  const { error: insertError } = await supabase.from('user_data').insert({ user_id: user.id, state: seed });
  if (insertError) console.error('Erro ao criar registro inicial no Supabase:', insertError);
  return seed;
}

async function fetchUserRole(userId) {
  const { data } = await supabase.from('profiles').select('role, name, email').eq('user_id', userId).single();
  return data || { role: 'user', name: '', email: '' };
}

async function ensureProfile(user) {
  // upsert profile row in case trigger didn't fire yet
  await supabase.from('profiles').upsert({
    user_id: user.id,
    email: user.email,
  }, { onConflict: 'user_id', ignoreDuplicates: true });
}

// Shared study links cache — loaded once per session from Supabase
// studyMaterials cache: { [activityId]: [ { id, type:'video'|'pdf', title, url, pdfName } ] }
let studyMaterials = {};

function parseMaterialRow(r) {
  // Try to parse items array from video_url column (new format)
  try {
    const parsed = JSON.parse(r.video_url || '[]');
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  // Backward-compat: old single video + pdf format
  const items = [];
  if (r.video_url && !r.video_url.startsWith('[')) items.push({ id: uid(), type: 'video', title: 'Aula', url: r.video_url });
  if (r.pdf_url) items.push({ id: uid(), type: 'pdf', title: r.pdf_name || 'Material PDF', url: r.pdf_url, pdfName: r.pdf_name });
  return items;
}

async function fetchStudyMaterials() {
  if (!supabase) {
    // guest mode: load from state
    studyMaterials = state.studyMaterials || {};
    return;
  }
  const { data } = await supabase.from('study_materials').select('activity_id, video_url, pdf_url, pdf_name');
  if (data) {
    studyMaterials = {};
    data.forEach(r => { studyMaterials[r.activity_id] = parseMaterialRow(r); });
  }
}

async function saveStudyMaterials(activityId, items) {
  // items: [ { id, type, title, url, pdfName? } ]
  studyMaterials[activityId] = items;
  if (supabase && currentUser) {
    await supabase.from('study_materials').upsert({
      activity_id: activityId,
      video_url: JSON.stringify(items),  // store array as JSON
      pdf_url: '', pdf_name: '',
      updated_by: currentUser.id,
    }, { onConflict: 'activity_id' });
  } else {
    // guest: persist to state
    if (!state.studyMaterials) state.studyMaterials = {};
    state.studyMaterials[activityId] = items;
    saveState();
  }
}

async function uploadToStorage(bucket, path, file) {
  if (!supabase) return null;
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) { console.error('Upload error:', error); return null; }
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return { path: data.path, publicUrl: urlData.publicUrl };
}

async function deleteFromStorage(bucket, path) {
  if (!supabase || !path) return;
  await supabase.storage.from(bucket).remove([path]);
}

// Products Supabase layer
// If cloudMode: reads/writes to `products` table
// If guest: falls back to state.products (localStorage)

async function fetchCloudProducts() {
  if (!supabase || !currentUser) return null;
  const { data, error } = await supabase.from('products').select('*').eq('user_id', currentUser.id);
  if (error) { console.error('Erro ao buscar produtos:', error); return null; }
  return data;
}

async function upsertCloudProduct(p) {
  if (!supabase || !currentUser) return;
  const row = productToRow(p);
  const { error } = await supabase.from('products').upsert(row, { onConflict: 'id' });
  if (error) console.error('Erro ao salvar produto:', error);
}

async function deleteCloudProduct(id) {
  if (!supabase || !currentUser) return;
  await supabase.from('products').delete().eq('id', id).eq('user_id', currentUser.id);
}

function productToRow(p) {
  return {
    id: p.id, user_id: currentUser.id,
    name: p.name || '', category: p.category || '', status: p.status || 'rascunho',
    price: Number(p.price) || 0, cost: Number(p.cost) || 0,
    weight_g: Number(p.weight) || 0, print_time: p.printTime || '',
    sold: Number(p.sold) || 0, image_url: p.image || '',
    project_file_url: p.projectFileUrl || '', project_file_name: p.projectFileName || '',
    extra_cost: Number(p.extraCost) || 0,
    // store multi-filament as JSON in the existing filament_id column (backward-compat)
    filament_id: JSON.stringify(p.filaments || []),
    filament_price_override: 0,
    notes: p.notes || '',
  };
}

function rowToProduct(r) {
  let filaments = [];
  try { filaments = JSON.parse(r.filament_id || '[]'); } catch { filaments = []; }
  // backward-compat: old single-filament format stored as plain UUID string
  if (!Array.isArray(filaments)) filaments = [];
  return {
    id: r.id, name: r.name, category: r.category, status: r.status,
    price: Number(r.price), cost: Number(r.cost), weight: Number(r.weight_g),
    printTime: r.print_time, sold: Number(r.sold), image: r.image_url,
    projectFileUrl: r.project_file_url, projectFileName: r.project_file_name,
    extraCost: Number(r.extra_cost), filaments, notes: r.notes,
  };
}

let state = defaultState(); // placeholder until boot() resolves auth + data source
let currentUserRole = 'user'; // 'user' | 'admin'
let isAdmin = false;

/* ---------------------------------------------------------
   3.2 AUTH SCREEN
--------------------------------------------------------- */
let authMode = 'signin';

function showAuthScreen(show) {
  $('#authScreen').classList.toggle('is-hidden', !show);
  $('#appShell').classList.toggle('is-hidden', show);
}

function setAuthError(msg) { $('#authError').textContent = msg || ''; }

function updateAuthModeUI() {
  const signin = authMode === 'signin';
  $('#authTitle').textContent = signin ? 'Entrar' : 'Criar conta';
  $('#authSubmitBtn').textContent = signin ? 'Entrar' : 'Criar conta';
  $('#authToggleBtn').textContent = signin ? 'Não tenho conta — criar uma' : 'Já tenho conta — entrar';
  setAuthError('');
}

if ($('#authToggleBtn')) {
  $('#authToggleBtn').onclick = () => { authMode = authMode === 'signin' ? 'signup' : 'signin'; updateAuthModeUI(); };
  $('#authPassword').addEventListener('keydown', e => { if (e.key === 'Enter') $('#authSubmitBtn').click(); });

  $('#authSubmitBtn').onclick = async () => {
    const email = $('#authEmail').value.trim();
    const password = $('#authPassword').value;
    if (!email || !password) { setAuthError('Preencha e-mail e senha.'); return; }
    if (!supabase) { setAuthError('Supabase não está configurado neste site (veja config.js). Use "Continuar sem conta".'); return; }
    setAuthError('');
    $('#authSubmitBtn').textContent = 'Aguarde…';

    try {
      const action = authMode === 'signin'
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });

      const { data, error } = await action;
      updateAuthModeUI();

      if (error) { setAuthError(traduzErroAuth(error.message)); return; }
      if (!data.session) {
        setAuthError('Conta criada! Confirme seu e-mail e depois volte para entrar.');
        return;
      }
      await startCloudSession(data.session.user);
    } catch (e) {
      console.error('Erro inesperado na autenticação:', e);
      updateAuthModeUI();
      setAuthError('Não foi possível conectar ao Supabase agora. Tente novamente ou use "Continuar sem conta".');
    }
  };

  $('#authGuestBtn').onclick = () => startGuestSession();
}

function traduzErroAuth(msg) {
  if (/Invalid login credentials/i.test(msg)) return 'E-mail ou senha incorretos.';
  if (/already registered/i.test(msg)) return 'Este e-mail já tem uma conta — tente entrar.';
  if (/Password should be/i.test(msg)) return 'A senha precisa ter pelo menos 6 caracteres.';
  return msg;
}

async function startCloudSession(user) {
  currentUser = user;
  cloudMode = true;
  await ensureProfile(user);
  const profile = await fetchUserRole(user.id);
  currentUserRole = profile.role || 'user';
  isAdmin = currentUserRole === 'admin';
  state = await fetchOrCreateCloudState(user);
  // Load cloud products into state.products
  const cloudProds = await fetchCloudProducts();
  if (cloudProds) state.products = cloudProds.map(rowToProduct);
  await fetchStudyMaterials();
  showAuthScreen(false);
  setSyncStatus('synced');
  applyAdminUI();
  saveState();
  finishBoot();
}

function startGuestSession() {
  currentUser = null;
  cloudMode = false;
  isAdmin = false;
  currentUserRole = 'user';
  state = loadLocalState();
  showAuthScreen(false);
  setSyncStatus('local');
  applyAdminUI();
  finishBoot();
}

function applyAdminUI() {
  // Show/hide admin nav item and badge
  const adminNav = $('#adminNavItem');
  if (adminNav) adminNav.style.display = isAdmin ? '' : 'none';
  const adminBadge = $('#adminBadge');
  if (adminBadge) adminBadge.style.display = isAdmin ? '' : 'none';
}

async function boot() {
  if (SUPABASE_INIT_ERROR) {
    showAuthScreen(true);
    setAuthError(`Erro de configuração do Supabase: ${SUPABASE_INIT_ERROR}. Você pode continuar sem conta enquanto ajusta o config.js.`);
  }
  if (!supabase) { startGuestSession(); return; }
  updateAuthModeUI();
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user) {
      await startCloudSession(session.user);
    } else {
      showAuthScreen(true);
    }
  } catch (e) {
    console.error('Erro ao verificar sessão do Supabase:', e);
    showAuthScreen(true);
    setAuthError('Não foi possível conectar ao Supabase agora. Você pode continuar sem conta.');
  }
}

/* ---------------------------------------------------------
   4. TOASTS
--------------------------------------------------------- */
function toast(msg) {
  const stack = $('#toastStack');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  stack.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, 2600);
}

function popAchievement(a) {
  const popup = $('#achievePopup');
  $('#achievePopupIcon').textContent = a.icon;
  $('#achievePopupText').textContent = a.title;
  popup.classList.add('is-shown');
  setTimeout(() => popup.classList.remove('is-shown'), 3200);
}

/* ---------------------------------------------------------
   5. MODAL SYSTEM
--------------------------------------------------------- */
function openModal(title, bodyHtml, buttons) {
  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = bodyHtml;
  const foot = $('#modalFoot');
  foot.innerHTML = '';
  buttons.forEach(b => {
    const btn = document.createElement('button');
    btn.className = b.cls || 'btn-ghost';
    btn.textContent = b.label;
    btn.onclick = b.onClick;
    foot.appendChild(btn);
  });
  $('#modalOverlay').classList.add('is-open');
}
function closeModal() { $('#modalOverlay').classList.remove('is-open'); }
$('#modalClose').onclick = closeModal;
$('#modalOverlay').addEventListener('click', e => { if (e.target.id === 'modalOverlay') closeModal(); });

/* ---------------------------------------------------------
   6. ACHIEVEMENTS ENGINE
--------------------------------------------------------- */
function parseTimeToHours(timeStr) {
  if (!timeStr) return 0;
  // Normalize: replace comma with dot, remove spaces
  const s = String(timeStr).trim().replace(',', '.');

  // 1) Pure decimal: "2.7" / "2.7h" / "2.7hrs" / "2.7hr" / "2.7 h"
  const decimalMatch = s.match(/^(\d+\.?\d*)\s*(?:hrs?)?$/i);
  if (decimalMatch) return parseFloat(decimalMatch[1]);

  // 2) "1h30" / "1h30min" / "1h 30"
  let h = 0, m = 0;
  const hMatch = s.match(/(\d+)\s*h/i);
  if (hMatch) h = parseInt(hMatch[1], 10);
  const mMatch = s.match(/h\s*(\d+)(?!\s*h)/i) || s.match(/(\d+)\s*min/i);
  if (mMatch) m = parseInt(mMatch[1], 10);
  return h + m / 60;
}

// Format decimal hours → "h:mm"  e.g. 2.7 → "2:42"
function hoursToHHMM(hours) {
  if (!hours || hours <= 0) return null;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}:${String(m).padStart(2, '0')}`;
}

// kept for backwards-compatibility with earlier calls in this file
const totalHoursFromActivity = parseTimeToHours;

function computeTotals() {
  const totalSold = state.products.reduce((s, p) => s + (Number(p.sold) || 0), 0);
  const revenue = state.finance.entries.filter(e => e.type === 'receita').reduce((s, e) => s + Number(e.value || 0), 0);
  const expense = state.finance.entries.filter(e => e.type === 'despesa').reduce((s, e) => s + Number(e.value || 0), 0);
  const profit = revenue - expense;
  return { totalSold, revenue, expense, profit };
}

function checkAchievements() {
  const t = computeTotals();
  const anyActivityDone = state.study.weeks.some(w => w.activities.some(a => a.done));
  const benchyDone = state.study.weeks.some(w => w.activities.some(a => a.done && /benchy/i.test(a.title)));
  const firstFusionProject = state.study.weeks.some(w => w.weekNum === 2 && w.activities.some(a => a.done));

  const conditions = {
    first_print: anyActivityDone,
    first_benchy: benchyDone,
    first_model: firstFusionProject,
    first_product: state.products.length >= 1,
    first_sale: t.totalSold >= 1,
    sales_10: t.totalSold >= 10,
    sales_50: t.totalSold >= 50,
    sales_100: t.totalSold >= 100,
    profit_1000: t.profit >= 1000,
    profit_5000: t.profit >= 5000,
    profit_10000: t.profit >= 10000,
  };

  let newlyUnlocked = [];
  state.achievements.forEach(a => {
    if (!a.unlocked && conditions[a.id]) {
      a.unlocked = true;
      a.unlockedDate = todayISO();
      newlyUnlocked.push(a);
    }
  });
  if (newlyUnlocked.length) {
    saveState();
    newlyUnlocked.forEach((a, i) => setTimeout(() => popAchievement(a), i * 3400));
  }
}

/* ---------------------------------------------------------
   7. STREAK / STUDY HOURS
--------------------------------------------------------- */
function registerStudyActivity(hours) {
  const today = todayISO();
  state.streak.history[today] = (state.streak.history[today] || 0) + hours;
  state.streak.totalHours = Object.values(state.streak.history).reduce((s, h) => s + h, 0);

  if (state.streak.lastDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    state.streak.current = state.streak.lastDate === yesterday ? state.streak.current + 1 : 1;
    state.streak.lastDate = today;
  }
  saveState();
}

/* ---------------------------------------------------------
   8. NAVIGATION / VIEW ROUTER
--------------------------------------------------------- */
const VIEW_META = {
  dashboard: ['Dashboard', 'Sua evolução, camada por camada.'],
  study: ['Plano de Estudos', 'Bootcamp de impressão 3D — 12 semanas.'],
  projects: ['Projetos', 'Do modelo à venda: acompanhe cada peça.'],
  ideas: ['Ideias', 'Seu banco de inspirações para novos produtos.'],
  products: ['Produtos', 'Catálogo do que você cria e vende.'],
  finance: ['Financeiro', 'Receitas, despesas e margem, sem letras miúdas.'],
  personal: ['Criações Pessoais', 'Quanto você economizou imprimindo em vez de comprar.'],
  achievements: ['Conquistas', 'Cada marco do hobby ao negócio.'],
  settings: ['Configurações', 'Ajuste o app do seu jeito.'],
  admin: ['Painel Admin', 'Configurações globais e gerenciamento do sistema.'],
};

function switchView(view) {
  if (view === 'admin' && !isAdmin) return; // guard: non-admins can't reach admin view
  $$('.nav-item').forEach(b => b.classList.toggle('is-active', b.dataset.view === view));
  $$('.view').forEach(v => v.classList.toggle('is-active', v.id === `view-${view}`));
  const meta = VIEW_META[view] || ['', ''];
  $('#viewTitle').textContent = meta[0];
  $('#viewSubtitle').textContent = meta[1];
  $('#viewScroll').scrollTop = 0;
  closeSidebar();
  renderView(view);
}

function renderView(view) {
  if (view === 'dashboard') renderDashboard();
  if (view === 'study') renderStudy();
  if (view === 'projects') renderProjects();
  if (view === 'ideas') renderIdeas();
  if (view === 'products') renderProducts();
  if (view === 'finance') renderFinance();
  if (view === 'personal') renderPersonal();
  if (view === 'achievements') renderAchievements();
  if (view === 'settings') renderSettings();
  if (view === 'admin') renderAdmin();
}

$$('.nav-item').forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.view)));

/* mobile sidebar */
function openSidebar() { $('#sidebar').classList.add('is-open'); $('#scrim').classList.add('is-open'); }
function closeSidebar() { $('#sidebar').classList.remove('is-open'); $('#scrim').classList.remove('is-open'); }
$('#hamburger').onclick = openSidebar;
$('#sidebarClose').onclick = closeSidebar;
$('#scrim').onclick = closeSidebar;

/* ---------------------------------------------------------
   9. THEME
--------------------------------------------------------- */
function applyTheme() {
  let effective = state.theme;
  if (state.theme === 'auto') {
    const h = new Date().getHours();
    effective = (h >= 7 && h < 19) ? 'light' : 'dark';
  }
  document.body.setAttribute('data-theme', effective);
  $('#themeIcon').textContent = effective === 'dark' ? '🌙' : '☀';
  $$('.seg-btn', $('#themeSeg')).forEach(b => b.classList.toggle('is-active', b.dataset.theme === state.theme));
}
$('#sidebarLogoutBtn').onclick = () => {
  if (!supabase) { toast('Você está no modo local — não há sessão para encerrar.'); return; }
  openModal('Sair da conta?', `<p style="font-size:13.5px;color:var(--text-muted);">Seus dados ficam salvos na nuvem. Você pode entrar novamente a qualquer momento.</p>`, [
    { label: 'Cancelar', cls: 'btn-ghost', onClick: closeModal },
    { label: 'Sair', cls: 'btn-danger', onClick: async () => {
      await supabase.auth.signOut();
      closeModal();
      location.reload();
    }}
  ]);
};

/* ---------------------------------------------------------
   10. DASHBOARD
--------------------------------------------------------- */
function studyOverallProgress() {
  let total = 0, done = 0;
  state.study.weeks.forEach(w => w.activities.forEach(a => { total++; if (a.done) done++; }));
  return total ? Math.round((done / total) * 100) : 0;
}

function renderDashboard() {
  $('#quoteText').textContent = QUOTES[state.quoteIndex];

  const pct = studyOverallProgress();
  $('#statProgress').textContent = pct + '%';
  $('#statProgressBar').style.width = pct + '%';
  $('#statStreak').textContent = state.streak.current;
  $('#statHours').textContent = Math.round(state.streak.totalHours) + 'h';

  const completedProjects = state.projects.filter(p => p.column === 'pronto' || p.column === 'vendendo').length;
  $('#statProjects').textContent = completedProjects;
  $('#statProductsMade').textContent = state.products.length;
  const t = computeTotals();
  $('#statProductsSold').textContent = t.totalSold;
  $('#statProfit').textContent = brl(t.profit);

  $('#sidebarStreak').textContent = state.streak.current;

  renderEvoChart();
  renderChecklist('#dailyChecklist', state.daily, 'daily');
  renderChecklist('#weeklyGoals', state.weeklyGoals, 'weeklyGoals');
  renderChecklist('#monthlyGoals', state.monthlyGoals, 'monthlyGoals');

  checkAchievements();
}

function renderChecklist(selector, list, stateKey) {
  const el = $(selector);
  if (!list.length) { el.innerHTML = '<p style="color:var(--text-faint);font-size:12.5px;">Nada por aqui ainda.</p>'; return; }
  el.innerHTML = list.map(item => `
    <li class="check-item ${item.done ? 'is-done' : ''}" data-id="${item.id}">
      <input type="checkbox" ${item.done ? 'checked' : ''}>
      <span class="check-label">${escapeHtml(item.text)}</span>
      <button class="check-del" title="Remover">✕</button>
    </li>`).join('');
  $$('input[type=checkbox]', el).forEach(cb => cb.addEventListener('change', e => {
    const id = e.target.closest('.check-item').dataset.id;
    const item = list.find(i => i.id === id);
    item.done = e.target.checked;
    if (item.done && stateKey === 'daily') registerStudyActivity(0.25);
    saveState(); renderDashboard();
  }));
  $$('.check-del', el).forEach(btn => btn.addEventListener('click', e => {
    const id = e.target.closest('.check-item').dataset.id;
    const idx = list.findIndex(i => i.id === id);
    list.splice(idx, 1);
    saveState(); renderDashboard();
  }));
}

function promptAddChecklistItem(list, title) {
  openModal(title, `
    <div class="field"><label>Descrição</label><input type="text" id="mNewItemText" placeholder="Ex: Estudar Fillet e Chamfer"></div>
  `, [
    { label: 'Cancelar', cls: 'btn-ghost', onClick: closeModal },
    { label: 'Adicionar', cls: 'btn-primary', onClick: () => {
      const text = $('#mNewItemText').value.trim();
      if (!text) return;
      list.push({ id: uid(), text, done: false });
      saveState(); closeModal(); renderDashboard();
    }}
  ]);
}
$('#addDailyTaskBtn').onclick = () => promptAddChecklistItem(state.daily, 'Nova tarefa do dia');
$('#addWeeklyGoalBtn').onclick = () => promptAddChecklistItem(state.weeklyGoals, 'Novo objetivo da semana');
$('#addMonthlyGoalBtn').onclick = () => promptAddChecklistItem(state.monthlyGoals, 'Novo objetivo do mês');

function renderEvoChart() {
  const svg = $('#evoChart');
  const days = [];
  for (let i = 55; i >= 0; i -= 8) {
    const d = new Date(Date.now() - i * 86400000);
    days.push(d.toISOString().slice(0, 10));
  }
  const weekBuckets = [];
  for (let i = 0; i < days.length - 1; i++) {
    let sum = 0;
    const start = new Date(days[i]); const end = new Date(days[i+1]);
    Object.entries(state.streak.history).forEach(([date, hrs]) => {
      const d = new Date(date);
      if (d >= start && d < end) sum += hrs;
    });
    weekBuckets.push(sum);
  }
  weekBuckets.push(Object.entries(state.streak.history).filter(([d]) => new Date(d) >= new Date(days[days.length-1])).reduce((s,[,h])=>s+h,0));

  drawLineChart(svg, weekBuckets, 'h');
}

function drawLineChart(svg, values, unit) {
  const w = 560, h = 200, pad = 24;
  const max = Math.max(1, ...values);
  const stepX = (w - pad * 2) / Math.max(1, values.length - 1);
  const pts = values.map((v, i) => {
    const x = pad + i * stepX;
    const y = h - pad - (v / max) * (h - pad * 2);
    return [x, y];
  });
  const path = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const areaPath = path + ` L${pts[pts.length-1][0]},${h-pad} L${pts[0][0]},${h-pad} Z`;

  let grid = '';
  for (let i = 0; i <= 3; i++) {
    const y = pad + (i * (h - pad * 2)) / 3;
    grid += `<line x1="${pad}" y1="${y}" x2="${w-pad}" y2="${y}" stroke="var(--border)" stroke-width="1"/>`;
  }

  svg.innerHTML = `
    <defs>
      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/>
      </linearGradient>
    </defs>
    ${grid}
    <path d="${areaPath}" fill="url(#areaGrad)" stroke="none"/>
    <path d="${path}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    ${pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="var(--bg)" stroke="var(--accent)" stroke-width="2"/>`).join('')}
  `;
}

/* ---------------------------------------------------------
   11. STUDY PLAN
--------------------------------------------------------- */
let activeMonth = 1;

function renderStudy() {
  const overall = studyOverallProgress();
  $('#studyOverallBar').style.width = overall + '%';
  $('#studyOverallPct').textContent = overall + '%';

  // Build month tabs from actual data (supports custom months beyond 3)
  const allMonths = [...new Set(state.study.weeks.map(w => w.month))].sort((a,b) => a-b);
  const tabs = $('#monthTabs');
  tabs.innerHTML = allMonths.map(m =>
    `<button class="month-tab ${m===activeMonth?'is-active':''}" data-month="${m}">Mês ${m}</button>`
  ).join('') +
  `<button class="month-tab month-tab--add" id="addMonthBtn" title="Adicionar novo mês">+ Mês</button>`;
  $$('.month-tab[data-month]', tabs).forEach(btn => {
    btn.onclick = () => { activeMonth = Number(btn.dataset.month); renderStudy(); };
  });
  $('#addMonthBtn').onclick = () => {
    const nextMonth = Math.max(...allMonths) + 1;
    addNewWeek(nextMonth, true);
  };

  const weeks = state.study.weeks.filter(w => w.month === activeMonth);
  const content = $('#studyContent');

  // Add week button for this month
  const addWeekBtnHtml = `
    <button class="btn-ghost add-week-btn" id="addWeekBtn">+ Nova semana neste mês</button>`;

  content.innerHTML = weeks.map(weekHtml).join('') + addWeekBtnHtml;
  weeks.forEach(w => bindWeekEvents(w));

  // bind new-week button
  $('#addWeekBtn').onclick = () => addNewWeek(activeMonth, false);
}

function weekProgress(week) {
  const total = week.activities.length;
  const done = week.activities.filter(a => a.done).length;
  return total ? Math.round((done / total) * 100) : 0;
}

function weekHtml(week) {
  const pct = weekProgress(week);
  const topicsChips = (week.topics || []).map(t => `<span class="tag tag--time">${escapeHtml(t)}</span>`).join('');
  const grouped = { topico: [], exercicio: [], projeto: [], custom: [] };
  week.activities.forEach(a => {
    const bucket = a.custom ? 'custom' : (grouped[a.type] !== undefined ? a.type : 'custom');
    grouped[bucket].push(a);
  });

  const groupLabel = { topico: 'Tópicos de estudo', exercicio: 'Exercícios', projeto: 'Projetos', custom: 'Adicionadas por mim' };
  let body = '';
  Object.entries(grouped).forEach(([key, acts]) => {
    if (!acts.length) return;
    body += `<div class="activity-group-title">${groupLabel[key]}</div>`;
    body += acts.map(a => activityHtml(week.id, a)).join('');
  });

  const isCustomWeek = !!week.custom;

  return `
    <div class="week-block" data-week="${week.id}">
      <div class="week-head">
        <h4>${isCustomWeek ? '✏ ' : ''}Semana ${week.weekNum} · ${escapeHtml(week.title)}</h4>
        <div class="printbar"><div class="printbar-fill" style="width:${pct}%"></div></div>
        <span class="pct">${pct}%</span>
        <div class="week-actions">
          <button class="btn-ghost btn-sm week-edit-btn" data-week="${week.id}" title="Editar semana">✎</button>
          ${isCustomWeek ? `<button class="btn-ghost btn-sm week-del-btn" data-week="${week.id}" title="Remover semana">✕</button>` : ''}
          <button class="btn-ghost btn-sm week-add-act-btn" data-week="${week.id}" title="Adicionar atividade">+ Atividade</button>
        </div>
      </div>
      ${topicsChips ? `<div class="meta-row" style="margin-bottom:10px;">${topicsChips}</div>` : ''}
      ${body || '<p style="color:var(--text-faint);font-size:12.5px;padding:8px 0;">Nenhuma atividade nesta semana ainda.</p>'}
    </div>`;
}

const DIFF_LABEL = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' };
const PRIO_LABEL = { alta: 'Prioridade alta', media: 'Prioridade média', baixa: 'Prioridade baixa' };

function activityHtml(weekId, a) {
  const matItems = studyMaterials[a.id] || [];
  const hasMaterial = matItems.length > 0;
  const materialBtn = (hasMaterial || isAdmin)
    ? `<button class="link-btn act-material ${hasMaterial ? '' : 'act-material--empty'}" style="${hasMaterial ? '' : 'opacity:.45;'}">
        ${hasMaterial ? `📂 Material de apoio${matItems.length > 1 ? ` <span class="mat-count">${matItems.length}</span>` : ''}` : (isAdmin ? '📂 Adicionar material' : '')}
       </button>`
    : '';
  return `
    <div class="activity ${a.done ? 'is-done' : ''}" data-week="${weekId}" data-act="${a.id}">
      <div class="activity-top">
        <input type="checkbox" ${a.done ? 'checked' : ''} class="act-check">
        <div style="flex:1;">
          <div class="activity-title">${escapeHtml(a.title)}</div>
          <div class="activity-desc">${escapeHtml(a.desc)}</div>
          <div class="activity-meta">
            <span class="tag tag--time">⏱ ${a.time ? (hoursToHHMM(parseTimeToHours(a.time)) ? hoursToHHMM(parseTimeToHours(a.time))+'h' : escapeHtml(a.time)) : '—'}</span>
            <span class="tag tag--diff-${a.difficulty}">${DIFF_LABEL[a.difficulty] || ''}</span>
            <span class="tag tag--prio-${a.priority}">${PRIO_LABEL[a.priority] || ''}</span>
            ${a.custom ? '<span class="tag tag--custom">minha</span>' : ''}
          </div>
          <div class="activity-actions">
            ${materialBtn}
            <button class="btn-ghost btn-sm act-note-toggle">Observações</button>
            <button class="btn-primary btn-sm act-done">${a.done ? 'Concluído ✓' : 'Marcar concluído'}</button>
            ${a.custom ? `<button class="btn-ghost btn-sm act-edit-btn" title="Editar">✎</button><button class="btn-ghost btn-sm act-del-btn" style="color:var(--danger);" title="Remover">✕</button>` : ''}
          </div>
          <textarea class="note-input act-note" placeholder="Suas observações..." style="display:none;">${escapeHtml(a.notes)}</textarea>
        </div>
      </div>
    </div>`;
}

/* ---- Study plan: add / edit weeks and activities ---- */

function addNewWeek(month, switchToMonth = false) {
  const weeksInMonth = state.study.weeks.filter(w => w.month === month);
  const maxWeekNum   = state.study.weeks.reduce((mx, w) => Math.max(mx, w.weekNum), 0);
  const newWeek = {
    id: uid(), month, weekNum: maxWeekNum + 1,
    title: 'Nova semana', topics: [], activities: [], custom: true,
  };
  openModal('Nova semana', `
    <div class="field"><label>Título da semana</label>
      <input type="text" id="wkTitle" placeholder="Ex: Técnicas avançadas de modelagem">
    </div>
    <div class="field"><label>Tópicos (separados por vírgula)</label>
      <input type="text" id="wkTopics" placeholder="Ex: Fusion 360, Fillet, Tolerâncias">
    </div>
  `, [
    { label: 'Cancelar', cls: 'btn-ghost', onClick: closeModal },
    { label: 'Criar semana', cls: 'btn-primary', onClick: () => {
      const title = $('#wkTitle').value.trim() || 'Nova semana';
      const topics = $('#wkTopics').value.split(',').map(t => t.trim()).filter(Boolean);
      newWeek.title = title;
      newWeek.topics = topics;
      state.study.weeks.push(newWeek);
      if (switchToMonth) activeMonth = month;
      saveState(); closeModal(); renderStudy();
      toast(`Semana ${newWeek.weekNum} criada no Mês ${month}.`);
    }}
  ]);
}

function openWeekModal(week) {
  openModal('Editar semana', `
    <div class="field"><label>Título</label>
      <input type="text" id="wkEditTitle" value="${escapeHtml(week.title)}">
    </div>
    <div class="field"><label>Tópicos (separados por vírgula)</label>
      <input type="text" id="wkEditTopics" value="${(week.topics||[]).join(', ')}">
    </div>
  `, [
    { label: 'Cancelar', cls: 'btn-ghost', onClick: closeModal },
    { label: 'Salvar', cls: 'btn-primary', onClick: () => {
      week.title  = $('#wkEditTitle').value.trim() || week.title;
      week.topics = $('#wkEditTopics').value.split(',').map(t => t.trim()).filter(Boolean);
      saveState(); closeModal(); renderStudy();
      toast('Semana atualizada.');
    }}
  ]);
}

function openActivityModal(week, existing) {
  const isNew = !existing;
  const act = existing || {
    id: uid(), title: '', desc: '', time: '', difficulty: 'medio',
    priority: 'media', type: 'topico', notes: '', done: false, link: '', custom: true,
  };
  openModal(isNew ? 'Nova atividade' : 'Editar atividade', `
    <div class="field"><label>Título <span class="required-star">*</span></label>
      <input type="text" id="actTitle" value="${escapeHtml(act.title)}" placeholder="Ex: Praticar snap-fit">
    </div>
    <div class="field"><label>Descrição</label>
      <textarea id="actDesc" rows="2" placeholder="Descreva o objetivo desta atividade…">${escapeHtml(act.desc)}</textarea>
    </div>
    <div class="field-row">
      <div class="field"><label>Tempo estimado</label>
        <input type="text" id="actTime" value="${escapeHtml(act.time)}" placeholder="Ex: 1h30 ou 1,5hrs">
      </div>
      <div class="field"><label>Tipo</label>
        <select id="actType">
          <option value="topico"   ${act.type==='topico'   ?'selected':''}>Tópico</option>
          <option value="exercicio"${act.type==='exercicio'?'selected':''}>Exercício</option>
          <option value="projeto"  ${act.type==='projeto'  ?'selected':''}>Projeto</option>
        </select>
      </div>
    </div>
    <div class="field-row">
      <div class="field"><label>Dificuldade</label>
        <select id="actDiff">
          <option value="facil"  ${act.difficulty==='facil'  ?'selected':''}>Fácil</option>
          <option value="medio"  ${act.difficulty==='medio'  ?'selected':''}>Médio</option>
          <option value="dificil"${act.difficulty==='dificil'?'selected':''}>Difícil</option>
        </select>
      </div>
      <div class="field"><label>Prioridade</label>
        <select id="actPrio">
          <option value="alta" ${act.priority==='alta' ?'selected':''}>Alta</option>
          <option value="media"${act.priority==='media'?'selected':''}>Média</option>
          <option value="baixa"${act.priority==='baixa'?'selected':''}>Baixa</option>
        </select>
      </div>
    </div>
  `, [
    { label: 'Cancelar', cls: 'btn-ghost', onClick: closeModal },
    { label: isNew ? 'Adicionar' : 'Salvar', cls: 'btn-primary', onClick: () => {
      const title = $('#actTitle').value.trim();
      if (!title) { highlight('#actTitle', 'Título é obrigatório.'); return; }
      act.title      = title;
      act.desc       = $('#actDesc').value.trim();
      act.time       = $('#actTime').value.trim();
      act.type       = $('#actType').value;
      act.difficulty = $('#actDiff').value;
      act.priority   = $('#actPrio').value;
      act.custom     = true;
      if (isNew) week.activities.push(act);
      saveState(); closeModal(); renderStudy();
      toast(isNew ? 'Atividade adicionada.' : 'Atividade atualizada.');
    }}
  ]);
}

function bindWeekEvents(week) {
  const block = document.querySelector(`.week-block[data-week="${week.id}"]`);
  if (!block) return;

  // Week-level actions
  const editBtn = $('.week-edit-btn', block);
  if (editBtn) editBtn.onclick = () => openWeekModal(week);

  const delBtn = $('.week-del-btn', block);
  if (delBtn) delBtn.onclick = () => {
    openModal('Remover semana?', `<p style="font-size:13.5px;color:var(--text-muted);">A semana "${escapeHtml(week.title)}" e todas as suas atividades serão removidas.</p>`, [
      { label: 'Cancelar', cls: 'btn-ghost', onClick: closeModal },
      { label: 'Remover', cls: 'btn-danger', onClick: () => {
        state.study.weeks = state.study.weeks.filter(w => w.id !== week.id);
        saveState(); closeModal(); renderStudy();
        toast('Semana removida.');
      }}
    ]);
  };

  const addActBtn = $('.week-add-act-btn', block);
  if (addActBtn) addActBtn.onclick = () => openActivityModal(week, null);

  $$('.activity', block).forEach(actEl => {
    const actId = actEl.dataset.act;
    const activity = week.activities.find(a => a.id === actId);

    const finish = (done) => {
      const wasDone = activity.done;
      activity.done = done;
      if (done && !wasDone) registerStudyActivity(totalHoursFromActivity(activity.time));
      saveState();
      renderStudy();
    };

    $('.act-check', actEl).onchange = e => finish(e.target.checked);
    $('.act-done', actEl).onclick = () => finish(!activity.done);

    // Material de apoio: admin edita, usuário visualiza
    const matBtn = $('.act-material', actEl);
    if (matBtn) {
      matBtn.onclick = () => {
        const items = studyMaterials[actId] || [];
        if (isAdmin) openMaterialEditor(actId, activity.title, items);
        else openMaterialViewer(activity.title, items);
      };
    }

    const noteBox = $('.act-note', actEl);
    $('.act-note-toggle', actEl).onclick = () => {
      noteBox.style.display = noteBox.style.display === 'none' ? 'block' : 'none';
    };
    noteBox.onblur = () => { activity.notes = noteBox.value; saveState(); };

    // Edit / delete buttons (only on custom activities)
    const editActBtn = $('.act-edit-btn', actEl);
    if (editActBtn) editActBtn.onclick = () => openActivityModal(week, activity);

    const delActBtn = $('.act-del-btn', actEl);
    if (delActBtn) delActBtn.onclick = () => {
      week.activities = week.activities.filter(a => a.id !== activity.id);
      saveState(); renderStudy();
      toast('Atividade removida.');
    };
  });
}

// Admin: gerencia lista de materiais por atividade
function openMaterialEditor(actId, actTitle, items) {
  // work on a deep copy so cancel truly discards changes
  let draft = items.map(i => ({ ...i }));

  function renderEditorBody() {
    const listHtml = draft.length ? draft.map((item, idx) => `
      <div class="mat-editor-row" data-idx="${idx}">
        <div class="mat-editor-row-head">
          <span class="mat-type-badge mat-type-${item.type}">${item.type === 'video' ? '▶ Vídeo' : '📄 PDF'}</span>
          <input type="text" class="mat-title-input" value="${escapeHtml(item.title || '')}" placeholder="Título do material" data-idx="${idx}">
          <button class="ams-remove mat-del-btn" data-idx="${idx}" title="Remover">✕</button>
        </div>
        ${item.type === 'video' ? `
          <input type="text" class="mat-url-input" value="${escapeHtml(item.url || '')}" placeholder="https://youtube.com/watch?v=..." data-idx="${idx}">
        ` : `
          ${item.url ? `<div class="mat-current-file">📄 <a href="${escapeHtml(item.url)}" target="_blank">${escapeHtml(item.pdfName || 'Arquivo atual')}</a> <button class="btn-ghost btn-sm mat-pdf-remove" data-idx="${idx}">Remover</button></div>` : ''}
          <input type="file" class="mat-pdf-input" accept="application/pdf" data-idx="${idx}">
          <span class="field-hint">Máx. 20 MB</span>
        `}
      </div>`).join('<hr style="border:none;border-top:1px solid var(--border);margin:10px 0;">') :
      '<p style="color:var(--text-faint);font-size:12.5px;">Nenhum material ainda. Adicione abaixo.</p>';

    return `
      <p style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">Materiais visíveis para todos os usuários.</p>
      <div id="matEditorList">${listHtml}</div>
      <div class="mat-add-row">
        <button class="btn-ghost btn-sm" id="matAddVideo">+ Vídeo</button>
        <button class="btn-ghost btn-sm" id="matAddPdf">+ PDF</button>
      </div>`;
  }

  function reopen() { closeModal(); setTimeout(() => openMaterialEditor(actId, actTitle, draft), 80); }

  openModal(`📂 ${escapeHtml(actTitle)}`, renderEditorBody(), [
    { label: 'Cancelar', cls: 'btn-ghost', onClick: closeModal },
    { label: 'Salvar tudo', cls: 'btn-primary', onClick: async () => {
      // collect text fields back into draft
      $$('.mat-title-input').forEach(el => { draft[+el.dataset.idx].title = el.value.trim(); });
      $$('.mat-url-input').forEach(el => { draft[+el.dataset.idx].url = el.value.trim(); });

      // handle PDF uploads
      const uploadPromises = $$('.mat-pdf-input').map(async el => {
        const idx = +el.dataset.idx;
        if (!el.files.length) return;
        const file = el.files[0];
        if (file.size > 20 * 1024 * 1024) { toast(`PDF "${file.name}" muito grande — máx. 20 MB.`); return; }
        toast(`Enviando "${file.name}"…`);
        const path = `${actId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
        const result = await uploadToStorage('materials', path, file);
        if (result) { draft[idx].url = result.publicUrl; draft[idx].pdfName = file.name; }
      });
      await Promise.all(uploadPromises);

      // filter out items with no url
      draft = draft.filter(i => i.url);

      await saveStudyMaterials(actId, draft);
      closeModal();
      renderStudy();
      toast(`${draft.length} material(is) salvo(s).`);
    }}
  ]);

  setTimeout(() => {
    $('#matAddVideo').onclick = () => { draft.push({ id: uid(), type: 'video', title: '', url: '' }); reopen(); };
    $('#matAddPdf').onclick   = () => { draft.push({ id: uid(), type: 'pdf',   title: '', url: '', pdfName: '' }); reopen(); };

    $$('.mat-del-btn').forEach(btn => btn.onclick = () => { draft.splice(+btn.dataset.idx, 1); reopen(); });
    $$('.mat-pdf-remove').forEach(btn => btn.onclick = () => { draft[+btn.dataset.idx].url = ''; draft[+btn.dataset.idx].pdfName = ''; reopen(); });
  }, 50);
}

// Usuário: visualiza lista de materiais
function openMaterialViewer(actTitle, items) {
  if (!items || !items.length) {
    openModal(`📂 ${escapeHtml(actTitle)}`,
      '<p style="color:var(--text-faint);font-size:13px;">Nenhum material disponível ainda.</p>',
      [{ label: 'Fechar', cls: 'btn-ghost', onClick: closeModal }]
    );
    return;
  }

  const bodyHtml = items.map(item => {
    if (item.type === 'video') {
      const ytId = extractYouTubeId(item.url);
      return `
        <div class="mat-viewer-item">
          <div class="mat-viewer-label">▶ ${escapeHtml(item.title || 'Vídeo')}</div>
          ${ytId
            ? `<div class="video-embed-wrap"><iframe src="https://www.youtube.com/embed/${ytId}" frameborder="0" allowfullscreen></iframe></div>`
            : `<a class="btn-ghost" href="${escapeHtml(item.url)}" target="_blank">▶ Abrir vídeo</a>`}
        </div>`;
    } else {
      return `
        <div class="mat-viewer-item">
          <a class="btn-ghost mat-pdf-btn" href="${escapeHtml(item.url)}" target="_blank">
            📄 ${escapeHtml(item.title || item.pdfName || 'Baixar PDF')}
          </a>
        </div>`;
    }
  }).join('');

  openModal(`📂 ${escapeHtml(actTitle)}`, bodyHtml,
    [{ label: 'Fechar', cls: 'btn-ghost', onClick: closeModal }]
  );
}

function extractYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

/* ---------------------------------------------------------
   12. PROJECTS (KANBAN)
--------------------------------------------------------- */
const KANBAN_COLUMNS = [
  { key: 'ideias', label: 'Ideias' },
  { key: 'modelando', label: 'Modelando' },
  { key: 'imprimindo', label: 'Imprimindo' },
  { key: 'testando', label: 'Testando' },
  { key: 'pronto', label: 'Pronto' },
  { key: 'vendendo', label: 'Vendendo' },
];

function renderProjects() {
  const board = $('#kanbanBoard');
  board.innerHTML = KANBAN_COLUMNS.map(col => {
    const items = state.projects.filter(p => p.column === col.key);
    return `
      <div class="kanban-col" data-col="${col.key}">
        <div class="kanban-col-head"><h4>${col.label}</h4><span class="kanban-count">${items.length}</span></div>
        <div class="kanban-list" data-col-list="${col.key}">
          ${items.map(cardHtml).join('')}
        </div>
      </div>`;
  }).join('');

  bindKanbanDnD();
  $$('.kanban-card').forEach(card => {
    card.onclick = (e) => { if (e.target.tagName !== 'SELECT') openProjectModal(card.dataset.id); };
    $('select', card).onchange = e => {
      const p = state.projects.find(x => x.id === card.dataset.id);
      p.column = e.target.value; saveState(); renderProjects(); renderDashboard();
    };
  });
}

function cardHtml(p) {
  const options = KANBAN_COLUMNS.map(c => `<option value="${c.key}" ${c.key===p.column?'selected':''}>${c.label}</option>`).join('');
  return `
    <div class="kanban-card" draggable="true" data-id="${p.id}">
      ${p.photo ? `<img src="${escapeHtml(p.photo)}" alt="">` : ''}
      <h5>${escapeHtml(p.title)}</h5>
      <p>${escapeHtml(p.desc || '')}</p>
      <div class="meta-row">
        ${p.printTime ? `<span class="tag tag--time">⏱ ${hoursToHHMM(parseTimeToHours(p.printTime)) || p.printTime}</span>` : ''}
        ${p.weight ? `<span class="tag tag--time">⚖ ${escapeHtml(p.weight)}g</span>` : ''}
        ${p.version ? `<span class="tag tag--time">v${escapeHtml(p.version)}</span>` : ''}
      </div>
      <select onclick="event.stopPropagation()">${options}</select>
    </div>`;
}

function bindKanbanDnD() {
  let draggedId = null;
  $$('.kanban-card').forEach(card => {
    card.addEventListener('dragstart', () => { draggedId = card.dataset.id; setTimeout(() => card.style.opacity = '.4', 0); });
    card.addEventListener('dragend', () => { card.style.opacity = '1'; });
  });
  $$('.kanban-list').forEach(list => {
    list.addEventListener('dragover', e => { e.preventDefault(); list.closest('.kanban-col').dataset.dropActive = 'true'; });
    list.addEventListener('dragleave', () => { list.closest('.kanban-col').dataset.dropActive = 'false'; });
    list.addEventListener('drop', e => {
      e.preventDefault();
      list.closest('.kanban-col').dataset.dropActive = 'false';
      const p = state.projects.find(x => x.id === draggedId);
      if (p) { p.column = list.dataset.colList; saveState(); renderProjects(); renderDashboard(); }
    });
  });
}

function openProjectModal(id) {
  const p = id ? state.projects.find(x => x.id === id) : {
    id: uid(), title: '', photo: '', desc: '', date: todayISO(), version: '1', printTime: '', weight: '', filament: '', notes: '', column: 'ideias'
  };
  const isNew = !id;

  openModal(isNew ? 'Novo projeto' : 'Editar projeto', `
    <div class="field"><label>Título</label><input type="text" id="pTitle" value="${escapeHtml(p.title)}"></div>
    <div class="field"><label>Foto (URL)</label><input type="text" id="pPhoto" value="${escapeHtml(p.photo)}" placeholder="https://..."></div>
    <div class="field"><label>Descrição</label><textarea id="pDesc">${escapeHtml(p.desc)}</textarea></div>
    <div class="field-row">
      <div class="field"><label>Data</label><input type="date" id="pDate" value="${p.date}"></div>
      <div class="field"><label>Versão</label><input type="text" id="pVersion" value="${escapeHtml(p.version)}"></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Tempo de impressão</label>
        <div class="printtime-input-wrap">
          <input type="text" id="pPrintTime" value="${escapeHtml(p.printTime)}" placeholder="Ex: 2,7hrs ou 1h30">
          <span class="printtime-tag" id="pPrintTimeTag" style="display:none;">${p.printTime ? (hoursToHHMM(parseTimeToHours(p.printTime)) ? hoursToHHMM(parseTimeToHours(p.printTime))+'h' : '') : ''}</span>
        </div>
      </div>
      <div class="field"><label>Peso (g)</label><input type="number" id="pWeight" value="${escapeHtml(p.weight)}"></div>
    </div>
    <div class="field"><label>Filamento</label><input type="text" id="pFilament" value="${escapeHtml(p.filament)}" placeholder="Ex: PETG Preto"></div>
    <div class="field"><label>Observações</label><textarea id="pNotes">${escapeHtml(p.notes)}</textarea></div>
  `, [
    ...(isNew ? [] : [{ label: 'Excluir', cls: 'btn-danger', onClick: () => {
      state.projects = state.projects.filter(x => x.id !== id);
      saveState(); closeModal(); renderProjects(); renderDashboard();
    }}]),
    { label: 'Cancelar', cls: 'btn-ghost', onClick: closeModal },
    { label: 'Salvar', cls: 'btn-primary', onClick: () => {
      p.title = $('#pTitle').value.trim() || 'Sem título';
      p.photo = $('#pPhoto').value.trim();
      p.desc = $('#pDesc').value.trim();
      p.date = $('#pDate').value;
      p.version = $('#pVersion').value.trim();
      p.printTime = $('#pPrintTime').value.trim();
      p.weight = $('#pWeight').value;
      p.filament = $('#pFilament').value.trim();
      p.notes = $('#pNotes').value.trim();
      if (isNew) state.projects.push(p);
      saveState(); closeModal(); renderProjects(); renderDashboard();
      toast(isNew ? 'Projeto criado.' : 'Projeto atualizado.');
    }}
  ]);

  setTimeout(() => {
    const ptInput = $('#pPrintTime');
    const ptTag   = $('#pPrintTimeTag');
    if (ptInput && ptTag) {
      const upd = () => {
        const fmt = hoursToHHMM(parseTimeToHours(ptInput.value));
        ptTag.textContent = fmt ? fmt + 'h' : '';
        ptTag.style.display = fmt ? '' : 'none';
      };
      ptInput.addEventListener('input', upd); upd();
    }
  }, 50);
}
$('#addProjectBtn').onclick = () => openProjectModal(null);

/* ---------------------------------------------------------
   13. IDEAS
--------------------------------------------------------- */
function renderIdeas() {
  const grid = $('#ideasGrid');
  if (!state.ideas.length) { grid.innerHTML = emptyState('💡', 'Nenhuma ideia registrada ainda.'); return; }
  grid.innerHTML = state.ideas.map(idea => `
    <div class="item-card" data-id="${idea.id}">
      ${idea.image ? `<img src="${escapeHtml(idea.image)}" alt="">` : ''}
      <h4>${escapeHtml(idea.title)}</h4>
      <div class="item-cat">${escapeHtml(idea.category || 'Sem categoria')}</div>
      <div class="item-desc">${escapeHtml(idea.desc || '')}</div>
      <div class="meta-row">
        <span class="tag tag--prio-${idea.priority}">${PRIO_LABEL[idea.priority] || idea.priority}</span>
        <span class="tag tag--time">${escapeHtml(idea.status || '')}</span>
      </div>
      <div class="card-actions"><button class="btn-ghost btn-sm idea-edit">Editar</button></div>
    </div>`).join('');
  $$('.idea-edit', grid).forEach(btn => btn.onclick = e => openIdeaModal(e.target.closest('.item-card').dataset.id));
}

function openIdeaModal(id) {
  const idea = id ? state.ideas.find(x => x.id === id) : { id: uid(), title:'', image:'', desc:'', category:'', priority:'media', status:'Nova', notes:'' };
  const isNew = !id;
  openModal(isNew ? 'Nova ideia' : 'Editar ideia', `
    <div class="field"><label>Título</label><input type="text" id="iTitle" value="${escapeHtml(idea.title)}"></div>
    <div class="field"><label>Imagem (URL)</label><input type="text" id="iImage" value="${escapeHtml(idea.image)}"></div>
    <div class="field"><label>Descrição</label><textarea id="iDesc">${escapeHtml(idea.desc)}</textarea></div>
    <div class="field-row">
      <div class="field"><label>Categoria</label><input type="text" id="iCategory" value="${escapeHtml(idea.category)}"></div>
      <div class="field"><label>Prioridade</label>
        <select id="iPriority">
          <option value="alta" ${idea.priority==='alta'?'selected':''}>Alta</option>
          <option value="media" ${idea.priority==='media'?'selected':''}>Média</option>
          <option value="baixa" ${idea.priority==='baixa'?'selected':''}>Baixa</option>
        </select>
      </div>
    </div>
    <div class="field"><label>Status</label><input type="text" id="iStatus" value="${escapeHtml(idea.status)}" placeholder="Nova, em análise, aprovada..."></div>
    <div class="field"><label>Observações</label><textarea id="iNotes">${escapeHtml(idea.notes)}</textarea></div>
  `, [
    ...(isNew ? [] : [{ label: 'Excluir', cls: 'btn-danger', onClick: () => { state.ideas = state.ideas.filter(x=>x.id!==id); saveState(); closeModal(); renderIdeas(); }}]),
    { label: 'Cancelar', cls: 'btn-ghost', onClick: closeModal },
    { label: 'Salvar', cls: 'btn-primary', onClick: () => {
      idea.title = $('#iTitle').value.trim() || 'Sem título';
      idea.image = $('#iImage').value.trim();
      idea.desc = $('#iDesc').value.trim();
      idea.category = $('#iCategory').value.trim();
      idea.priority = $('#iPriority').value;
      idea.status = $('#iStatus').value.trim();
      idea.notes = $('#iNotes').value.trim();
      if (isNew) state.ideas.push(idea);
      saveState(); closeModal(); renderIdeas();
      toast(isNew ? 'Ideia adicionada.' : 'Ideia atualizada.');
    }}
  ]);
}
$('#addIdeaBtn').onclick = () => openIdeaModal(null);

/* ---------------------------------------------------------
   14. PRODUCTS
--------------------------------------------------------- */
function renderProducts() {
  const grid = $('#productsGrid');
  if (!state.products.length) { grid.innerHTML = emptyState('📦', 'Nenhum produto cadastrado ainda.'); return; }
  grid.innerHTML = state.products.map(p => {
    const margin = p.price ? Math.round(((p.price - p.cost) / p.price) * 100) : 0;
    const profit = (p.price - p.cost) * (p.sold || 0);
    const fileBtn = p.projectFileUrl
      ? `<a class="btn-ghost btn-sm" href="${escapeHtml(p.projectFileUrl)}" target="_blank" download title="Baixar arquivo do projeto">📎 Projeto</a>`
      : '';
    return `
    <div class="item-card" data-id="${p.id}">
      ${p.image ? `<img src="${escapeHtml(p.image)}" alt="">` : ''}
      <h4>${escapeHtml(p.name)}</h4>
      <div class="item-cat">${escapeHtml(p.category || 'Sem categoria')} · <span class="status-badge status-${p.status}">${statusLabel(p.status)}</span></div>
      <div class="price-row"><strong>${brl(p.price)}</strong><span style="font-size:11px;color:var(--text-faint);">custo ${brl(p.cost)}</span></div>
      <div class="meta-row">
        <span class="tag tag--time">margem ${margin}%</span>
        <span class="tag tag--time">${p.sold || 0} vendidos</span>
        <span class="tag tag--time">lucro ${brl(profit)}</span>
      </div>
      <div class="card-actions">
        <button class="btn-ghost btn-sm prod-edit">Editar</button>
        ${fileBtn}
      </div>
    </div>`;
  }).join('');
  $$('.prod-edit', grid).forEach(btn => btn.onclick = e => openProductModal(e.target.closest('.item-card').dataset.id));
}
function statusLabel(s) { return { rascunho: 'Rascunho', teste: 'Em teste', publicado: 'Publicado' }[s] || s; }

function openProductModal(id) {
  const p = id ? state.products.find(x => x.id === id) : {
    id: uid(), name:'', category:'', price:0, cost:0, weight:0, printTime:'',
    sold:0, image:'', status:'rascunho', projectFileUrl:'', projectFileName:'',
    extraCost:0, filaments:[], notes:''
  };
  const isNew = !id;

  // ensure filaments is always an array
  if (!Array.isArray(p.filaments)) p.filaments = [];

  const currentFile = p.projectFileUrl
    ? `<div class="mat-current-file">📎 <a href="${escapeHtml(p.projectFileUrl)}" target="_blank">${escapeHtml(p.projectFileName || 'Arquivo atual')}</a> <button class="btn-ghost btn-sm" id="prRemoveFile">Remover</button></div>`
    : '';

  const catOptions = `<option value="">Sem categoria</option>` +
    state.productCategories.map(c => `<option value="${escapeHtml(c.name)}" ${p.category===c.name?'selected':''}>${escapeHtml(c.name)}</option>`).join('');

  openModal(isNew ? 'Novo produto' : 'Editar produto', `
    <div class="field field--required"><label>Nome <span class="required-star">*</span></label><input type="text" id="prName" value="${escapeHtml(p.name)}" placeholder="Nome do produto"></div>
    <div class="field"><label>Imagem (URL)</label><input type="text" id="prImage" value="${escapeHtml(p.image)}" placeholder="https://..."></div>
    <div class="field-row">
      <div class="field field--required"><label>Categoria <span class="required-star">*</span></label><select id="prCategory">${catOptions}</select></div>
      <div class="field"><label>Status</label>
        <select id="prStatus">
          <option value="rascunho" ${p.status==='rascunho'?'selected':''}>Rascunho</option>
          <option value="teste"    ${p.status==='teste'   ?'selected':''}>Em teste</option>
          <option value="publicado"${p.status==='publicado'?'selected':''}>Publicado</option>
        </select>
      </div>
    </div>
    <div class="field-row">
      <div class="field"><label>Preço (R$) <span id="prPriceRequired" class="required-star" style="display:none;">*</span></label><input type="number" step="0.01" id="prPrice" value="${p.price || ''}"></div>
      <div class="field"><label>Custo (R$) <span style="font-size:10px;color:var(--text-faint);">calculado</span></label>
        <input type="number" step="0.01" id="prCost" value="${p.cost}" readonly tabindex="-1" style="background:var(--surface-3);color:var(--text-muted);cursor:not-allowed;">
      </div>
    </div>
    <div class="field-row">
      <div class="field"><label>Peso total (g) <span style="font-size:10px;color:var(--text-faint);">calculado</span></label>
        <input type="number" id="prWeight" value="${p.weight}" readonly tabindex="-1" style="background:var(--surface-3);color:var(--text-muted);cursor:not-allowed;">
      </div>
      <div class="field"><label>Tempo de impressão</label>
        <div class="printtime-input-wrap">
          <input type="text" id="prPrintTime" value="${escapeHtml(p.printTime)}" placeholder="Ex: 2,7hrs ou 2h42">
          <span class="printtime-tag" id="prPrintTimeTag">${p.printTime ? (hoursToHHMM(parseTimeToHours(p.printTime)) ? hoursToHHMM(parseTimeToHours(p.printTime)) + 'h' : '') : ''}</span>
        </div>
      </div>
    </div>

    <!-- Multi-filament AMS -->
    <div class="field">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <label>Filamentos (AMS) <span id="prFilamentRequired" class="required-star" style="display:none;">*</span></label>
        <button type="button" class="btn-ghost btn-sm" id="prAddFilamentRow">+ Adicionar filamento</button>
      </div>
      <div id="prFilamentRows"></div>
      <div class="ams-total-row">
        <span class="ams-total-label">Peso total calculado:</span>
        <span class="ams-total-value" id="amsTotalWeight">0 g</span>
        <button type="button" class="btn-ghost btn-sm" id="amsApplyWeight" title="Preencher campo de peso com este valor">↑ Usar como peso</button>
      </div>
    </div>

    <!-- Desperdício de filamento -->
    <div class="field">
      <label>Desperdício de filamento (%)</label>
      <div class="waste-row">
        <input type="number" id="prWastePct" min="0" max="100" step="0.5" value="${p.wastePct || 0}" placeholder="0">
        <span class="waste-hint" id="wasteHint">+ R$ 0,00 sobre o custo de filamento</span>
      </div>
      <span class="field-hint">Percentual aplicado sobre o custo total de filamentos (suporte, purga, falhas).</span>
    </div>

    <div class="field"><label>Custos extras (R$) — embalagem, mão de obra etc.</label><input type="number" step="0.01" id="prExtraCost" value="${p.extraCost || 0}"></div>
    <div class="cost-calc-box">
      <button type="button" class="btn-ghost btn-sm" id="prCalcCostBtn">🧮 Calcular custo automaticamente</button>
      <p class="cost-calc-breakdown" id="prCostBreakdown"></p>
    </div>
    <div class="field">
      <label>Arquivo do projeto (.3mf, .stl, .f3d, .step…)</label>
      ${currentFile}
      <input type="file" id="prProjectFile" accept=".3mf,.stl,.f3d,.step,.stp,.obj,.zip" style="margin-top:6px;">
      <span class="field-hint">Máx. 50 MB. ${cloudMode ? 'Salvo no Supabase Storage.' : 'Disponível apenas no modo nuvem.'}</span>
    </div>
    <div class="field"><label>Observações</label><textarea id="prNotes">${escapeHtml(p.notes||'')}</textarea></div>
  `, [
    ...(isNew ? [] : [{ label: 'Excluir', cls: 'btn-danger', onClick: async () => {
      if (p.projectFileUrl && cloudMode) await deleteFromStorage('products', p.projectFileName);
      state.products = state.products.filter(x => x.id !== id);
      if (cloudMode) await deleteCloudProduct(id);
      saveState(); closeModal(); renderProducts(); renderDashboard();
      toast('Produto removido.');
    }}]),
    { label: 'Cancelar', cls: 'btn-ghost', onClick: closeModal },
    { label: 'Salvar', cls: 'btn-primary', onClick: async () => {
      const name     = $('#prName').value.trim();
      const category = $('#prCategory').value;
      const status   = $('#prStatus').value;
      const price    = Number($('#prPrice').value) || 0;
      const filRows  = collectFilamentRows();

      // ---- Validações ----
      if (!name) {
        highlight('#prName', 'Nome é obrigatório.'); return;
      }
      if (!category) {
        highlight('#prCategory', 'Categoria é obrigatória.'); return;
      }
      if (status === 'publicado') {
        if (!price || price <= 0) {
          highlight('#prPrice', 'Preço é obrigatório para publicar.'); return;
        }
        if (!filRows.length) {
          toast('Adicione ao menos um filamento para publicar.'); return;
        }
        if (!filRows.some(r => r.grams > 0)) {
          toast('Informe o peso (g) de pelo menos um filamento para publicar.'); return;
        }
      }

      p.name     = name;
      p.image    = $('#prImage').value.trim();
      p.category = category;
      p.status   = status;
      p.price    = price;
      p.cost     = Number($('#prCost').value) || 0;
      p.printTime= $('#prPrintTime').value.trim();
      p.extraCost= Number($('#prExtraCost').value) || 0;
      p.wastePct = Number($('#prWastePct').value) || 0;
      p.notes    = $('#prNotes').value.trim();
      p.filaments = filRows;
      // weight = sum of all filament grams
      p.weight = filRows.reduce((s, r) => s + (Number(r.grams) || 0), 0);

      // handle file remove
      const removeBtn = $('#prRemoveFile');
      if (removeBtn && removeBtn.dataset.remove === 'true' && cloudMode) {
        await deleteFromStorage('products', p.projectFileUrl);
        p.projectFileUrl = ''; p.projectFileName = '';
      }

      // handle file upload
      const fileInput = $('#prProjectFile');
      if (fileInput && fileInput.files.length > 0 && cloudMode) {
        const file = fileInput.files[0];
        if (file.size > 50 * 1024 * 1024) { toast('Arquivo muito grande — máx. 50 MB.'); return; }
        toast('Enviando arquivo do projeto...');
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `${currentUser.id}/${p.id}_${safeName}`;
        const result = await uploadToStorage('products', path, file);
        if (!result) { toast('Erro no upload. Tente novamente.'); return; }
        p.projectFileUrl  = result.publicUrl;
        p.projectFileName = file.name;
      } else if (fileInput && fileInput.files.length > 0 && !cloudMode) {
        toast('Login necessário para salvar arquivos na nuvem.');
      }

      if (isNew) state.products.push(p);
      else { const idx = state.products.findIndex(x => x.id === p.id); if (idx >= 0) state.products[idx] = p; }

      if (cloudMode) await upsertCloudProduct(p);
      saveState(); closeModal(); renderProducts(); renderDashboard();
      toast(isNew ? 'Produto criado.' : 'Produto atualizado.');
    }}
  ]);

  // ---- setup multi-filament UI after modal renders ----
  setTimeout(() => {
    // wire printTime → live h:mm preview
    const ptInput = $('#prPrintTime');
    const ptTag   = $('#prPrintTimeTag');
    if (ptInput && ptTag) {
      const updatePtTag = () => {
        const h = parseTimeToHours(ptInput.value);
        const fmt = hoursToHHMM(h);
        ptTag.textContent = fmt ? fmt + 'h' : '';
        ptTag.style.display = fmt ? '' : 'none';
      };
      ptInput.addEventListener('input', updatePtTag);
      updatePtTag();
    }

    if (p.filaments && p.filaments.length) {
      p.filaments.forEach(row => addFilamentRow(row.filamentId, row.grams || 0, row.lockedPrice ?? null));
      updateAmsTotal();
    }

    $('#prAddFilamentRow').onclick = () => { addFilamentRow('', 0); updateAmsTotal(); };

    const removeBtn = $('#prRemoveFile');
    if (removeBtn) removeBtn.onclick = () => { removeBtn.dataset.remove='true'; removeBtn.textContent='✕ Removido'; removeBtn.disabled=true; };

    $('#prCalcCostBtn').onclick = () => calcProductCost();

    // wire waste % input to update hint live
    const wasteInput = $('#prWastePct');
    if (wasteInput) wasteInput.oninput = () => updateWasteHint();

    const statusSel = $('#prStatus');
    const syncRequired = () => {
      const isPublished = statusSel.value === 'publicado';
      $('#prPriceRequired').style.display    = isPublished ? '' : 'none';
      $('#prFilamentRequired').style.display = isPublished ? '' : 'none';
    };
    statusSel.addEventListener('change', syncRequired);
    syncRequired();
  }, 50);
}

/* ---- multi-filament helpers ---- */
function filamentSelectHtml(selectedId) {
  const opts = state.filaments.map(f =>
    `<option value="${f.id}" ${f.id===selectedId?'selected':''}>${escapeHtml(f.name)} — ${brl(f.pricePerKg)}/kg</option>`
  ).join('');
  return `<option value="">Selecione…</option>${opts}`;
}

function addFilamentRow(filamentId = '', grams = 0, lockedPrice = null) {
  const container = $('#prFilamentRows');
  if (!container) return;
  const rowId = uid();
  const f = state.filaments.find(x => x.id === filamentId);
  const price = lockedPrice !== null ? lockedPrice : (f ? f.pricePerKg : '');
  const row = document.createElement('div');
  row.className = 'ams-row';
  row.dataset.rowId = rowId;
  row.dataset.lockedPrice = price;
  row.innerHTML = `
    <select class="ams-select">${filamentSelectHtml(filamentId)}</select>
    <div class="ams-pct-input-wrap">
      <input type="number" class="ams-grams-input" min="0" step="0.1" value="${grams > 0 ? grams : ''}" placeholder="0">
      <span class="ams-pct-sign">g</span>
    </div>
    <button type="button" class="ams-remove" title="Remover">✕</button>`;

  row.querySelector('.ams-select').onchange = e => {
    const selected = state.filaments.find(x => x.id === e.target.value);
    row.dataset.lockedPrice = selected ? selected.pricePerKg : '';
    updateAmsTotal();
  };
  row.querySelector('.ams-remove').onclick = () => { row.remove(); updateAmsTotal(); };
  row.querySelector('.ams-grams-input').oninput = updateAmsTotal;
  container.appendChild(row);
}

function collectFilamentRows() {
  return $$('.ams-row').map(row => ({
    filamentId: row.querySelector('.ams-select').value,
    grams: Number(row.querySelector('.ams-grams-input').value) || 0,
    lockedPrice: Number(row.dataset.lockedPrice) || null,
  })).filter(r => r.filamentId);
}

function updateAmsTotal() {
  const rows = collectFilamentRows();
  const totalG = rows.reduce((s, r) => s + r.grams, 0);
  const totalEl = $('#amsTotalWeight');
  if (totalEl) totalEl.textContent = totalG.toFixed(1) + ' g';
  // also update the locked weight field
  const wField = $('#prWeight');
  if (wField) wField.value = totalG.toFixed(1);
  // update waste hint live
  updateWasteHint(rows);
}

function updateWasteHint(rows) {
  const wastePct = Number($('#prWastePct').value) || 0;
  const hint = $('#wasteHint');
  if (!hint) return;
  if (!rows) rows = collectFilamentRows();
  // compute raw filament cost from rows
  let rawCost = 0;
  rows.forEach(r => {
    const pricePerKg = (r.lockedPrice && r.lockedPrice > 0) ? r.lockedPrice : (state.filaments.find(x=>x.id===r.filamentId)?.pricePerKg || 0);
    rawCost += r.grams * (pricePerKg / 1000);
  });
  const wasteCost = rawCost * (wastePct / 100);
  hint.textContent = wastePct > 0 ? `+ ${brl(wasteCost)} sobre o custo de filamento` : '+ R$ 0,00 sobre o custo de filamento';
}

function calcProductCost() {
  const printTimeStr = $('#prPrintTime').value.trim();
  const extra      = Number($('#prExtraCost').value) || 0;
  const wastePct   = Number($('#prWastePct').value) || 0;
  const hours      = parseTimeToHours(printTimeStr);
  const rows       = collectFilamentRows();
  const totalG     = rows.reduce((s, r) => s + r.grams, 0);

  if (!totalG) {
    $('#prCostBreakdown').innerHTML = '<span class="cost-calc-warn">Adicione ao menos um filamento com peso (g) para calcular.</span>';
    return;
  }
  if (!hours) {
    $('#prCostBreakdown').innerHTML = '<span class="cost-calc-warn">Preencha o tempo de impressão para calcular.</span>';
    highlight('#prPrintTime', 'Tempo de impressão é obrigatório para o cálculo.');
    return;
  }

  // filament cost per row using locked price
  let filamentCost = 0;
  let filamentLines = '';
  if (rows.length) {
    rows.forEach(r => {
      const f = state.filaments.find(x => x.id === r.filamentId);
      const pricePerKg = (r.lockedPrice && r.lockedPrice > 0) ? r.lockedPrice : (f ? f.pricePerKg : 0);
      const cost = r.grams * (pricePerKg / 1000);
      filamentCost += cost;
      const priceNote = (r.lockedPrice && f && r.lockedPrice !== f.pricePerKg)
        ? ` <span style="color:var(--warn);font-size:10px;" title="Preço atual no catálogo: ${brl(f.pricePerKg)}/kg">histórico</span>`
        : '';
      filamentLines += `&nbsp;&nbsp;↳ ${escapeHtml(f ? f.name : r.filamentId)}: ${r.grams.toFixed(1)}g × ${brl(pricePerKg)}/kg${priceNote} = <strong>${brl(cost)}</strong><br>`;
    });
  } else {
    filamentLines = '<span class="cost-calc-warn">Nenhum filamento adicionado.</span><br>';
  }

  const wasteCost  = filamentCost * (wastePct / 100);
  const powerKW    = (state.finance.printerPower || 0) / 1000;
  const energyCost = hours * powerKW * (state.finance.energyPrice || 0);
  const total      = filamentCost + wasteCost + energyCost + extra;

  $('#prCost').value = total.toFixed(2);
  $('#prCostBreakdown').innerHTML = `
    Filamento: <strong>${brl(filamentCost)}</strong> (${totalG.toFixed(1)}g total)<br>
    ${filamentLines}
    Desperdício (${wastePct}%): <strong>${brl(wasteCost)}</strong><br>
    Energia: <strong>${brl(energyCost)}</strong> (${hours.toFixed(2)}h × ${state.finance.printerPower||0}W × ${brl(state.finance.energyPrice||0)}/kWh)<br>
    Extras: <strong>${brl(extra)}</strong><br>
    <span style="color:var(--accent);font-weight:600;">Total estimado: ${brl(total)}</span>
  `;
}

$('#addProductBtn').onclick = () => openProductModal(null);

/* ---------------------------------------------------------
   CALCULADORA RÁPIDA DE CUSTO
--------------------------------------------------------- */
function openQuickCalc() {
  // Build filament select options
  const filOpts = state.filaments.length
    ? state.filaments.map(f => `<option value="${f.id}">${escapeHtml(f.name)} — ${brl(f.pricePerKg)}/kg</option>`).join('')
    : '<option value="">Nenhum filamento cadastrado</option>';

  openModal('🧮 Calculadora rápida', `
    <p style="font-size:12.5px;color:var(--text-muted);margin-bottom:4px;">Calcule o custo de impressão sem precisar criar um produto.</p>

    <div class="field-row">
      <div class="field">
        <label>Peso do filamento (g) <span class="required-star">*</span></label>
        <input type="number" id="qcWeight" min="0" step="0.1" placeholder="Ex: 45">
      </div>
      <div class="field">
        <label>Tempo de impressão <span class="required-star">*</span></label>
        <div class="printtime-input-wrap">
          <input type="text" id="qcTime" placeholder="Ex: 2,7hrs ou 1h30">
          <span class="printtime-tag" id="qcTimeTag" style="display:none;"></span>
        </div>
      </div>
    </div>

    <div class="field">
      <label>Filamento <span class="required-star">*</span></label>
      <select id="qcFilament">
        <option value="">Selecione…</option>
        ${filOpts}
      </select>
    </div>

    <div class="field">
      <label>Preço do filamento (R$/kg) <span class="required-star">*</span></label>
      <input type="number" step="0.01" id="qcPrice" placeholder="Preenchido ao selecionar">
    </div>

    <div class="field">
      <label>Desperdício (%)</label>
      <div class="waste-row">
        <input type="number" id="qcWaste" min="0" max="100" step="0.5" value="0">
        <span class="waste-hint" id="qcWasteHint">+ R$ 0,00</span>
      </div>
    </div>

    <button class="btn-primary" id="qcCalcBtn" style="width:100%;margin-top:4px;">Calcular</button>

    <div class="qc-result" id="qcResult" style="display:none;">
      <div class="qc-result-grid">
        <div class="qc-result-row">
          <span>Filamento</span>
          <span id="qcResFilament">—</span>
        </div>
        <div class="qc-result-row">
          <span>Desperdício</span>
          <span id="qcResWaste">—</span>
        </div>
        <div class="qc-result-row">
          <span>Energia</span>
          <span id="qcResEnergy">—</span>
        </div>
        <div class="qc-result-row qc-result-total">
          <span>Total estimado</span>
          <span id="qcResTotal">—</span>
        </div>
      </div>
      <div class="qc-result-tags" id="qcResTags"></div>
    </div>
  `, [
    { label: 'Fechar', cls: 'btn-ghost', onClick: closeModal },
  ]);

  setTimeout(() => {
    // auto-fill price when filament selected
    $('#qcFilament').onchange = e => {
      const f = state.filaments.find(x => x.id === e.target.value);
      if (f) {
        $('#qcPrice').value = f.pricePerKg.toFixed(2);
        updateQcWasteHint();
      }
    };

    // live time tag
    $('#qcTime').addEventListener('input', () => {
      const fmt = hoursToHHMM(parseTimeToHours($('#qcTime').value));
      const tag = $('#qcTimeTag');
      tag.textContent = fmt ? fmt + 'h' : '';
      tag.style.display = fmt ? '' : 'none';
    });

    // live waste hint
    const updateQcWasteHint = () => {
      const weightG    = Number($('#qcWeight').value) || 0;
      const pricePerKg = Number($('#qcPrice').value) || 0;
      const wastePct   = Number($('#qcWaste').value) || 0;
      const rawCost    = weightG * (pricePerKg / 1000);
      const wasteCost  = rawCost * (wastePct / 100);
      $('#qcWasteHint').textContent = wastePct > 0 ? `+ ${brl(wasteCost)}` : '+ R$ 0,00';
    };
    $('#qcWeight').addEventListener('input', updateQcWasteHint);
    $('#qcPrice').addEventListener('input', updateQcWasteHint);
    $('#qcWaste').addEventListener('input', updateQcWasteHint);

    // calc
    $('#qcCalcBtn').onclick = () => {
      const weightG    = Number($('#qcWeight').value) || 0;
      const timeStr    = $('#qcTime').value.trim();
      const filId      = $('#qcFilament').value;
      const pricePerKg = Number($('#qcPrice').value) || 0;
      const wastePct   = Number($('#qcWaste').value) || 0;

      // validate all required — each field gets its own clear message
      if (!weightG)    { toast('Informe o peso do filamento (g).'); return; }
      if (!timeStr)    { toast('Informe o tempo de impressão.'); return; }
      if (!filId)      { toast('Selecione um filamento.'); return; }
      if (!pricePerKg) { toast('Informe o preço do filamento (R$/kg).'); return; }

      const hours       = parseTimeToHours(timeStr);
      const filCost     = weightG * (pricePerKg / 1000);
      const wasteCost   = filCost * (wastePct / 100);
      const powerKW     = (state.finance.printerPower || 0) / 1000;
      const energyCost  = hours * powerKW * (state.finance.energyPrice || 0);
      const total       = filCost + wasteCost + energyCost;
      const hhmm        = hoursToHHMM(hours);

      const f = state.filaments.find(x => x.id === filId);

      $('#qcResFilament').textContent = brl(filCost);
      $('#qcResWaste').textContent    = `${brl(wasteCost)} (${wastePct}%)`;
      $('#qcResEnergy').textContent   = `${brl(energyCost)} (${hhmm || hours.toFixed(2) + 'h'} × ${state.finance.printerPower || 0}W)`;
      $('#qcResTotal').textContent    = brl(total);
      $('#qcResTags').innerHTML = `
        <span class="tag tag--time">⚖ ${weightG}g</span>
        <span class="tag tag--time">⏱ ${hhmm ? hhmm + 'h' : timeStr}</span>
        ${f ? `<span class="tag tag--time">🧵 ${escapeHtml(f.name)}</span>` : ''}
        <span class="tag tag--time">${brl(pricePerKg)}/kg</span>
      `;
      $('#qcResult').style.display = '';
    };
  }, 50);
}

$('#quickCalcBtn').onclick = () => openQuickCalc();

/* ---------------------------------------------------------
   15. FINANCE
--------------------------------------------------------- */
// Finance date filter state
let finFilter = { from: '', to: '' };

function applyFinFilter(entries) {
  return entries.filter(e => {
    if (finFilter.from && e.date < finFilter.from) return false;
    if (finFilter.to && e.date > finFilter.to) return false;
    return true;
  });
}

function renderFinance() {
  const allEntries = state.finance.entries;
  const filtered = applyFinFilter(allEntries);

  const revenue = filtered.filter(e => e.type==='receita').reduce((s,e) => s+Number(e.value||0), 0);
  const expense = filtered.filter(e => e.type==='despesa').reduce((s,e) => s+Number(e.value||0), 0);
  const profit = revenue - expense;
  const investment = filtered.filter(e => /invest/i.test(e.desc)).reduce((s,e) => s+Number(e.value||0), 0);

  $('#finRevenue').textContent = brl(revenue);
  $('#finExpense').textContent = brl(expense);
  $('#finProfit').textContent = brl(profit);
  $('#finInvestment').textContent = brl(investment);
  $('#finCostGram').textContent = brl((state.finance.filamentPrice || 0) / 1000);

  const margins = state.products.filter(p => p.price).map(p => (p.price - p.cost) / p.price);
  const avgMargin = margins.length ? Math.round((margins.reduce((a,b)=>a+b,0) / margins.length) * 100) : 0;
  $('#finMargin').textContent = avgMargin + '%';

  // filter status label
  const statusEl = $('#finFilterStatus');
  if (statusEl) {
    if (finFilter.from || finFilter.to) {
      const from = finFilter.from ? fmtDate(finFilter.from) : '—';
      const to = finFilter.to ? fmtDate(finFilter.to) : '—';
      statusEl.textContent = `Período: ${from} até ${to} · ${filtered.length} lançamentos`;
    } else {
      statusEl.textContent = `${allEntries.length} lançamentos totais`;
    }
  }

  // top products
  const ranked = [...state.products].map(p => ({ name: p.name, profit: (p.price - p.cost) * (p.sold||0) }))
    .sort((a,b) => b.profit - a.profit).slice(0, 5);
  $('#topProducts').innerHTML = ranked.length ? ranked.map(r => `<li><span>${escapeHtml(r.name)}</span><strong>${brl(r.profit)}</strong></li>`).join('') :
    '<li style="color:var(--text-faint);">Cadastre produtos para ver o ranking.</li>';

  // monthly chart
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    months.push(d.toISOString().slice(0,7));
  }
  const netByMonth = months.map(m => {
    const rev = allEntries.filter(e => e.type==='receita' && e.date.startsWith(m)).reduce((s,e)=>s+Number(e.value||0),0);
    const exp = allEntries.filter(e => e.type==='despesa' && e.date.startsWith(m)).reduce((s,e)=>s+Number(e.value||0),0);
    return rev - exp;
  });
  drawBarChart($('#finChart'), netByMonth, months.map(m => m.slice(5)));

  // ---- Tabela de despesas ----
  const expBody = $('#expenseTableBody');
  const expenses = filtered.filter(e => e.type==='despesa').sort((a,b) => b.date.localeCompare(a.date));
  expBody.innerHTML = expenses.length ? expenses.map(e => `
    <tr data-id="${e.id}">
      <td>${fmtDate(e.date)}</td>
      <td>${escapeHtml(e.desc)}</td>
      <td class="amount-neg">-${brl(e.value)}</td>
      <td><button class="row-del" title="Remover">✕</button></td>
    </tr>`).join('') : `<tr><td colspan="4" style="color:var(--text-faint);">Nenhuma despesa no período.</td></tr>`;
  $$('.row-del', expBody).forEach(btn => btn.onclick = e => {
    const id = e.target.closest('tr').dataset.id;
    state.finance.entries = state.finance.entries.filter(x => x.id !== id);
    saveState(); renderFinance(); renderDashboard();
  });

  // ---- Tabela de vendas ----
  const salesBody = $('#salesTableBody');
  const sales = filtered.filter(e => e.type==='receita').sort((a,b) => b.date.localeCompare(a.date));
  salesBody.innerHTML = sales.length ? sales.map(e => {
    const qty = e.qty || 1;
    const unit = e.unitValue || e.value;
    return `
    <tr data-id="${e.id}">
      <td>${fmtDate(e.date)}</td>
      <td>${escapeHtml(e.productName || e.desc)}</td>
      <td style="font-family:var(--font-mono);">${qty}</td>
      <td class="amount-pos">${brl(unit)}</td>
      <td class="amount-pos"><strong>${brl(e.value)}</strong></td>
      <td><button class="row-del" title="Remover">✕</button></td>
    </tr>`;
  }).join('') : `<tr><td colspan="6" style="color:var(--text-faint);">Nenhuma venda no período.</td></tr>`;
  $$('.row-del', salesBody).forEach(btn => btn.onclick = e => {
    const id = e.target.closest('tr').dataset.id;
    state.finance.entries = state.finance.entries.filter(x => x.id !== id);
    saveState(); renderFinance(); renderDashboard();
  });
}

// wire date filter buttons
document.addEventListener('DOMContentLoaded', () => {
  if ($('#finFilterBtn')) {
    $('#finFilterBtn').onclick = () => {
      finFilter.from = $('#finDateFrom').value;
      finFilter.to = $('#finDateTo').value;
      renderFinance();
    };
    $('#finClearBtn').onclick = () => {
      finFilter = { from: '', to: '' };
      $('#finDateFrom').value = '';
      $('#finDateTo').value = '';
      renderFinance();
    };
  }
});

function drawBarChart(svg, values, labels) {
  const w = 560, h = 200, pad = 26;
  const max = Math.max(1, ...values.map(v => Math.abs(v)));
  const barW = (w - pad*2) / values.length * 0.55;
  const gap = (w - pad*2) / values.length;
  const zeroY = h/2;
  let bars = '';
  values.forEach((v, i) => {
    const x = pad + i * gap + gap/2 - barW/2;
    const barH = (Math.abs(v) / max) * (h/2 - pad/2);
    const y = v >= 0 ? zeroY - barH : zeroY;
    bars += `<rect x="${x}" y="${y}" width="${barW}" height="${Math.max(barH,1)}" rx="4" fill="${v>=0?'var(--success)':'var(--danger)'}" opacity="0.85"/>`;
    bars += `<text x="${x+barW/2}" y="${h-6}" text-anchor="middle" font-size="9" fill="var(--text-faint)" font-family="var(--font-mono)">${labels[i]}</text>`;
  });
  svg.innerHTML = `<line x1="${pad}" y1="${zeroY}" x2="${w-pad}" y2="${zeroY}" stroke="var(--border)"/>${bars}`;
}

$('#addExpenseBtn').onclick = () => openExpenseModal();
$('#addSaleBtn').onclick = () => openSaleModal();

function openExpenseModal() {
  openModal('Nova despesa', `
    <div class="field"><label>Data</label><input type="date" id="fDate" value="${todayISO()}"></div>
    <div class="field"><label>Descrição</label><input type="text" id="fDesc" placeholder="Ex: Bobina PLA Preto, energia elétrica…"></div>
    <div class="field"><label>Valor (R$)</label><input type="number" step="0.01" id="fValue" min="0"></div>
  `, [
    { label: 'Cancelar', cls: 'btn-ghost', onClick: closeModal },
    { label: 'Adicionar', cls: 'btn-primary', onClick: () => {
      const value = Number($('#fValue').value) || 0;
      const desc = $('#fDesc').value.trim() || 'Despesa';
      state.finance.entries.push({ id: uid(), date: $('#fDate').value || todayISO(), type: 'despesa', desc, value });
      saveState(); closeModal(); renderFinance(); renderDashboard();
      toast('Despesa registrada.');
    }}
  ]);
}

function openSaleModal() {
  const productOptions = state.products.length
    ? state.products.map(p => `<option value="${p.id}" data-price="${p.price}">${escapeHtml(p.name)} — ${brl(p.price)}</option>`).join('')
    : '<option value="">Nenhum produto cadastrado</option>';

  openModal('Nova venda', `
    <div class="field"><label>Data</label><input type="date" id="sDate" value="${todayISO()}"></div>
    <div class="field">
      <label>Produto</label>
      <select id="sProduct">
        <option value="">Selecione…</option>
        ${productOptions}
      </select>
    </div>
    <div class="field-row">
      <div class="field"><label>Quantidade</label><input type="number" id="sQty" value="1" min="1"></div>
      <div class="field"><label>Valor unitário (R$)</label><input type="number" step="0.01" id="sUnitValue" min="0"></div>
    </div>
    <div class="field">
      <label>Total</label>
      <input type="text" id="sTotal" readonly style="background:var(--surface-3);color:var(--accent);font-family:var(--font-mono);font-weight:700;">
    </div>
  `, [
    { label: 'Cancelar', cls: 'btn-ghost', onClick: closeModal },
    { label: 'Registrar venda', cls: 'btn-primary', onClick: () => {
      const productId = $('#sProduct').value;
      const product = state.products.find(p => p.id === productId);
      const qty = Math.max(1, Number($('#sQty').value) || 1);
      const unitValue = Number($('#sUnitValue').value) || 0;
      const total = qty * unitValue;
      const date = $('#sDate').value || todayISO();

      if (!productId) { toast('Selecione um produto.'); return; }
      if (!unitValue) { toast('Informe o valor unitário.'); return; }

      state.finance.entries.push({
        id: uid(), date, type: 'receita',
        desc: `Venda: ${product ? product.name : 'produto'} (${qty}x)`,
        productName: product ? product.name : '',
        productId, qty, unitValue, value: total,
      });

      // update sold count on the product
      if (product) {
        product.sold = (product.sold || 0) + qty;
        if (cloudMode) upsertCloudProduct(product);
      }

      saveState(); closeModal(); renderFinance(); renderDashboard();
      toast('Venda registrada.');
    }}
  ]);

  // auto-fill unit price when product selected
  setTimeout(() => {
    const sel = $('#sProduct');
    const qtyInput = $('#sQty');
    const unitInput = $('#sUnitValue');
    const totalInput = $('#sTotal');

    const updateTotal = () => {
      const qty = Number(qtyInput.value) || 1;
      const unit = Number(unitInput.value) || 0;
      totalInput.value = brl(qty * unit);
    };

    sel.onchange = () => {
      const opt = sel.options[sel.selectedIndex];
      const price = opt ? Number(opt.dataset.price) || 0 : 0;
      unitInput.value = price.toFixed(2);
      updateTotal();
    };
    qtyInput.oninput = updateTotal;
    unitInput.oninput = updateTotal;
  }, 50);
}

/* ---------------------------------------------------------
   16. ACHIEVEMENTS VIEW
--------------------------------------------------------- */
/* ---------------------------------------------------------
   CRIAÇÕES PESSOAIS
--------------------------------------------------------- */
function renderPersonal() {
  const items = state.personalCreations || [];

  // Stats
  let totalSaved = 0, totalSpent = 0;
  items.forEach(item => {
    const qty = item.qty || 1;
    totalSpent += (item.printCost || 0) * qty;
    totalSaved += ((item.marketPrice || 0) - (item.printCost || 0)) * qty;
  });
  const roi = totalSpent > 0 ? Math.round((totalSaved / totalSpent) * 100) : 0;

  $('#persSaved').textContent  = brl(totalSaved);
  $('#persSpent').textContent  = brl(totalSpent);
  $('#persCount').textContent  = items.reduce((s, i) => s + (i.qty || 1), 0);
  $('#persRoi').textContent    = roi + '%';

  // Savings chart (horizontal bars)
  const top = [...items]
    .map(i => ({ name: i.name, saved: ((i.marketPrice||0) - (i.printCost||0)) * (i.qty||1), cost: (i.printCost||0) * (i.qty||1), market: (i.marketPrice||0) * (i.qty||1) }))
    .sort((a,b) => b.saved - a.saved).slice(0, 6);

  const chartEl = $('#persSavingsChart');
  if (!top.length) {
    chartEl.innerHTML = '<p style="color:var(--text-faint);font-size:12.5px;padding:12px 0;">Nenhum item cadastrado ainda.</p>';
  } else {
    const maxVal = Math.max(...top.map(r => r.market), 1);
    chartEl.innerHTML = top.map(r => {
      const marketPct = Math.round((r.market / maxVal) * 100);
      const costPct   = Math.round((r.cost   / maxVal) * 100);
      return `
        <div class="pers-bar-row">
          <span class="pers-bar-name">${escapeHtml(r.name)}</span>
          <div class="pers-bar-track">
            <div class="pers-bar pers-bar--market" style="width:${marketPct}%" title="Mercado: ${brl(r.market)}"></div>
            <div class="pers-bar pers-bar--cost"   style="width:${costPct}%"   title="Impressão: ${brl(r.cost)}"></div>
          </div>
          <span class="pers-bar-saving ${r.saved >= 0 ? 'is-positive' : 'is-negative'}">${r.saved >= 0 ? '−' : '+'}${brl(Math.abs(r.saved))}</span>
        </div>`;
    }).join('');
  }

  // Category summary
  const byCat = {};
  items.forEach(i => {
    const cat = i.category || 'Sem categoria';
    if (!byCat[cat]) byCat[cat] = { saved: 0, count: 0 };
    byCat[cat].saved += ((i.marketPrice||0) - (i.printCost||0)) * (i.qty||1);
    byCat[cat].count += (i.qty||1);
  });
  const catEl = $('#persCategoryList');
  const cats = Object.entries(byCat).sort((a,b) => b[1].saved - a[1].saved);
  catEl.innerHTML = cats.length ? cats.map(([cat, v]) => `
    <li>
      <span>${escapeHtml(cat)} <small style="color:var(--text-faint);">(${v.count} unid.)</small></span>
      <strong class="${v.saved >= 0 ? 'amount-pos' : 'amount-neg'}">${brl(v.saved)}</strong>
    </li>`).join('') : '<li style="color:var(--text-faint);">—</li>';

  // Table
  const tbody = $('#personalTableBody');
  tbody.innerHTML = items.length ? items.map(item => {
    const qty      = item.qty || 1;
    const unitSave = (item.marketPrice||0) - (item.printCost||0);
    const totSave  = unitSave * qty;
    const cls      = totSave >= 0 ? 'amount-pos' : 'amount-neg';
    const hhmm     = item.printTime ? hoursToHHMM(parseTimeToHours(item.printTime)) : null;
    return `
      <tr data-id="${item.id}">
        <td>
          <strong>${escapeHtml(item.name)}</strong>
          ${hhmm ? `<span class="tag tag--time" style="margin-left:6px;">⏱ ${hhmm}h</span>` : ''}
        </td>
        <td>${escapeHtml(item.category || '—')}</td>
        <td style="font-family:var(--font-mono);">${qty}</td>
        <td>${brl(item.marketPrice)}</td>
        <td>${brl(item.printCost)}</td>
        <td class="${cls}">${brl(unitSave)}</td>
        <td class="${cls}"><strong>${brl(totSave)}</strong></td>
        <td><button class="btn-ghost btn-sm pers-edit">Editar</button></td>
      </tr>`;
  }).join('') : `<tr><td colspan="8" style="color:var(--text-faint);">Nenhum item cadastrado ainda.</td></tr>`;

  $$('.pers-edit', tbody).forEach(btn => {
    btn.onclick = e => openPersonalModal(e.target.closest('tr').dataset.id);
  });

  if ($('#addPersonalBtn')) {
    $('#addPersonalBtn').onclick = () => openPersonalModal(null);
  }
}

function openPersonalModal(id) {
  const item = id ? state.personalCreations.find(x => x.id === id) : {
    id: uid(), name: '', category: '', qty: 1,
    marketPrice: 0, printCost: 0, printTime: '',
    filaments: [], wastePct: 0, notes: '',
  };
  const isNew = !id;
  if (!Array.isArray(item.filaments)) item.filaments = [];

  const catOptions = `<option value="">Sem categoria</option>` +
    state.productCategories.map(c =>
      `<option value="${escapeHtml(c.name)}" ${item.category===c.name?'selected':''}>${escapeHtml(c.name)}</option>`
    ).join('');

  openModal(isNew ? 'Novo item' : 'Editar item', `
    <div class="field"><label>Nome do item <span class="required-star">*</span></label>
      <input type="text" id="piName" value="${escapeHtml(item.name)}" placeholder="Ex: Suporte de headset">
    </div>
    <div class="field-row">
      <div class="field"><label>Categoria</label><select id="piCategory">${catOptions}</select></div>
      <div class="field"><label>Quantidade impressa</label>
        <input type="number" id="piQty" min="1" step="1" value="${item.qty || 1}">
      </div>
    </div>

    <div class="field">
      <label>💰 Preço de mercado (R$) — quanto custaria comprar</label>
      <input type="number" step="0.01" id="piMarket" value="${item.marketPrice || ''}">
    </div>

    <div class="field">
      <label>Custo de impressão (R$) <span style="font-size:10px;color:var(--text-faint);">calculado</span></label>
      <input type="number" step="0.01" id="piCost" value="${item.printCost || ''}" readonly tabindex="-1"
        style="background:var(--surface-3);color:var(--text-muted);cursor:not-allowed;">
    </div>

    <div class="field">
      <label>Tempo de impressão</label>
      <div class="printtime-input-wrap">
        <input type="text" id="piPrintTime" value="${escapeHtml(item.printTime)}" placeholder="Ex: 2,7hrs ou 1h30">
        <span class="printtime-tag" id="piPrintTimeTag"></span>
      </div>
    </div>

    <div class="field">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <label>Filamentos (AMS)</label>
        <button type="button" class="btn-ghost btn-sm" id="piAddFilamentRow">+ Adicionar filamento</button>
      </div>
      <div id="piFilamentRows"></div>
      <div class="ams-total-row">
        <span class="ams-total-label">Peso total calculado:</span>
        <span class="ams-total-value" id="piTotalWeight">0 g</span>
      </div>
    </div>

    <div class="field">
      <label>Desperdício de filamento (%)</label>
      <div class="waste-row">
        <input type="number" id="piWastePct" min="0" max="100" step="0.5" value="${item.wastePct || 0}">
        <span class="waste-hint" id="piWasteHint">+ R$ 0,00</span>
      </div>
    </div>

    <div class="cost-calc-box">
      <button type="button" class="btn-ghost btn-sm" id="piCalcCostBtn">🧮 Calcular custo de impressão</button>
      <p class="cost-calc-breakdown" id="piCostBreakdown"></p>
    </div>

    <div class="field"><label>Observações</label><textarea id="piNotes">${escapeHtml(item.notes||'')}</textarea></div>
  `, [
    ...(isNew ? [] : [{ label: 'Excluir', cls: 'btn-danger', onClick: () => {
      state.personalCreations = state.personalCreations.filter(x => x.id !== id);
      saveState(); closeModal(); renderPersonal();
      toast('Item removido.');
    }}]),
    { label: 'Cancelar', cls: 'btn-ghost', onClick: closeModal },
    { label: 'Salvar', cls: 'btn-primary', onClick: () => {
      const name = $('#piName').value.trim();
      if (!name) { highlight('#piName', 'Nome é obrigatório.'); return; }

      item.name        = name;
      item.category    = $('#piCategory').value;
      item.qty         = Math.max(1, Number($('#piQty').value) || 1);
      item.marketPrice = Number($('#piMarket').value) || 0;
      item.printCost   = Number($('#piCost').value) || 0;
      item.printTime   = $('#piPrintTime').value.trim();
      item.wastePct    = Number($('#piWastePct').value) || 0;
      item.notes       = $('#piNotes').value.trim();
      item.filaments   = piCollectFilamentRows();
      item.weight      = item.filaments.reduce((s, r) => s + (r.grams || 0), 0);

      if (isNew) state.personalCreations.push(item);
      else { const idx = state.personalCreations.findIndex(x => x.id === id); if (idx >= 0) state.personalCreations[idx] = item; }

      saveState(); closeModal(); renderPersonal();
      toast(isNew ? 'Item criado.' : 'Item atualizado.');
    }}
  ]);

  // Setup after modal renders
  setTimeout(() => {
    // printTime tag
    const ptInput = $('#piPrintTime');
    const ptTag   = $('#piPrintTimeTag');
    if (ptInput && ptTag) {
      const upd = () => { const fmt = hoursToHHMM(parseTimeToHours(ptInput.value)); ptTag.textContent = fmt ? fmt+'h' : ''; ptTag.style.display = fmt ? '' : 'none'; };
      ptInput.addEventListener('input', upd); upd();
    }

    // filament rows (reuse catalog UI but scoped with pi- prefix)
    if (item.filaments.length) {
      item.filaments.forEach(r => piAddFilamentRow(r.filamentId, r.grams||0, r.lockedPrice??null));
      piUpdateTotal();
    }
    $('#piAddFilamentRow').onclick = () => piAddFilamentRow('', 0);

    // waste hint
    $('#piWastePct').oninput = () => piUpdateWasteHint();
    piUpdateWasteHint();

    // calc button
    $('#piCalcCostBtn').onclick = () => piCalcCost();
  }, 50);
}

/* ---- personal creations filament helpers (pi- prefix to avoid collision) ---- */
function piAddFilamentRow(filamentId = '', grams = 0, lockedPrice = null) {
  const container = $('#piFilamentRows');
  if (!container) return;
  const f     = state.filaments.find(x => x.id === filamentId);
  const price = lockedPrice !== null ? lockedPrice : (f ? f.pricePerKg : '');
  const row   = document.createElement('div');
  row.className = 'ams-row';
  row.dataset.lockedPrice = price;
  row.innerHTML = `
    <select class="ams-select">${filamentSelectHtml(filamentId)}</select>
    <div class="ams-pct-input-wrap">
      <input type="number" class="ams-grams-input" min="0" step="0.1" value="${grams > 0 ? grams : ''}" placeholder="0">
      <span class="ams-pct-sign">g</span>
    </div>
    <button type="button" class="ams-remove">✕</button>`;
  row.querySelector('.ams-select').onchange = e => {
    const sel = state.filaments.find(x => x.id === e.target.value);
    row.dataset.lockedPrice = sel ? sel.pricePerKg : '';
    piUpdateTotal();
  };
  row.querySelector('.ams-remove').onclick = () => { row.remove(); piUpdateTotal(); };
  row.querySelector('.ams-grams-input').oninput = piUpdateTotal;
  container.appendChild(row);
}

function piCollectFilamentRows() {
  return $$('#piFilamentRows .ams-row').map(row => ({
    filamentId: row.querySelector('.ams-select').value,
    grams: Number(row.querySelector('.ams-grams-input').value) || 0,
    lockedPrice: Number(row.dataset.lockedPrice) || null,
  })).filter(r => r.filamentId);
}

function piUpdateTotal() {
  const rows  = piCollectFilamentRows();
  const total = rows.reduce((s, r) => s + r.grams, 0);
  const el = $('#piTotalWeight');
  if (el) el.textContent = total.toFixed(1) + ' g';
  piUpdateWasteHint(rows);
}

function piUpdateWasteHint(rows) {
  const wastePct = Number($('#piWastePct').value) || 0;
  const hint = $('#piWasteHint');
  if (!hint) return;
  if (!rows) rows = piCollectFilamentRows();
  let rawCost = 0;
  rows.forEach(r => {
    const p = (r.lockedPrice && r.lockedPrice > 0) ? r.lockedPrice : (state.filaments.find(x => x.id === r.filamentId)?.pricePerKg || 0);
    rawCost += r.grams * (p / 1000);
  });
  hint.textContent = wastePct > 0 ? `+ ${brl(rawCost * wastePct / 100)} de desperdício` : '+ R$ 0,00';
}

function piCalcCost() {
  const rows       = piCollectFilamentRows();
  const printTimeStr = $('#piPrintTime').value.trim();
  const wastePct   = Number($('#piWastePct').value) || 0;
  const extra      = 0; // personal items don't have "extras" — just materials + energy
  const hours      = parseTimeToHours(printTimeStr);

  if (!rows.length) {
    $('#piCostBreakdown').innerHTML = '<span class="cost-calc-warn">Adicione ao menos um filamento com peso (g) para calcular.</span>';
    return;
  }
  if (!hours) {
    $('#piCostBreakdown').innerHTML = '<span class="cost-calc-warn">Preencha o tempo de impressão para calcular.</span>';
    highlight('#piPrintTime', 'Tempo de impressão é obrigatório para o cálculo.');
    return;
  }

  let filamentCost = 0, filLines = '';
  rows.forEach(r => {
    const f = state.filaments.find(x => x.id === r.filamentId);
    const pricePerKg = (r.lockedPrice && r.lockedPrice > 0) ? r.lockedPrice : (f ? f.pricePerKg : 0);
    const cost = r.grams * (pricePerKg / 1000);
    filamentCost += cost;
    filLines += `&nbsp;&nbsp;↳ ${escapeHtml(f ? f.name : '?')}: ${r.grams.toFixed(1)}g × ${brl(pricePerKg)}/kg = <strong>${brl(cost)}</strong><br>`;
  });
  const powerKW    = (state.finance.printerPower || 0) / 1000;
  const energyCost = hours * powerKW * (state.finance.energyPrice || 0);
  const total      = filamentCost + wasteCost + energyCost;

  $('#piCost').value = total.toFixed(2);

  const marketPrice = Number($('#piMarket').value) || 0;
  const saving = marketPrice - total;

  $('#piCostBreakdown').innerHTML = `
    Filamento: <strong>${brl(filamentCost)}</strong><br>
    ${filLines}
    Desperdício (${wastePct}%): <strong>${brl(wasteCost)}</strong><br>
    Energia: <strong>${brl(energyCost)}</strong> (${hours.toFixed(2)}h × ${state.finance.printerPower||0}W × ${brl(state.finance.energyPrice||0)}/kWh)<br>
    Custo total: <strong>${brl(total)}</strong><br>
    ${marketPrice > 0 ? `<span style="color:${saving>=0?'var(--success)':'var(--danger)'};font-weight:700;">
      ${saving >= 0 ? '✓ Economia' : '⚠ Custo extra'} por unidade: ${brl(Math.abs(saving))}
    </span>` : ''}
  `;
}

function renderAchievements() {
  checkAchievements();
  const grid = $('#achievementsGrid');
  grid.innerHTML = state.achievements.map(a => `
    <div class="ach-card ${a.unlocked ? 'is-unlocked' : ''}">
      <div class="ach-icon">${a.icon}</div>
      <h4>${escapeHtml(a.title)}</h4>
      <p>${escapeHtml(a.desc)}</p>
      ${a.unlocked ? `<div class="ach-date">desbloqueada em ${fmtDate(a.unlockedDate)}</div>` : ''}
    </div>`).join('');
}

/* ---------------------------------------------------------
   17. SETTINGS
--------------------------------------------------------- */
/* ---------------------------------------------------------
   COLLAPSIBLE PANELS (Painel Admin)
--------------------------------------------------------- */
// Store which panels are open: persisted to localStorage per session
const CP_KEY = 'extrusa_cp_state';
let cpState = {}; // { [panelId]: true/false }

function loadCpState() {
  try { cpState = JSON.parse(localStorage.getItem(CP_KEY) || '{}'); } catch { cpState = {}; }
}
function saveCpState() { localStorage.setItem(CP_KEY, JSON.stringify(cpState)); }

function initCollapsiblePanels() {
  loadCpState();
  $$('.cp-head').forEach(btn => {
    const panelId = btn.dataset.target;
    const panel = $(`#${panelId}`);
    if (!panel) return;

    // default: all collapsed (cpState[panelId] is undefined → falsy)
    if (cpState[panelId]) panel.classList.add('is-open');

    btn.addEventListener('click', () => {
      const isOpen = panel.classList.toggle('is-open');
      cpState[panelId] = isOpen;
      saveCpState();
      // lazy-load content when first opened
      onPanelOpen(panelId);
    });
  });
}

// Called whenever a panel is expanded — runs the relevant render if needed
async function onPanelOpen(panelId) {
  if (panelId === 'cp-categories') renderCategoryList();
  if (panelId === 'cp-filaments') { renderFilamentList(); bindFilamentBtn(); }
  if (panelId === 'cp-costs') bindCostInputs();
  if (panelId === 'cp-materials') await loadAdminMaterials();
  if (panelId === 'cp-users') { await renderUsersTable(); bindRefreshUsers(); }
}

function bindFilamentBtn() {
  const btn = $('#addFilamentBtn');
  if (btn && !btn.dataset.bound) { btn.dataset.bound='1'; btn.onclick = () => openFilamentModal(null); }
}

function bindRefreshUsers() {
  const btn = $('#refreshUsersBtn');
  if (btn && !btn.dataset.bound) { btn.dataset.bound='1'; btn.onclick = renderUsersTable; }
}

function bindCostInputs() {
  const inputs = [
    ['filamentPriceInput', 'filamentPrice'],
    ['energyPriceInput',   'energyPrice'],
    ['printerPowerInput',  'printerPower'],
    ['financialGoalInput', 'goal'],
  ];
  inputs.forEach(([id, key]) => {
    const el = $(`#${id}`);
    if (!el) return;
    if (!el.dataset.bound) {
      el.dataset.bound = '1';
      el.addEventListener('change', e => { state.finance[key] = Number(e.target.value)||0; saveState(); });
    }
    el.value = state.finance[key] || 0;
  });
}

async function loadAdminMaterials() {
  const linksEl = $('#adminLinksContent');
  if (!linksEl) return;
  linksEl.innerHTML = '<p style="color:var(--text-faint);font-size:12.5px;">Carregando…</p>';
  await fetchStudyMaterials();

  let html = '';
  state.study.weeks.forEach(w => {
    w.activities.forEach(a => {
      const items = studyMaterials[a.id] || [];
      const videoCount = items.filter(i => i.type === 'video').length;
      const pdfCount   = items.filter(i => i.type === 'pdf').length;
      const chips = [
        videoCount ? `<span class="tag tag--diff-facil">▶ ${videoCount} vídeo${videoCount>1?'s':''}</span>` : '',
        pdfCount   ? `<span class="tag tag--diff-facil">📄 ${pdfCount} PDF${pdfCount>1?'s':''}</span>`   : '',
        (!items.length) ? `<span class="tag tag--time" style="opacity:.5;">Sem material</span>` : '',
      ].join('');
      html += `
        <div class="link-editor-row">
          <span class="week-tag">Sem ${w.weekNum}</span>
          <span class="act-name">${escapeHtml(a.title)}</span>
          <div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center;">${chips}</div>
          <button class="btn-primary btn-sm" data-act="${a.id}" data-title="${escapeHtml(a.title)}">Editar material</button>
        </div>`;
    });
  });
  linksEl.innerHTML = html || '<p style="color:var(--text-faint);">Nenhuma atividade encontrada.</p>';
  $$('[data-act]', linksEl).forEach(btn => {
    btn.onclick = () => openMaterialEditor(btn.dataset.act, btn.dataset.title, studyMaterials[btn.dataset.act] || []);
  });
}
/* ---------------------------------------------------------
   ADMIN VIEW
--------------------------------------------------------- */
async function renderAdmin() {
  if (!isAdmin) return;
  initCollapsiblePanels();

  // wire category button (always available after init)
  const addCatBtn = $('#addCategoryBtn');
  if (addCatBtn && !addCatBtn.dataset.bound) {
    addCatBtn.dataset.bound = '1';
    addCatBtn.onclick = () => openCategoryModal(null);
  }

  // re-render open panels in case data changed since last visit
  $$('.collapsible-panel.is-open').forEach(panel => onPanelOpen(panel.id));
}

function renderCategoryList() {
  const el = $('#categoryList');
  if (!el) return;
  if (!state.productCategories.length) { el.innerHTML = '<p style="color:var(--text-faint);font-size:12.5px;">Nenhuma categoria cadastrada.</p>'; return; }
  el.innerHTML = state.productCategories.map(c => {
    const inUse = state.products.some(p => p.category === c.name);
    return `
    <li class="filament-row" data-id="${c.id}">
      <span class="fname">${escapeHtml(c.name)}</span>
      ${inUse ? `<span class="cat-in-use-badge" title="Em uso por produtos">em uso</span>` : ''}
      <button class="cat-edit" title="Editar">✎</button>
      <button class="cat-del" title="${inUse ? 'Categoria em uso — não pode ser excluída' : 'Remover'}" ${inUse ? 'disabled' : ''}>✕</button>
    </li>`;
  }).join('');
  $$('.cat-edit', el).forEach(btn => btn.onclick = e => openCategoryModal(e.target.closest('.filament-row').dataset.id));
  $$('.cat-del:not([disabled])', el).forEach(btn => btn.onclick = e => {
    const id = e.target.closest('.filament-row').dataset.id;
    state.productCategories = state.productCategories.filter(x => x.id !== id);
    saveState(); renderCategoryList();
  });
}

function openCategoryModal(id) {
  const c = id ? state.productCategories.find(x => x.id === id) : { id: uid(), name: '' };
  const isNew = !id;
  const inUse = !isNew && state.products.some(p => p.category === c.name);
  openModal(isNew ? 'Nova categoria' : 'Editar categoria', `
    <div class="field"><label>Nome da categoria</label><input type="text" id="catName" value="${escapeHtml(c.name)}" placeholder="Ex: Organização, Decoração…"></div>
    ${inUse ? `<p style="font-size:12px;color:var(--warn);margin-top:4px;">⚠ Esta categoria está vinculada a ${state.products.filter(p=>p.category===c.name).length} produto(s). Você pode renomear, mas não excluir.</p>` : ''}
  `, [
    ...(!isNew && !inUse ? [{ label: 'Excluir', cls: 'btn-danger', onClick: () => {
      state.productCategories = state.productCategories.filter(x => x.id !== id);
      saveState(); closeModal(); renderCategoryList();
    }}] : []),
    { label: 'Cancelar', cls: 'btn-ghost', onClick: closeModal },
    { label: 'Salvar', cls: 'btn-primary', onClick: () => {
      const newName = $('#catName').value.trim() || 'Sem nome';
      // if renamed, update all products that used the old name
      if (!isNew && newName !== c.name) {
        state.products.forEach(p => { if (p.category === c.name) p.category = newName; });
        if (cloudMode) state.products.forEach(p => { if (p.category === newName) upsertCloudProduct(p); });
      }
      c.name = newName;
      if (isNew) state.productCategories.push(c);
      saveState(); closeModal(); renderCategoryList();
      toast(isNew ? 'Categoria criada.' : 'Categoria atualizada.');
    }}
  ]);
}

async function renderUsersTable() {
  if (!supabase || !isAdmin) return;
  const body = $('#usersTableBody');
  body.innerHTML = '<tr><td colspan="4" style="color:var(--text-faint);">Carregando…</td></tr>';
  const { data: users, error } = await supabase.from('profiles').select('user_id, email, name, role');
  if (error || !users) { body.innerHTML = '<tr><td colspan="4" style="color:var(--danger);">Erro ao carregar usuários.</td></tr>'; return; }
  body.innerHTML = users.map(u => `
    <tr data-uid="${u.user_id}">
      <td>${escapeHtml(u.email || '—')}</td>
      <td>${escapeHtml(u.name || '—')}</td>
      <td>
        <select class="role-select" data-uid="${u.user_id}" style="background:var(--surface-2);border:1px solid var(--border);border-radius:6px;padding:4px 8px;color:var(--text);font-size:12px;">
          <option value="user" ${u.role==='user'?'selected':''}>Usuário</option>
          <option value="admin" ${u.role==='admin'?'selected':''}>Admin</option>
        </select>
      </td>
      <td><button class="btn-ghost btn-sm save-role-btn" data-uid="${u.user_id}">Salvar</button></td>
    </tr>`).join('');

  $$('.save-role-btn', body).forEach(btn => {
    btn.onclick = async () => {
      const uid = btn.dataset.uid;
      const sel = body.querySelector(`.role-select[data-uid="${uid}"]`);
      const newRole = sel.value;
      btn.textContent = '…';
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('user_id', uid);
      btn.textContent = error ? 'Erro' : 'Salvo ✓';
      setTimeout(() => { btn.textContent = 'Salvar'; }, 1800);
      if (!error) toast(`Papel de ${newRole} salvo.`);
    };
  });
}

function renderSettings() {
  $('#settingName').value = state.profile.name;
  $('#settingPhoto').value = state.profile.photo;
  $('#settingGoal').value = state.profile.goal;
  $('#settingHours').value = state.profile.weeklyHours;
  applyTheme();
  refreshAvatar();

  const statusEl = $('#accountStatus');
  if (cloudMode && currentUser) {
    statusEl.textContent = `Conectado como ${currentUser.email} · dados na nuvem`;
    $('#logoutBtn').style.display = '';
  } else {
    statusEl.textContent = supabase ? 'Modo local — não conectado a uma conta.' : 'Sincronização em nuvem não configurada (ver config.js).';
    $('#logoutBtn').style.display = cloudMode ? '' : 'none';
  }
}

$('#forceSyncBtn').onclick = () => {
  if (!cloudMode) { toast('Você está no modo local — entre com uma conta para sincronizar.'); return; }
  pushCloudStateNow();
  toast('Sincronizando com a nuvem...');
};
$('#logoutBtn').onclick = () => {
  if (!supabase) return;
  openModal('Sair da conta?', `<p style="font-size:13.5px;color:var(--text-muted);">Seus dados continuam salvos na nuvem. Você poderá entrar novamente a qualquer momento.</p>`, [
    { label: 'Cancelar', cls: 'btn-ghost', onClick: closeModal },
    { label: 'Sair', cls: 'btn-danger', onClick: async () => {
      await supabase.auth.signOut();
      closeModal();
      location.reload();
    }}
  ]);
};

/* ---- Filament price helpers ---- */
// Always read the most recent history entry as the current price
function getCurrentPrice(f) {
  if (!f) return 0;
  if (f.priceHistory && f.priceHistory.length) {
    return [...f.priceHistory].sort((a, b) => b.date.localeCompare(a.date))[0].price;
  }
  return f.pricePerKg || 0;
}

// Sync pricePerKg from history so legacy code that reads .pricePerKg still works
function syncFilamentPrice(f) {
  f.pricePerKg = getCurrentPrice(f);
  return f;
}

function renderFilamentList() {
  const el = $('#filamentList');
  if (!el) return;
  if (!state.filaments.length) { el.innerHTML = '<p style="color:var(--text-faint);font-size:12.5px;">Nenhum filamento cadastrado.</p>'; return; }
  el.innerHTML = state.filaments.map(f => {
    syncFilamentPrice(f);
    const usedIn = state.products.filter(p =>
      Array.isArray(p.filaments) && p.filaments.some(r => r.filamentId === f.id)
    ).length;
    const hist = f.priceHistory || [];
    const prevPrice = hist.length >= 2
      ? [...hist].sort((a,b) => b.date.localeCompare(a.date))[1].price
      : null;
    const trend = prevPrice !== null
      ? f.pricePerKg > prevPrice ? '↑' : f.pricePerKg < prevPrice ? '↓' : '='
      : '';
    const trendColor = trend === '↑' ? 'var(--danger)' : trend === '↓' ? 'var(--success)' : 'var(--text-faint)';
    return `
    <li class="filament-row" data-id="${f.id}">
      <span class="fname">${escapeHtml(f.name)}</span>
      <span class="fprice">${brl(f.pricePerKg)}/kg ${trend ? `<span style="color:${trendColor};font-size:11px;">${trend}</span>` : ''}</span>
      <span class="fil-hist-count" title="${hist.length} entrada(s) no histórico">📋 ${hist.length}</span>
      ${usedIn ? `<span class="cat-in-use-badge">${usedIn} produto${usedIn>1?'s':''}</span>` : ''}
      <button class="fil-edit" title="Editar / histórico">✎</button>
      <button class="fil-del" title="Remover">✕</button>
    </li>`;
  }).join('');
  $$('.fil-edit', el).forEach(btn => btn.onclick = e => openFilamentModal(e.target.closest('.filament-row').dataset.id));
  $$('.fil-del', el).forEach(btn => btn.onclick = e => {
    const id = e.target.closest('.filament-row').dataset.id;
    const usedIn = state.products.filter(p =>
      Array.isArray(p.filaments) && p.filaments.some(r => r.filamentId === id)
    ).length;
    if (usedIn) { toast(`Não é possível remover — filamento usado em ${usedIn} produto(s).`); return; }
    openModal('Remover filamento?', `<p style="font-size:13.5px;color:var(--text-muted);">Todo o histórico de preços será perdido. Esta ação não pode ser desfeita.</p>`, [
      { label: 'Cancelar', cls: 'btn-ghost', onClick: closeModal },
      { label: 'Remover', cls: 'btn-danger', onClick: () => {
        state.filaments = state.filaments.filter(x => x.id !== id);
        saveState(); closeModal(); renderFilamentList();
      }}
    ]);
  });
}

function openFilamentModal(id) {
  const isNew = !id;
  const f = isNew
    ? { id: uid(), name: '', pricePerKg: state.finance.filamentPrice || 120, priceHistory: [] }
    : state.filaments.find(x => x.id === id);
  if (!f) return;
  syncFilamentPrice(f);
  if (!f.priceHistory || !f.priceHistory.length) {
    f.priceHistory = [{ price: f.pricePerKg, date: todayISO(), note: 'Preço inicial' }];
  }

  const usedIn = !isNew ? state.products.filter(p =>
    Array.isArray(p.filaments) && p.filaments.some(r => r.filamentId === f.id)
  ) : [];

  const histSorted = [...f.priceHistory].sort((a,b) => b.date.localeCompare(a.date));

  const histHtml = histSorted.length ? `
    <div class="field">
      <label>Histórico de preços</label>
      <div class="price-history-list">
        ${histSorted.map((h, i) => `
          <div class="price-history-row ${i === 0 ? 'is-current' : ''}">
            <span class="ph-date">${fmtDate(h.date)}</span>
            <span class="ph-price">${brl(h.price)}/kg</span>
            <span class="ph-note">${escapeHtml(h.note || '')}</span>
            ${i > 0 ? `<button class="ph-del btn-ghost btn-sm" data-date="${h.date}" title="Remover entrada">✕</button>` : '<span class="ph-current-badge">atual</span>'}
          </div>`).join('')}
      </div>
    </div>` : '';

  openModal(isNew ? 'Novo filamento' : escapeHtml(f.name), `
    <div class="field"><label>Nome (material, marca, cor)</label>
      <input type="text" id="filName" value="${escapeHtml(f.name)}" placeholder="Ex: PETG Preto Voolt3D">
    </div>
    <div class="field">
      <label>${isNew ? 'Preço inicial (R$/kg)' : 'Novo preço (R$/kg)'}</label>
      <input type="number" step="0.01" id="filNewPrice" value="${f.pricePerKg}" min="0">
    </div>
    ${!isNew ? `
    <div class="field">
      <label>Data da atualização</label>
      <input type="date" id="filPriceDate" value="${todayISO()}">
    </div>
    <div class="field">
      <label>Observação (opcional)</label>
      <input type="text" id="filPriceNote" placeholder="Ex: promoção, novo fornecedor…">
    </div>
    <div class="fil-price-hint" id="filPriceHint"></div>
    ` : ''}
    ${histHtml}
    ${usedIn.length ? `
    <div class="filament-impact-box">
      <strong>ℹ Preço histórico preservado</strong>
      <p>Salvo em <strong>${usedIn.length} produto(s)</strong>. O novo preço só afeta cálculos futuros.</p>
      <ul class="filament-impact-list">${usedIn.map(p => `<li>${escapeHtml(p.name)}</li>`).join('')}</ul>
    </div>` : ''}
  `, [
    { label: 'Cancelar', cls: 'btn-ghost', onClick: closeModal },
    { label: isNew ? 'Criar filamento' : 'Salvar', cls: 'btn-primary', onClick: () => {
      const name     = $('#filName').value.trim() || 'Sem nome';
      const newPrice = Number($('#filNewPrice').value) || 0;
      const note     = !isNew ? ($('#filPriceNote')?.value.trim() || '') : 'Preço inicial';
      const date     = !isNew ? ($('#filPriceDate')?.value || todayISO()) : todayISO();
      f.name = name;
      if (isNew) {
        f.priceHistory = [{ price: newPrice, date, note }];
        f.pricePerKg   = newPrice;
        state.filaments.push(f);
      } else if (newPrice !== f.pricePerKg) {
        f.priceHistory.push({ price: newPrice, date, note });
        f.pricePerKg = newPrice;
      }
      saveState(); closeModal(); renderFilamentList();
      toast(isNew ? 'Filamento criado.' : newPrice !== f.pricePerKg ? 'Preço salvo no histórico.' : 'Nome atualizado.');
    }}
  ]);

  setTimeout(() => {
    const priceInput = $('#filNewPrice');
    const hint = $('#filPriceHint');
    if (priceInput && hint) {
      const updateHint = () => {
        const newVal = Number(priceInput.value) || 0;
        const diff   = newVal - f.pricePerKg;
        if (Math.abs(diff) < 0.01) { hint.textContent = ''; return; }
        const pct = f.pricePerKg > 0 ? Math.abs(Math.round((diff / f.pricePerKg) * 100)) : 0;
        hint.innerHTML = diff > 0
          ? `<span style="color:var(--danger);">↑ Alta de ${brl(Math.abs(diff))}/kg (${pct}%)</span>`
          : `<span style="color:var(--success);">↓ Queda de ${brl(Math.abs(diff))}/kg (${pct}%)</span>`;
      };
      priceInput.addEventListener('input', updateHint);
    }
    $$('.ph-del').forEach(btn => btn.addEventListener('click', () => {
      const dateToRemove = btn.dataset.date;
      const sorted = [...f.priceHistory].sort((a,b) => b.date.localeCompare(a.date));
      if (sorted[0].date === dateToRemove) { toast('Não é possível remover o preço atual.'); return; }
      f.priceHistory = f.priceHistory.filter(h => h.date !== dateToRemove || h === sorted[0]);
      saveState(); openFilamentModal(id);
    }));
  }, 50);
}
$('#addFilamentBtn').onclick = () => openFilamentModal(null);

function refreshAvatar() {
  const av = $('#profileAvatar');
  if (state.profile.photo) {
    av.style.backgroundImage = `url(${state.profile.photo})`;
    av.style.backgroundSize = 'cover'; av.style.backgroundPosition = 'center';
    av.textContent = '';
  } else {
    av.style.backgroundImage = '';
    av.textContent = (state.profile.name || 'M').charAt(0).toUpperCase();
  }
}

['settingName','settingPhoto','settingGoal','settingHours'].forEach(id => {
  $('#'+id).addEventListener('change', e => {
    const map = { settingName:'name', settingPhoto:'photo', settingGoal:'goal', settingHours:'weeklyHours' };
    const key = map[id];
    state.profile[key] = (key === 'goal' || key === 'weeklyHours') ? Number(e.target.value)||0 : e.target.value;
    saveState(); refreshAvatar();
    toast('Perfil atualizado.');
  });
});

$$('.seg-btn', $('#themeSeg')).forEach(btn => btn.addEventListener('click', () => {
  state.theme = btn.dataset.theme; saveState(); applyTheme();
}));

$('#exportBtn').onclick = () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `extrusa-backup-${todayISO()}.json`; a.click();
  URL.revokeObjectURL(url);
  toast('Backup exportado.');
};
$('#importBtn').onclick = () => $('#importFile').click();
$('#importFile').addEventListener('change', e => {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      state = { ...defaultState(), ...parsed };
      saveState();
      toast('Backup importado com sucesso.');
      applyTheme();
      switchView('dashboard');
    } catch (err) { toast('Arquivo inválido.'); }
  };
  reader.readAsText(file);
  e.target.value = '';
});
$('#resetBtn').onclick = () => {
  openModal('Resetar todos os dados?', `<p style="font-size:13.5px;color:var(--text-muted);">Essa ação apaga permanentemente todo o seu progresso, projetos, produtos e finanças. Não pode ser desfeita.</p>`, [
    { label: 'Cancelar', cls: 'btn-ghost', onClick: closeModal },
    { label: 'Resetar tudo', cls: 'btn-danger', onClick: () => {
      state = defaultState(); saveState(); closeModal();
      applyTheme(); switchView('dashboard');
      toast('Dados resetados.');
    }}
  ]);
};

/* ---------------------------------------------------------
   18. POMODORO TIMER
--------------------------------------------------------- */
const pomodoro = { seconds: 25*60, running: false, mode: 'focus', timer: null };
function pomTick() {
  pomodoro.seconds--;
  if (pomodoro.seconds <= 0) {
    const wasFocus = pomodoro.mode === 'focus';
    if (wasFocus) registerStudyActivity(25/60);
    pomodoro.mode = wasFocus ? 'break' : 'focus';
    pomodoro.seconds = wasFocus ? 5*60 : 25*60;
    toast(wasFocus ? 'Foco concluído! Hora da pausa. ☕' : 'Pausa terminada. Bora imprimir ideias. 🖨️');
  }
  renderPomodoro();
}
function renderPomodoro() {
  const m = String(Math.floor(pomodoro.seconds/60)).padStart(2,'0');
  const s = String(pomodoro.seconds%60).padStart(2,'0');
  $('#pomTime').textContent = `${m}:${s}`;
  $('#pomDot').classList.toggle('is-running', pomodoro.running);
}
$('#pomodoroPill').addEventListener('click', () => {
  pomodoro.running = !pomodoro.running;
  if (pomodoro.running) { pomodoro.timer = setInterval(pomTick, 1000); toast('Pomodoro iniciado.'); }
  else { clearInterval(pomodoro.timer); }
  renderPomodoro();
});
renderPomodoro();

/* ---------------------------------------------------------
   19. MISC HELPERS
--------------------------------------------------------- */
function emptyState(icon, text) {
  return `<div style="grid-column:1/-1;text-align:center;padding:50px 20px;color:var(--text-faint);">
    <div style="font-size:32px;margin-bottom:10px;">${icon}</div>
    <p style="font-size:13.5px;">${text}</p>
  </div>`;
}

// Briefly highlights a field red and shows a toast
function highlight(selector, message) {
  const el = $(selector);
  if (!el) { toast(message); return; }
  el.style.outline = '2px solid var(--danger)';
  el.style.outlineOffset = '2px';
  el.focus();
  toast(message);
  setTimeout(() => { el.style.outline = ''; el.style.outlineOffset = ''; }, 2200);
}

/* ---------------------------------------------------------
   20. INIT
--------------------------------------------------------- */
function finishBoot() {
  applyTheme();
  switchView('dashboard');
  saveState();
  setInterval(applyTheme, 5 * 60 * 1000); // keep "auto" theme fresh
}
boot();
})();
}
