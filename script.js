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
      { id: uid(), name: 'PLA padrão', pricePerKg: 120 },
    ],
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
    filaments: parsed.filaments && parsed.filaments.length ? parsed.filaments : base.filaments,
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

let state = defaultState(); // placeholder until boot() resolves auth + data source

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
  state = await fetchOrCreateCloudState(user);
  showAuthScreen(false);
  setSyncStatus('synced');
  saveState(); // caches locally too, for offline access
  finishBoot();
}

function startGuestSession() {
  currentUser = null;
  cloudMode = false;
  state = loadLocalState();
  showAuthScreen(false);
  setSyncStatus('local');
  finishBoot();
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
  // parses strings like "1h30", "45min", "2h", "3h20min"
  if (!timeStr) return 0;
  let h = 0, m = 0;
  const hMatch = timeStr.match(/(\d+)\s*h/);
  if (hMatch) h = parseInt(hMatch[1], 10);
  const mm = timeStr.match(/h\s*(\d+)(?!\s*h)/) || timeStr.match(/(\d+)\s*min/);
  if (mm) m = parseInt(mm[1], 10);
  return h + m / 60;
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
  achievements: ['Conquistas', 'Cada marco do hobby ao negócio.'],
  settings: ['Configurações', 'Ajuste o app do seu jeito.'],
};

function switchView(view) {
  $$('.nav-item').forEach(b => b.classList.toggle('is-active', b.dataset.view === view));
  $$('.view').forEach(v => v.classList.toggle('is-active', v.id === `view-${view}`));
  $('#viewTitle').textContent = VIEW_META[view][0];
  $('#viewSubtitle').textContent = VIEW_META[view][1];
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
  if (view === 'achievements') renderAchievements();
  if (view === 'settings') renderSettings();
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
$('#themeToggle').onclick = () => {
  state.theme = state.theme === 'dark' ? 'light' : (state.theme === 'light' ? 'auto' : 'dark');
  saveState(); applyTheme();
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

  const tabs = $('#monthTabs');
  tabs.innerHTML = [1,2,3].map(m => `<button class="month-tab ${m===activeMonth?'is-active':''}" data-month="${m}">Mês ${m}</button>`).join('');
  $$('.month-tab', tabs).forEach(btn => btn.onclick = () => { activeMonth = Number(btn.dataset.month); renderStudy(); });

  const weeks = state.study.weeks.filter(w => w.month === activeMonth);
  const content = $('#studyContent');
  content.innerHTML = weeks.map(weekHtml).join('');

  weeks.forEach(w => bindWeekEvents(w));
}

function weekProgress(week) {
  const total = week.activities.length;
  const done = week.activities.filter(a => a.done).length;
  return total ? Math.round((done / total) * 100) : 0;
}

function weekHtml(week) {
  const pct = weekProgress(week);
  const topicsChips = week.topics.map(t => `<span class="tag tag--time">${escapeHtml(t)}</span>`).join('');
  const grouped = { topico: [], exercicio: [], projeto: [] };
  week.activities.forEach(a => grouped[a.type]?.push(a));

  const groupLabel = { topico: 'Tópicos de estudo', exercicio: 'Exercícios', projeto: 'Projetos' };
  let body = '';
  Object.entries(grouped).forEach(([key, acts]) => {
    if (!acts.length) return;
    body += `<div class="activity-group-title">${groupLabel[key]}</div>`;
    body += acts.map(a => activityHtml(week.id, a)).join('');
  });

  return `
    <div class="week-block" data-week="${week.id}">
      <div class="week-head">
        <h4>Semana ${week.weekNum} · ${escapeHtml(week.title)}</h4>
        <div class="printbar"><div class="printbar-fill" style="width:${pct}%"></div></div>
        <span class="pct">${pct}%</span>
      </div>
      <div class="meta-row" style="margin-bottom:10px;">${topicsChips}</div>
      ${body}
    </div>`;
}

const DIFF_LABEL = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' };
const PRIO_LABEL = { alta: 'Prioridade alta', media: 'Prioridade média', baixa: 'Prioridade baixa' };

function activityHtml(weekId, a) {
  return `
    <div class="activity ${a.done ? 'is-done' : ''}" data-week="${weekId}" data-act="${a.id}">
      <div class="activity-top">
        <input type="checkbox" ${a.done ? 'checked' : ''} class="act-check">
        <div style="flex:1;">
          <div class="activity-title">${escapeHtml(a.title)}</div>
          <div class="activity-desc">${escapeHtml(a.desc)}</div>
          <div class="activity-meta">
            <span class="tag tag--time">⏱ ${escapeHtml(a.time || '—')}</span>
            <span class="tag tag--diff-${a.difficulty}">${DIFF_LABEL[a.difficulty]}</span>
            <span class="tag tag--prio-${a.priority}">${PRIO_LABEL[a.priority]}</span>
          </div>
          <div class="activity-actions">
            <button class="link-btn act-link">▶ Abrir aula</button>
            <button class="btn-ghost btn-sm act-note-toggle">Observações</button>
            <button class="btn-primary btn-sm act-done">${a.done ? 'Concluído ✓' : 'Marcar concluído'}</button>
          </div>
          <textarea class="note-input act-note" placeholder="Suas observações..." style="display:none;">${escapeHtml(a.notes)}</textarea>
        </div>
      </div>
    </div>`;
}

function bindWeekEvents(week) {
  const block = document.querySelector(`.week-block[data-week="${week.id}"]`);
  if (!block) return;

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

    $('.act-link', actEl).onclick = () => {
      openModal('Editar link da aula', `
        <div class="field"><label>URL do vídeo (YouTube)</label><input type="text" id="mLink" value="${escapeHtml(activity.link || '')}" placeholder="https://youtube.com/..."></div>
      `, [
        { label: 'Cancelar', cls: 'btn-ghost', onClick: closeModal },
        { label: 'Salvar', cls: 'btn-primary', onClick: () => {
          activity.link = $('#mLink').value.trim();
          saveState(); closeModal();
          if (activity.link) window.open(activity.link, '_blank');
        }}
      ]);
    };

    const noteBox = $('.act-note', actEl);
    $('.act-note-toggle', actEl).onclick = () => {
      noteBox.style.display = noteBox.style.display === 'none' ? 'block' : 'none';
    };
    noteBox.onblur = () => { activity.notes = noteBox.value; saveState(); };
  });
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
        ${p.printTime ? `<span class="tag tag--time">⏱ ${escapeHtml(p.printTime)}</span>` : ''}
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
      <div class="field"><label>Tempo de impressão</label><input type="text" id="pPrintTime" value="${escapeHtml(p.printTime)}" placeholder="Ex: 3h20"></div>
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
      <div class="card-actions"><button class="btn-ghost btn-sm prod-edit">Editar</button></div>
    </div>`;
  }).join('');
  $$('.prod-edit', grid).forEach(btn => btn.onclick = e => openProductModal(e.target.closest('.item-card').dataset.id));
}
function statusLabel(s) { return { rascunho: 'Rascunho', teste: 'Em teste', publicado: 'Publicado' }[s] || s; }

function openProductModal(id) {
  const p = id ? state.products.find(x => x.id === id) : { id: uid(), name:'', category:'', price:0, cost:0, weight:0, printTime:'', sold:0, image:'', status:'rascunho' };
  const isNew = !id;
  openModal(isNew ? 'Novo produto' : 'Editar produto', `
    <div class="field"><label>Nome</label><input type="text" id="prName" value="${escapeHtml(p.name)}"></div>
    <div class="field"><label>Imagem (URL)</label><input type="text" id="prImage" value="${escapeHtml(p.image)}"></div>
    <div class="field-row">
      <div class="field"><label>Categoria</label><input type="text" id="prCategory" value="${escapeHtml(p.category)}"></div>
      <div class="field"><label>Status</label>
        <select id="prStatus">
          <option value="rascunho" ${p.status==='rascunho'?'selected':''}>Rascunho</option>
          <option value="teste" ${p.status==='teste'?'selected':''}>Em teste</option>
          <option value="publicado" ${p.status==='publicado'?'selected':''}>Publicado</option>
        </select>
      </div>
    </div>
    <div class="field-row">
      <div class="field"><label>Preço (R$)</label><input type="number" step="0.01" id="prPrice" value="${p.price}"></div>
      <div class="field"><label>Custo (R$)</label><input type="number" step="0.01" id="prCost" value="${p.cost}"></div>
    </div>
    <div class="field-row">
      <div class="field"><label>Peso (g)</label><input type="number" id="prWeight" value="${p.weight}"></div>
      <div class="field"><label>Tempo de impressão</label><input type="text" id="prPrintTime" value="${escapeHtml(p.printTime)}" placeholder="Ex: 3h20"></div>
    </div>
    <div class="field-row">
      <div class="field">
        <label>Filamento usado</label>
        <select id="prFilamentSelect">
          ${state.filaments.map(f => `<option value="${f.id}" ${p.filamentId===f.id?'selected':''}>${escapeHtml(f.name)} — ${brl(f.pricePerKg)}/kg</option>`).join('')}
          <option value="__custom" ${!p.filamentId?'selected':''}>Preço manual (kg)</option>
        </select>
      </div>
      <div class="field"><label>Preço do filamento (R$/kg)</label><input type="number" step="0.01" id="prFilamentPrice" value="${p.filamentPriceOverride || state.finance.filamentPrice || 0}"></div>
    </div>
    <div class="field"><label>Custos extras (R$) — embalagem, mão de obra etc.</label><input type="number" step="0.01" id="prExtraCost" value="${p.extraCost || 0}"></div>
    <div class="cost-calc-box">
      <button type="button" class="btn-ghost btn-sm" id="prCalcCostBtn">🧮 Calcular custo automaticamente</button>
      <p class="cost-calc-breakdown" id="prCostBreakdown"></p>
    </div>
    <div class="field"><label>Quantidade vendida</label><input type="number" id="prSold" value="${p.sold}"></div>
  `, [
    ...(isNew ? [] : [{ label: 'Excluir', cls: 'btn-danger', onClick: () => { state.products = state.products.filter(x=>x.id!==id); saveState(); closeModal(); renderProducts(); renderDashboard(); }}]),
    { label: 'Cancelar', cls: 'btn-ghost', onClick: closeModal },
    { label: 'Salvar', cls: 'btn-primary', onClick: () => {
      p.name = $('#prName').value.trim() || 'Sem nome';
      p.image = $('#prImage').value.trim();
      p.category = $('#prCategory').value.trim();
      p.status = $('#prStatus').value;
      p.price = Number($('#prPrice').value) || 0;
      p.cost = Number($('#prCost').value) || 0;
      p.weight = Number($('#prWeight').value) || 0;
      p.printTime = $('#prPrintTime').value.trim();
      const filSel = $('#prFilamentSelect').value;
      p.filamentId = filSel === '__custom' ? null : filSel;
      p.filamentPriceOverride = Number($('#prFilamentPrice').value) || 0;
      p.extraCost = Number($('#prExtraCost').value) || 0;
      const prevSold = p.sold || 0;
      p.sold = Number($('#prSold').value) || 0;
      if (isNew) state.products.push(p);
      // auto-log revenue diff as a finance entry when sold count increases
      if (p.sold > prevSold) {
        const diff = p.sold - prevSold;
        state.finance.entries.push({ id: uid(), date: todayISO(), type: 'receita', desc: `Venda: ${p.name} (${diff}x)`, value: diff * p.price });
      }
      saveState(); closeModal(); renderProducts(); renderDashboard();
      toast(isNew ? 'Produto criado.' : 'Produto atualizado.');
    }}
  ]);

  $('#prFilamentSelect').onchange = e => {
    if (e.target.value === '__custom') return;
    const f = state.filaments.find(x => x.id === e.target.value);
    if (f) $('#prFilamentPrice').value = f.pricePerKg;
  };

  $('#prCalcCostBtn').onclick = () => {
    const weightG = Number($('#prWeight').value) || 0;
    const printTimeStr = $('#prPrintTime').value.trim();
    const extra = Number($('#prExtraCost').value) || 0;
    const filamentPriceKg = Number($('#prFilamentPrice').value) || 0;
    const hours = parseTimeToHours(printTimeStr);

    if (!weightG && !hours) {
      $('#prCostBreakdown').innerHTML = '<span class="cost-calc-warn">Preencha ao menos o peso (g) ou o tempo de impressão para calcular.</span>';
      return;
    }

    const filamentPricePerGram = filamentPriceKg / 1000;
    const filamentCost = weightG * filamentPricePerGram;
    const powerKW = (state.finance.printerPower || 0) / 1000;
    const energyCost = hours * powerKW * (state.finance.energyPrice || 0);
    const total = filamentCost + energyCost + extra;

    $('#prCost').value = total.toFixed(2);
    $('#prCostBreakdown').innerHTML = `
      Filamento: <strong>${brl(filamentCost)}</strong> (${weightG}g × ${brl(filamentPricePerGram)}/g)<br>
      Energia: <strong>${brl(energyCost)}</strong> (${hours.toFixed(2)}h × ${state.finance.printerPower || 0}W × ${brl(state.finance.energyPrice||0)}/kWh)<br>
      Custos extras: <strong>${brl(extra)}</strong><br>
      <span style="color:var(--accent);">Custo total estimado: ${brl(total)}</span>
    `;
  };
}
$('#addProductBtn').onclick = () => openProductModal(null);

/* ---------------------------------------------------------
   15. FINANCE
--------------------------------------------------------- */
function renderFinance() {
  const t = computeTotals();
  $('#finRevenue').textContent = brl(t.revenue);
  $('#finExpense').textContent = brl(t.expense);
  $('#finProfit').textContent = brl(t.profit);
  $('#finInvestment').textContent = brl(state.finance.entries.filter(e=>/invest/i.test(e.desc)).reduce((s,e)=>s+Number(e.value||0),0));
  $('#finCostGram').textContent = brl((state.finance.filamentPrice || 0) / 1000);

  const margins = state.products.filter(p => p.price).map(p => (p.price - p.cost) / p.price);
  const avgMargin = margins.length ? Math.round((margins.reduce((a,b)=>a+b,0) / margins.length) * 100) : 0;
  $('#finMargin').textContent = avgMargin + '%';

  $('#filamentPriceInput').value = state.finance.filamentPrice;
  $('#energyPriceInput').value = state.finance.energyPrice;
  $('#printerPowerInput').value = state.finance.printerPower;
  $('#financialGoalInput').value = state.finance.goal;

  // top products by profit
  const ranked = [...state.products].map(p => ({ name: p.name, profit: (p.price - p.cost) * (p.sold||0) }))
    .sort((a,b) => b.profit - a.profit).slice(0, 5);
  $('#topProducts').innerHTML = ranked.length ? ranked.map(r => `<li><span>${escapeHtml(r.name)}</span><strong>${brl(r.profit)}</strong></li>`).join('') :
    '<li style="color:var(--text-faint);">Cadastre produtos para ver o ranking.</li>';

  // monthly chart (last 6 months, revenue vs expense net)
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    months.push(d.toISOString().slice(0,7));
  }
  const netByMonth = months.map(m => {
    const rev = state.finance.entries.filter(e => e.type==='receita' && e.date.startsWith(m)).reduce((s,e)=>s+Number(e.value||0),0);
    const exp = state.finance.entries.filter(e => e.type==='despesa' && e.date.startsWith(m)).reduce((s,e)=>s+Number(e.value||0),0);
    return rev - exp;
  });
  drawBarChart($('#finChart'), netByMonth, months.map(m => m.slice(5)));

  // table
  const body = $('#financeTableBody');
  const sorted = [...state.finance.entries].sort((a,b) => b.date.localeCompare(a.date));
  body.innerHTML = sorted.length ? sorted.map(e => `
    <tr data-id="${e.id}">
      <td>${fmtDate(e.date)}</td>
      <td>${e.type === 'receita' ? 'Receita' : 'Despesa'}</td>
      <td>${escapeHtml(e.desc)}</td>
      <td class="${e.type==='receita'?'amount-pos':'amount-neg'}">${e.type==='receita'?'+':'-'}${brl(e.value)}</td>
      <td><button class="row-del" title="Remover">✕</button></td>
    </tr>`).join('') : `<tr><td colspan="5" style="color:var(--text-faint);">Nenhum lançamento ainda.</td></tr>`;
  $$('.row-del', body).forEach(btn => btn.onclick = e => {
    const id = e.target.closest('tr').dataset.id;
    state.finance.entries = state.finance.entries.filter(x => x.id !== id);
    saveState(); renderFinance(); renderDashboard();
  });
}

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

$('#addRevenueBtn').onclick = () => openFinanceEntryModal('receita');
$('#addExpenseBtn').onclick = () => openFinanceEntryModal('despesa');

function openFinanceEntryModal(type) {
  openModal(type === 'receita' ? 'Nova receita' : 'Nova despesa', `
    <div class="field"><label>Data</label><input type="date" id="fDate" value="${todayISO()}"></div>
    <div class="field"><label>Descrição</label><input type="text" id="fDesc" placeholder="Ex: Venda chaveiro personalizado"></div>
    <div class="field"><label>Valor (R$)</label><input type="number" step="0.01" id="fValue"></div>
  `, [
    { label: 'Cancelar', cls: 'btn-ghost', onClick: closeModal },
    { label: 'Adicionar', cls: 'btn-primary', onClick: () => {
      const value = Number($('#fValue').value) || 0;
      const desc = $('#fDesc').value.trim() || (type === 'receita' ? 'Receita' : 'Despesa');
      state.finance.entries.push({ id: uid(), date: $('#fDate').value || todayISO(), type, desc, value });
      saveState(); closeModal(); renderFinance(); renderDashboard();
    }}
  ]);
}

$('#filamentPriceInput').addEventListener('change', e => { state.finance.filamentPrice = Number(e.target.value)||0; saveState(); renderFinance(); });
$('#energyPriceInput').addEventListener('change', e => { state.finance.energyPrice = Number(e.target.value)||0; saveState(); renderFinance(); });
$('#printerPowerInput').addEventListener('change', e => { state.finance.printerPower = Number(e.target.value)||0; saveState(); renderFinance(); });
$('#financialGoalInput').addEventListener('change', e => { state.finance.goal = Number(e.target.value)||0; saveState(); });

/* ---------------------------------------------------------
   16. ACHIEVEMENTS VIEW
--------------------------------------------------------- */
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
function renderSettings() {
  $('#settingName').value = state.profile.name;
  $('#settingPhoto').value = state.profile.photo;
  $('#settingGoal').value = state.profile.goal;
  $('#settingHours').value = state.profile.weeklyHours;
  applyTheme();
  refreshAvatar();
  renderFilamentList();

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

function renderFilamentList() {
  const el = $('#filamentList');
  if (!state.filaments.length) { el.innerHTML = '<p style="color:var(--text-faint);font-size:12.5px;">Nenhum filamento cadastrado.</p>'; return; }
  el.innerHTML = state.filaments.map(f => `
    <li class="filament-row" data-id="${f.id}">
      <span class="fname">${escapeHtml(f.name)}</span>
      <span class="fprice">${brl(f.pricePerKg)}/kg</span>
      <button class="fil-edit" title="Editar">✎</button>
      <button class="fil-del" title="Remover">✕</button>
    </li>`).join('');
  $$('.fil-edit', el).forEach(btn => btn.onclick = e => openFilamentModal(e.target.closest('.filament-row').dataset.id));
  $$('.fil-del', el).forEach(btn => btn.onclick = e => {
    const id = e.target.closest('.filament-row').dataset.id;
    state.filaments = state.filaments.filter(x => x.id !== id);
    saveState(); renderFilamentList();
  });
}

function openFilamentModal(id) {
  const f = id ? state.filaments.find(x => x.id === id) : { id: uid(), name: '', pricePerKg: state.finance.filamentPrice || 120 };
  const isNew = !id;
  openModal(isNew ? 'Novo filamento' : 'Editar filamento', `
    <div class="field"><label>Nome (material, marca, cor)</label><input type="text" id="filName" value="${escapeHtml(f.name)}" placeholder="Ex: PETG Preto Voolt3D"></div>
    <div class="field"><label>Preço por kg (R$)</label><input type="number" step="0.01" id="filPrice" value="${f.pricePerKg}"></div>
  `, [
    ...(isNew ? [] : [{ label: 'Excluir', cls: 'btn-danger', onClick: () => { state.filaments = state.filaments.filter(x=>x.id!==id); saveState(); closeModal(); renderFilamentList(); }}]),
    { label: 'Cancelar', cls: 'btn-ghost', onClick: closeModal },
    { label: 'Salvar', cls: 'btn-primary', onClick: () => {
      f.name = $('#filName').value.trim() || 'Sem nome';
      f.pricePerKg = Number($('#filPrice').value) || 0;
      if (isNew) state.filaments.push(f);
      saveState(); closeModal(); renderFilamentList();
      toast(isNew ? 'Filamento adicionado.' : 'Filamento atualizado.');
    }}
  ]);
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
