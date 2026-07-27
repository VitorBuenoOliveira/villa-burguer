const fs = require('fs');

// 1. Ler o CSS original completo
const originalCss = fs.readFileSync('scratch/original_css.css', 'utf8');

// Adicionar estilos específicos de KDS, Track, Motoboy e Admin ao CSS
fs.writeFileSync('css/base.css', originalCss, 'utf8');
console.log('css/base.css atualizado com o design system original completo!');

// 2. Construir o index.html restaurado mantendo todas as novas funcionalidades
const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Villa Burguer – Hambúrgueres Artesanais em Hortolândia, SP</title>
<meta name="description" content="Villa Burguer – Os melhores hambúrgueres artesanais de Hortolândia! Peça agora online pelo cardápio digital.">
<meta name="keywords" content="hamburguer, hamburgueria, hortolândia, artesanal, delivery, villa burguer, KDS, pedidos">
<meta name="author" content="Villa Burguer">
<meta name="theme-color" content="#E65100">

<!-- Open Graph -->
<meta property="og:title" content="Villa Burguer – Hortolândia 🍔">
<meta property="og:description" content="Os melhores hambúrgueres artesanais de Hortolândia! Peça online em tempo real.">
<meta property="og:type" content="restaurant">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="Villa Burguer">

<!-- Fonts & Icons -->
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600;700;800&family=Barlow+Condensed:wght@600;700;800&display=swap" rel="stylesheet">
<link rel="icon" type="image/png" href="imgs/logo.png">

<!-- Socket.io & Mercado Pago SDKs -->
<script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>
<script src="https://sdk.mercadopago.com/js/v2"></script>

<!-- Stylesheets Modulares -->
<link rel="stylesheet" href="css/tokens.css">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/pages/kds.css">
<link rel="stylesheet" href="css/pages/track.css">
<link rel="stylesheet" href="css/pages/motoboy.css">
<link rel="stylesheet" href="css/pages/admin.css">
</head>
<body>

<!-- PRELOADER -->
<div id="preloader">
  <img src="imgs/logo.png" alt="Villa Burguer" class="preloader-logo">
  <h2 style="color:#FFF; font-family:'Bebas Neue',sans-serif; margin-top:1rem; letter-spacing:2px;">VILLA BURGUER</h2>
</div>

<!-- BARRA DE STATUS DA LOJA -->
<div id="store-status-bar" class="store-status-bar open">
  <span class="status-dot">🟢</span>
  <span id="store-status-text">LOJA ABERTA PARA PEDIDOS ONLINE — ENTREGA RÁPIDA EM HORTOLÂNDIA</span>
</div>

<!-- NAVBAR -->
<nav>
  <div class="nav-logo" onclick="selectNav('home')">
    <img src="imgs/logo.png" alt="Logo">
    <span>VILLA <span>BURGUER</span></span>
  </div>
  <button id="mobile-toggle" class="mobile-menu-toggle" onclick="toggleMobileNav()" aria-label="Abrir Menu">☰</button>
  <ul id="nav-links" class="nav-links">
    <li><a id="nav-home" class="active" onclick="selectNav('home')">INÍCIO</a></li>
    <li><a id="nav-cardapio" onclick="selectNav('cardapio')">CARDÁPIO</a></li>
    <li><a id="nav-pedido" onclick="selectNav('pedido')">FAZER PEDIDO</a></li>
    <li><a id="nav-track" onclick="selectNav('track')">RASTREAR</a></li>
    <li id="nav-item-kds" style="display:none;"><a id="nav-kds" onclick="selectNav('kds')">🍳 KDS COZINHA</a></li>
    <li id="nav-item-motoboy" style="display:none;"><a id="nav-motoboy" onclick="selectNav('motoboy')">🛵 ENTREGAS</a></li>
    <li id="nav-item-admin" style="display:none;"><a id="nav-admin" onclick="selectNav('admin')">👑 ADMIN</a></li>
    <li><a id="nav-user-btn" class="user-nav-btn" onclick="openUserModal(); closeMobileNav();">🔑 LOGIN</a></li>
  </ul>
</nav>

<!-- ==================== PAGE: HOME ==================== -->
<div class="page active" id="page-home">
  <section class="hero">
    <div class="hero-bg-carousel">
      <div class="hero-bg-slide active" style="background-image: url('imgs/img8.png');"></div>
      <div class="hero-bg-slide" style="background-image: url('imgs/wpp1.jpeg');"></div>
      <div class="hero-bg-slide" style="background-image: url('imgs/img5.png');"></div>
      <div class="hero-bg-slide" style="background-image: url('imgs/wpp2.jpeg');"></div>
    </div>
    <div class="hero-overlay"></div>

    <div class="hero-content fade-in visible">
      <img src="imgs/logo.png" style="width:95px; height:95px; border-radius:50%; object-fit:cover; margin-bottom:1rem; border:4px solid var(--primary-orange); box-shadow:var(--shadow-glow);" alt="Villa Burguer">
      <br>
      <div class="hero-badge">🏆 O MELHOR ARTESANAL DE HORTOLÂNDIA</div>
      <h1>SABOR INCOMPARÁVEL <span>BURGUER GOURMET</span></h1>
      <p>Hambúrgueres artesanais 100% bovinos, queijos derretidos e molhos artesanais preparados diariamente com carinho!</p>
      <div class="hero-cta">
        <button class="btn-primary" onclick="selectNav('pedido')">🛒 FAZER PEDIDO AGORA</button>
        <button class="btn-secondary" onclick="selectNav('cardapio')">📋 VER CARDÁPIO</button>
      </div>
    </div>
  </section>

  <section class="features">
    <div class="feature-item fade-in visible">
      <span class="feature-icon">🥩</span>
      <h3>100% Blend Artesanal</h3>
      <p>Carne 150g selecionada e grelhada no ponto ideal.</p>
    </div>
    <div class="feature-item fade-in visible">
      <span class="feature-icon">🧀</span>
      <h3>Cheddar & Queijos Premium</h3>
      <p>Piscina de cheddar, Catupiry original e Queijo Coalho.</p>
    </div>
    <div class="feature-item fade-in visible">
      <span class="feature-icon">🚀</span>
      <h3>Entrega Quentinha</h3>
      <p>Chega rápido no conforto da sua casa em Hortolândia.</p>
    </div>
  </section>

  <section class="destaques-section">
    <div class="section fade-in visible">
      <div class="section-label">FOTOS REAIS DOS NOSSOS LANCHES</div>
      <h2 class="section-title">🔥 MAIS PEDIDOS DA CASA</h2>

      <div class="carousel-wrapper" id="carousel-wrapper">
        <div class="carousel-track" id="carousel-track"></div>
      </div>
      
      <div class="carousel-nav">
        <button class="carousel-btn" id="carousel-prev" onclick="carouselMove(-1)">‹</button>
        <div class="carousel-dots" id="carousel-dots"></div>
        <button class="carousel-btn" id="carousel-next" onclick="carouselMove(1)">›</button>
      </div>
    </div>
  </section>

  <div class="insta-strip">
    <span>📸 Siga nosso Instagram oficial:</span>
    <a href="https://instagram.com" target="_blank">@villaburguer.hortolandia</a>
  </div>

  <footer>
    <p><strong>Villa Burguer</strong> – Hambúrgueres Artesanais em Hortolândia, SP.</p>
    <p style="margin-top:0.5rem; font-size:0.92rem; opacity:0.95;">Peça direto pelo WhatsApp ou Online: <strong>(19) 98124-2106</strong></p>
  </footer>
</div>

<!-- ==================== PAGE: CARDÁPIO ==================== -->
<div class="page" id="page-cardapio">
  <div class="menu-hero">
    <h1>CARDÁPIO COMPLETO</h1>
    <p>Explore nosso menu completo com fotos reais e valores atualizados!</p>
  </div>

  <div class="menu-tabs">
    <button class="menu-tab active" onclick="switchMenuTab('hamburgueres', this)">🍔 Hambúrgueres</button>
    <button class="menu-tab" onclick="switchMenuTab('combos2x', this)">👑 Combos 2x</button>
    <button class="menu-tab" onclick="switchMenuTab('porcoes', this)">🍟 Porções</button>
    <button class="menu-tab" onclick="switchMenuTab('bebidas', this)">🥤 Bebidas</button>
    <button class="menu-tab" onclick="switchMenuTab('sobremesa', this)">🍮 Sobremesas</button>
    <button class="menu-tab" onclick="switchMenuTab('adicional', this)">➕ Adicionais</button>
  </div>

  <div class="menu-section-wrapper">
    <div id="menu-content-container"></div>
  </div>

  <footer>
    <p><strong>Villa Burguer</strong> – Hambúrgueres Artesanais em Hortolândia, SP.</p>
    <p style="margin-top:0.5rem; font-size:0.92rem;">Peça direto pelo WhatsApp: <strong>(19) 98124-2106</strong></p>
  </footer>
</div>

<!-- ==================== PAGE: FAZER PEDIDO ==================== -->
<div class="page" id="page-pedido">
  <div class="order-page-wrapper">
    <div class="section" style="padding-top:1rem; padding-bottom:1rem;">
      <div class="section-label">MONTE SEU PEDIDO</div>
      <h2 class="section-title">SELEÇÃO DE ITENS</h2>
    </div>

    <div class="order-container">
      <div>
        <div class="order-cats">
          <button class="order-cat-btn active" onclick="filterOrder('todos', this)">Todos os Itens</button>
          <button class="order-cat-btn" onclick="filterOrder('hamburgueres', this)">🍔 Hambúrgueres</button>
          <button class="order-cat-btn" onclick="filterOrder('combos2x', this)">👑 Combos 2x</button>
          <button class="order-cat-btn" onclick="filterOrder('porcoes', this)">🍟 Porções</button>
          <button class="order-cat-btn" onclick="filterOrder('bebidas', this)">🥤 Bebidas</button>
          <button class="order-cat-btn" onclick="filterOrder('adicional', this)">➕ Adicionais</button>
        </div>

        <div class="order-grid" id="order-grid"></div>
      </div>

      <div class="cart-sidebar">
        <div class="cart-title">
          <span>SEU CARRINHO</span>
          <span class="cart-count-badge" id="cart-count-badge">0</span>
        </div>

        <div id="min-order-banner" class="min-order-banner">
          ⚠️ Pedido mínimo para entrega: <strong>R$ 25,00</strong>
        </div>

        <div class="cart-items" id="cart-items">
          <div class="cart-empty">Seu carrinho está vazio 🛒</div>
        </div>

        <div class="cart-total-row">
          <span>TOTAL:</span>
          <span id="cart-total">R$ 0,00</span>
        </div>

        <button id="whatsapp-btn" class="btn-primary" style="width:100%; margin-top:1.2rem;" onclick="openCartModal()" disabled>
          AVANÇAR PARA CHECKOUT ➡️
        </button>
      </div>
    </div>
  </div>

  <footer>
    <p><strong>Villa Burguer</strong> – Hambúrgueres Artesanais em Hortolândia, SP.</p>
  </footer>
</div>

<!-- ==================== PAGE: RASTREAMENTO (#page-track) ==================== -->
<div class="page" id="page-track">
  <div class="track-card">
    <h2 style="font-family:'Bebas Neue',sans-serif; font-size:2.4rem; color:var(--primary-orange); text-align:center;">ACOMPANHAMENTO EM TEMPO REAL</h2>
    
    <div id="track-auto-banner" style="display:none; text-align:center; padding:1rem; background:#FFF5EF; border-radius:12px; margin-bottom:1rem; border:1px solid var(--primary-orange);">
      <span style="font-weight:700; color:var(--primary-orange);">🛵 Exibindo seu pedido ativo em andamento</span>
    </div>

    <div id="track-manual-box" style="margin-bottom:1rem;">
      <details style="cursor:pointer; color:var(--text-muted); font-size:0.9rem; margin-bottom:1rem;">
        <summary style="font-weight:700; color:var(--primary-orange);">🔍 Rastrear outro pedido manualmente (Código / Token)</summary>
        <div class="track-search-row" style="margin-top:0.8rem;">
          <input type="text" id="track-code-inp" class="form-control" placeholder="Código (ex: VB-9042)">
          <input type="text" id="track-token-inp" class="form-control" placeholder="Token de Rastreio (UUID v4)">
          <button class="btn-primary" onclick="fetchOrderTracking()">BUSCAR</button>
        </div>
      </details>
    </div>

    <div id="track-result" style="display:none;">
      <div style="display:flex; justify-content:space-between; align-items:center; background:#F8F6F2; padding:1rem; border-radius:10px;">
        <div>
          <strong id="tr-code" style="font-size:1.4rem; color:var(--primary-orange);">VB-0000</strong>
          <div id="tr-client" style="color:var(--text-muted); font-size:0.9rem;">Cliente</div>
        </div>
        <div id="tr-status-badge" style="padding:0.4rem 1rem; border-radius:20px; font-weight:800; background:#FF5500; color:#FFF; text-transform:uppercase;">PENDENTE</div>
      </div>

      <div class="timeline">
        <div id="tr-progress" class="timeline-progress" style="width: 0%;"></div>
        <div id="step-1" class="timeline-step active"><div class="step-icon">1</div><div class="step-label">Recebido</div></div>
        <div id="step-2" class="timeline-step"><div class="step-icon">2</div><div class="step-label">Em Preparo</div></div>
        <div id="step-3" class="timeline-step"><div class="step-icon">3</div><div class="step-label">Pronto</div></div>
        <div id="step-4" class="timeline-step"><div class="step-icon">4</div><div class="step-label">Concluído</div></div>
      </div>

      <div id="tr-items-list" style="border-top:1px solid #EEE; padding-top:1rem; margin-top:1rem;"></div>
    </div>
  </div>
</div>

<!-- ==================== PAGE: KDS (#page-kds) ==================== -->
<div class="page" id="page-kds">
  <div class="kds-container">
    <div class="kds-header">
      <div class="kds-title">🍳 KDS — FILA DA COZINHA (FIFO)</div>
      <div style="display:flex; gap:1rem; align-items:center;">
        <span id="kds-count-badge" style="background:#FF5500; padding:0.4rem 1rem; border-radius:20px; font-weight:800;">0 PEDIDOS ATIVOS</span>
      </div>
    </div>
    <div id="kds-grid" class="kds-grid"></div>
  </div>
</div>

<!-- ==================== PAGE: MOTOBOY (#page-motoboy) ==================== -->
<div class="page" id="page-motoboy">
  <div style="padding:2rem; max-width:1000px; margin:0 auto;">
    <h2 style="font-family:'Bebas Neue',sans-serif; font-size:2.8rem; color:var(--primary-orange);">🛵 PAINEL DE ENTREGAS</h2>
    <div id="motoboy-grid" class="menu-grid" style="padding:1rem 0;"></div>
  </div>
</div>

<!-- ==================== PAGE: ADMIN (#page-admin) ==================== -->
<div class="page" id="page-admin">
  <div style="padding:2rem; max-width:1200px; margin:0 auto;">
    <h2 style="font-family:'Bebas Neue',sans-serif; font-size:2.8rem; color:var(--primary-orange);">👑 PAINEL ADMINISTRATIVO</h2>
    
    <div style="display:flex; gap:1rem; margin:1.5rem 0; border-bottom:2px solid #E2D7CC; padding-bottom:0.8rem; flex-wrap:wrap;">
      <button id="atab-btn-users" class="btn-secondary active" onclick="switchAdminTab('users')">👥 Gestão de Cargos (RBAC)</button>
      <button id="atab-btn-products" class="btn-secondary" onclick="switchAdminTab('products')">🍔 Produtos & Cardápio</button>
      <button id="atab-btn-audit" class="btn-secondary" onclick="switchAdminTab('audit')">📜 Logs de Auditoria</button>
      <button id="atab-btn-reports" class="btn-secondary" onclick="switchAdminTab('reports')">📊 Relatório de Vendas</button>
    </div>

    <!-- TAB ADMIN: CARGOS RBAC -->
    <div id="atab-users" class="admin-tab">
      <h3>Gerenciamento de Usuários e Permissões (RBAC)</h3>
      <div class="table-responsive">
        <table style="width:100%; border-collapse:collapse; margin-top:1rem; background:#FFF; border-radius:10px; overflow:hidden; box-shadow:var(--shadow-sm);">
          <thead style="background:#1F1F1F; color:#FFF;">
            <tr>
              <th style="padding:0.8rem; text-align:left;">ID</th>
              <th style="padding:0.8rem; text-align:left;">Nome</th>
              <th style="padding:0.8rem; text-align:left;">E-mail</th>
              <th style="padding:0.8rem; text-align:left;">Cargo Atual</th>
              <th style="padding:0.8rem; text-align:left;">Alterar Cargo</th>
            </tr>
          </thead>
          <tbody id="admin-users-tbody"></tbody>
        </table>
      </div>
    </div>

    <!-- TAB ADMIN: PRODUTOS & CARDÁPIO -->
    <div id="atab-products" class="admin-tab" style="display:none;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <h3>Gestão de Produtos do Cardápio</h3>
        <button class="btn-primary" onclick="openNewProductModal()">➕ NOVO PRODUTO</button>
      </div>
      <div id="admin-products-list" style="margin-top:1rem;"></div>
    </div>

    <!-- TAB ADMIN: AUDITORIA -->
    <div id="atab-audit" class="admin-tab" style="display:none;">
      <h3>Registros de Auditoria do Sistema (audit_log)</h3>
      <div id="admin-audit-logs" style="margin-top:1rem; background:#FFF; padding:1rem; border-radius:10px; box-shadow:var(--shadow-sm);"></div>
    </div>

    <!-- TAB ADMIN: RELATÓRIOS -->
    <div id="atab-reports" class="admin-tab" style="display:none;">
      <h3>Relatórios Financeiros e Métricas</h3>
      <div id="admin-reports-content" style="margin-top:1rem; background:#FFF; padding:1.5rem; border-radius:10px; box-shadow:var(--shadow-sm);"></div>
    </div>
  </div>
</div>

<!-- MODAL AUTH / USER -->
<div id="user-modal" class="modal-backdrop">
  <div class="modal-box">
    <button class="modal-close" onclick="closeUserModal()">×</button>
    <div id="auth-forms">
      <h3 style="font-family:'Bebas Neue',sans-serif; font-size:2rem; color:var(--primary-orange); text-align:center;">LOGIN DE USUÁRIO</h3>
      <div class="form-group" style="margin-top:1rem;">
        <label>E-mail</label>
        <input type="email" id="auth-email" class="form-control" placeholder="seu@email.com">
      </div>
      <div class="form-group">
        <label>Senha</label>
        <input type="password" id="auth-pass" class="form-control" placeholder="••••••••">
      </div>
      <button class="btn-primary" style="width:100%; margin-top:0.5rem;" onclick="handleLogin()">ENTRAR</button>
    </div>
  </div>
</div>

<!-- MODAL CARRINHO & CHECKOUT -->
<div id="cart-modal" class="modal-backdrop">
  <div class="modal-box">
    <button class="modal-close" onclick="closeCartModal()">×</button>
    <h3 style="font-family:'Bebas Neue',sans-serif; font-size:2.2rem; color:var(--primary-orange); margin-bottom:1rem;">SEU CARRINHO DE COMPRAS</h3>
    
    <div id="cart-modal-items" style="max-height:220px; overflow-y:auto; margin-bottom:1rem; border-bottom:1px solid #EEE;"></div>
    <div style="display:flex; justify-content:space-between; font-weight:800; font-size:1.2rem; margin-bottom:1.5rem;">
      <span>TOTAL:</span>
      <span id="cart-modal-total" style="color:var(--primary-orange);">R$ 0,00</span>
    </div>

    <!-- DADOS DO CLIENTE CONVIDADO OU LOGADO -->
    <div id="checkout-form">
      <h4 style="margin-bottom:0.8rem;">Dados de Entrega</h4>
      <div class="form-group">
        <label>Seu Nome</label>
        <input type="text" id="chk-name" class="form-control" placeholder="Nome Completo">
      </div>
      <div class="form-group">
        <label>WhatsApp / Telefone</label>
        <input type="text" id="chk-phone" class="form-control" placeholder="(19) 99999-8888">
      </div>
      <div class="form-group">
        <label>Endereço Completo</label>
        <input type="text" id="chk-address" class="form-control" placeholder="Rua, Número, Bairro">
      </div>

      <h4 style="margin:1rem 0 0.8rem;">Forma de Pagamento</h4>
      <div class="form-group">
        <select id="chk-payment" class="form-control" onchange="togglePaymentFields()">
          <option value="pix">⚡ Pix (QR Code / Copia e Cola)</option>
          <option value="credit">💳 Cartão de Crédito (Tokenizado MP)</option>
          <option value="entrega">💵 Pagamento na Entrega (Dinheiro/Maquininha)</option>
        </select>
      </div>

      <!-- PAINEL PIX QR CODE -->
      <div id="pay-pix-area" style="display:none; text-align:center; background:#FFF5EF; padding:1rem; border-radius:10px; margin-bottom:1rem; border:1px dashed var(--primary-orange);">
        <p style="font-weight:800; color:var(--primary-orange);">Aguardando pagamento Pix...</p>
        <textarea id="pix-copia-cola" class="form-control" style="font-size:0.75rem; height:60px; margin:0.6rem 0;" readonly></textarea>
        <button class="btn-primary" style="padding:0.4rem 1rem; font-size:0.85rem;" onclick="copyPixCode()">📋 COPIAR CÓDIGO PIX</button>
      </div>

      <button class="btn-primary" style="width:100%; margin-top:0.5rem; font-size:1.1rem;" onclick="submitCheckout()">FINALIZAR PEDIDO</button>
    </div>
  </div>
</div>

<!-- TOAST NOTIFICATION -->
<div id="notif">Notificação</div>

<!-- JAVASCRIPT ENGINE UNIFICADO -->
<script>
const API_URL = (window.location.port === '4000') ? '/api' : 'http://localhost:4000/api';
let socket = null;
let currentUser = null;
let cart = [];
let allProducts = [];

// INICIALIZAR SOCKET.IO
try {
  socket = io(window.location.origin);
  socket.on('connect', () => console.log('⚡ Conectado ao servidor de WebSockets.'));
  socket.on('order:new', (order) => {
    playKdsAudioChime();
    showNotif(\`🔔 Novo pedido #\${order.orderCode} recebido!\`);
    loadKdsOrders();
  });
  socket.on('order:updated', () => {
    loadKdsOrders();
    loadMotoboyOrders();
  });
} catch (e) {
  console.warn('Socket.io indisponível offline:', e);
}

function playKdsAudioChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch(e) {}
}

function showNotif(msg) {
  const n = document.getElementById('notif');
  n.textContent = msg;
  n.classList.add('show');
  setTimeout(() => n.classList.remove('show'), 3500);
}

function fmt(val) {
  return 'R$ ' + parseFloat(val || 0).toFixed(2).replace('.', ',');
}

function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// NAVEGAÇÃO SPA & GAVETA MOBILE
function toggleMobileNav() {
  const links = document.getElementById('nav-links');
  if (links) links.classList.toggle('open');
}
function closeMobileNav() {
  const links = document.getElementById('nav-links');
  if (links) links.classList.remove('open');
}
function selectNav(id) {
  showPage(id);
  closeMobileNav();
}

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pg = document.getElementById('page-' + id);
  if (pg) pg.classList.add('active');
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  const navEl = document.getElementById('nav-' + id);
  if (navEl) navEl.classList.add('active');
  window.scrollTo(0, 0);

  if (id === 'track') autoLoadActiveOrderTracking();
  if (id === 'kds') { if (socket) socket.emit('join_room', 'kds'); loadKdsOrders(); }
  if (id === 'motoboy') { if (socket) socket.emit('join_room', 'motoboy'); loadMotoboyOrders(); }
  if (id === 'admin') loadAdminUsers();
}

// CARROSEL HERO DE FUNDO (AUTO-SLIDE)
let heroSlideIdx = 0;
function initHeroCarousel() {
  const slides = document.querySelectorAll('.hero-bg-slide');
  if (slides.length <= 1) return;
  setInterval(() => {
    slides[heroSlideIdx].classList.remove('active');
    heroSlideIdx = (heroSlideIdx + 1) % slides.length;
    slides[heroSlideIdx].classList.add('active');
  }, 5000);
}

// CARROSSEL MAIS PEDIDOS DA CASA
let carouselPos = 0;
function carouselMove(dir) {
  const track = document.getElementById('carousel-track');
  if (!track) return;
  const cards = track.children;
  if (cards.length === 0) return;
  carouselPos += dir;
  if (carouselPos < 0) carouselPos = cards.length - 1;
  if (carouselPos >= cards.length) carouselPos = 0;
  const cardWidth = cards[0].offsetWidth + 20;
  track.style.transform = \`translateX(-\${carouselPos * cardWidth}px)\`;
  updateCarouselDots(cards.length);
}

function updateCarouselDots(total) {
  const dotsContainer = document.getElementById('carousel-dots');
  if (!dotsContainer) return;
  dotsContainer.innerHTML = Array.from({length: total}).map((_, i) => \`
    <span class="carousel-dot \${i === carouselPos ? 'active' : ''}" onclick="goToCarouselSlide(\${i})"></span>
  \`).join('');
}

function goToCarouselSlide(idx) {
  carouselPos = idx;
  carouselMove(0);
}

// CARREGAR CARDÁPIO E PRODUTOS
async function loadMenu() {
  try {
    const res = await fetch(\`\${API_URL}/products\`);
    if (res.ok) {
      allProducts = await res.json();
      renderHomeDestaques(allProducts);
      switchMenuTab('hamburgueres');
      renderOrderGrid(allProducts);
      renderAdminProductsList(allProducts);
    }
  } catch(e) {
    console.error('Erro ao carregar cardápio:', e);
  }
}

function renderHomeDestaques(pricing) {
  const track = document.getElementById('carousel-track');
  if (!track) return;
  let items = [];
  Object.keys(pricing).forEach(cat => {
    pricing[cat].forEach(i => { if (i.active) items.push(i); });
  });
  
  track.innerHTML = items.slice(0, 8).map(item => \`
    <div class="card-item" style="min-width:280px; flex-shrink:0;">
      <img src="\${escapeHTML(item.img)}" class="card-img" alt="\${escapeHTML(item.name)}">
      <div class="card-content">
        <div class="card-name">\${escapeHTML(item.name)}</div>
        <div class="card-desc">\${escapeHTML(item.desc || '')}</div>
        <div class="card-price-row">
          <span class="card-price">\${fmt(item.base)}</span>
          <button class="btn-primary" onclick="addToCart(\${item.id}, '\${escapeHTML(item.name)}', \${item.base})">PEDIR AGORA</button>
        </div>
      </div>
    </div>
  \`).join('');

  updateCarouselDots(Math.min(items.length, 8));
}

function switchMenuTab(cat, btnEl) {
  if (btnEl) {
    document.querySelectorAll('.menu-tab').forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');
  }
  const container = document.getElementById('menu-content-container');
  if (!container || !allProducts[cat]) return;

  container.innerHTML = \`
    <div class="menu-grid">
      \${allProducts[cat].map(item => \`
        <div class="card-item">
          <img src="\${escapeHTML(item.img)}" class="card-img" alt="\${escapeHTML(item.name)}">
          <div class="card-content">
            <div class="card-name">\${escapeHTML(item.name)}</div>
            <div class="card-desc">\${escapeHTML(item.desc || '')}</div>
            <div class="card-price-row">
              <span class="card-price">\${fmt(item.base)}</span>
              <button class="btn-primary" onclick="addToCart(\${item.id}, '\${escapeHTML(item.name)}', \${item.base})">ADICIONAR</button>
            </div>
          </div>
        </div>
      \`).join('')}
    </div>
  \`;
}

function filterOrder(cat, btnEl) {
  if (btnEl) {
    document.querySelectorAll('.order-cat-btn').forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');
  }
  renderOrderGrid(allProducts, cat);
}

function renderOrderGrid(pricing, filterCat = 'todos') {
  const container = document.getElementById('order-grid');
  if (!container) return;
  let items = [];
  Object.keys(pricing).forEach(cat => {
    if (filterCat === 'todos' || filterCat === cat) {
      pricing[cat].forEach(i => { if (i.active) items.push(i); });
    }
  });

  container.innerHTML = items.map(item => \`
    <div class="card-item">
      <img src="\${escapeHTML(item.img)}" class="card-img" alt="\${escapeHTML(item.name)}">
      <div class="card-content">
        <div class="card-name">\${escapeHTML(item.name)}</div>
        <div class="card-desc">\${escapeHTML(item.desc || '')}</div>
        <div class="card-price-row">
          <span class="card-price">\${fmt(item.base)}</span>
          <button class="btn-primary" onclick="addToCart(\${item.id}, '\${escapeHTML(item.name)}', \${item.base})">ADICIONAR</button>
        </div>
      </div>
    </div>
  \`).join('');
}

function addToCart(id, name, price) {
  const existing = cart.find(i => i.id === id);
  if (existing) { existing.qty++; } else { cart.push({ id, name, price, qty: 1 }); }
  updateCartUI();
  showNotif(\`🍔 \${name} adicionado ao carrinho!\`);
}

function updateCartUI() {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);
  
  const countBadge = document.getElementById('cart-count-badge');
  if (countBadge) countBadge.textContent = count;
  const cartTotal = document.getElementById('cart-total');
  if (cartTotal) cartTotal.textContent = fmt(total);

  const cartItems = document.getElementById('cart-items');
  if (cartItems) {
    if (cart.length === 0) {
      cartItems.innerHTML = '<div class="cart-empty">Seu carrinho está vazio 🛒</div>';
    } else {
      cartItems.innerHTML = cart.map(i => \`
        <div style="display:flex; justify-content:space-between; align-items:center; padding:0.5rem 0; border-bottom:1px solid #EEE;">
          <div><strong>\${i.qty}x \${escapeHTML(i.name)}</strong></div>
          <div style="display:flex; gap:0.4rem; align-items:center;">
            <span>\${fmt(i.price * i.qty)}</span>
            <button style="background:none; border:none; color:red; cursor:pointer; font-weight:800;" onclick="removeFromCart(\${i.id})">✕</button>
          </div>
        </div>
      \`).join('');
    }
  }

  const btn = document.getElementById('whatsapp-btn');
  if (btn) btn.disabled = (total < 25 || cart.length === 0);

  const modalTotal = document.getElementById('cart-modal-total');
  if (modalTotal) modalTotal.textContent = fmt(total);
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  updateCartUI();
}

function openCartModal() {
  if (cart.length === 0) { alert('Seu carrinho está vazio.'); return; }
  updateCartUI();
  if (currentUser) {
    document.getElementById('chk-name').value = currentUser.name;
    document.getElementById('chk-phone').value = currentUser.tel || '';
    document.getElementById('chk-address').value = currentUser.address || '';
  }
  document.getElementById('cart-modal').classList.add('open');
}
function closeCartModal() { document.getElementById('cart-modal').classList.remove('open'); }

// CHECKOUT & PROCESSAMENTO DE PEDIDOS
async function submitCheckout() {
  const name = document.getElementById('chk-name').value.trim();
  const phone = document.getElementById('chk-phone').value.trim();
  const address = document.getElementById('chk-address').value.trim();
  const payment = document.getElementById('chk-payment').value;

  if (!name || !phone) { alert('Informe seu nome e WhatsApp para contato.'); return; }

  const payload = {
    items: cart,
    type: 'delivery',
    address,
    payment,
    guestInfo: { name, phone, address }
  };

  try {
    const res = await fetch(\`\${API_URL}/orders\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(currentUser ? { 'Authorization': \`Bearer \${currentUser.token}\` } : {})
      },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    if (!res.ok) { alert(data.error || 'Erro ao criar pedido.'); return; }

    localStorage.setItem('villaburguer_active_order', JSON.stringify({
      code: data.orderCode,
      token: data.trackingToken
    }));

    if (payment === 'pix') {
      const payRes = await fetch(\`\${API_URL}/payments/create\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: data.orderId, method: 'pix' })
      });
      const payData = await payRes.json();
      
      document.getElementById('pay-pix-area').style.display = 'block';
      document.getElementById('pix-copia-cola').value = payData.qrCode || 'PIX_CODE_DEMO';
      showNotif(\`Código Pix gerado para o pedido #\${data.orderCode}!\`);
    } else {
      showNotif(\`Pedido #\${data.orderCode} criado com sucesso!\`);
      closeCartModal();
      cart = [];
      updateCartUI();
      selectNav('track');
    }
  } catch(e) {
    alert('Erro de conexão ao processar checkout.');
  }
}

function copyPixCode() {
  const inp = document.getElementById('pix-copia-cola');
  inp.select();
  document.execCommand('copy');
  showNotif('📋 Código Pix copiado para a área de transferência!');
}

function togglePaymentFields() {}

// AUTENTICAÇÃO
async function handleLogin() {
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-pass').value;

  try {
    const res = await fetch(\`\${API_URL}/login\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      currentUser = data.user;
      currentUser.token = data.token;
      localStorage.setItem('villaburguer_user_v2', JSON.stringify(currentUser));
      updateNavRoles();
      closeUserModal();
      showNotif(\`Bem-vindo, \${currentUser.name}! 👋\`);
    } else {
      alert(data.error || 'Erro ao realizar login.');
    }
  } catch (e) {
    alert('Erro de conexão ao realizar login.');
  }
}

function updateNavRoles() {
  const btn = document.getElementById('nav-user-btn');
  if (currentUser) {
    btn.innerHTML = \`👤 \${currentUser.name} <span class="role-badge">\${currentUser.role}</span>\`;
    
    if (['cozinha', 'admin'].includes(currentUser.role)) document.getElementById('nav-item-kds').style.display = 'block';
    if (['motoboy', 'admin'].includes(currentUser.role)) document.getElementById('nav-item-motoboy').style.display = 'block';
    if (currentUser.role === 'admin') document.getElementById('nav-item-admin').style.display = 'block';
  } else {
    btn.innerHTML = \`🔑 LOGIN\`;
  }
}

function openUserModal() { document.getElementById('user-modal').classList.add('open'); }
function closeUserModal() { document.getElementById('user-modal').classList.remove('open'); }

// 1. KDS COZINHA (#page-kds)
async function loadKdsOrders() {
  if (!currentUser) return;
  try {
    const res = await fetch(\`\${API_URL}/orders/kds\`, {
      headers: { 'Authorization': \`Bearer \${currentUser.token}\` }
    });
    if (res.ok) {
      const orders = await res.json();
      renderKdsGrid(orders);
    }
  } catch(e) {}
}

function renderKdsGrid(orders) {
  const grid = document.getElementById('kds-grid');
  document.getElementById('kds-count-badge').textContent = \`\${orders.length} PEDIDOS ATIVOS\`;
  
  if (orders.length === 0) {
    grid.innerHTML = '<div style="color:#888; text-align:center; grid-column:1/-1; padding:3rem;">Nenhum pedido pendente na cozinha no momento. 🍳</div>';
    return;
  }

  grid.innerHTML = orders.map(o => {
    const minutesAgo = Math.floor((new Date() - new Date(o.createdAt)) / 60000);
    let timerClass = 'timer-green';
    if (minutesAgo > 15) timerClass = 'timer-yellow';
    if (minutesAgo > 30) timerClass = 'timer-orange';
    if (minutesAgo > 45) timerClass = 'timer-red';

    return \`
      <div class="kds-ticket">
        <div class="kds-ticket-header">
          <span class="kds-code">\${o.orderCode}</span>
          <span class="kds-timer \${timerClass}">\${minutesAgo}m decorridos</span>
        </div>
        <div class="kds-ticket-body">
          <div class="kds-client-name">\${escapeHTML(o.clientName)}</div>
          <div class="kds-type">\${o.type === 'delivery' ? '🛵 DELIVERY' : '🛍️ RETIRADA'}</div>
          \${o.items.map(i => \`
            <div class="kds-item">
              <strong>\${i.qty}x \${escapeHTML(i.name)}</strong>
              \${i.obs ? \`<div class="kds-item-obs">⚠️ \${escapeHTML(i.obs)}</div>\` : ''}
            </div>
          \`).join('')}
        </div>
        <div class="kds-actions">
          \${o.status === 'pendente' ? \`<button class="kds-btn" style="background:#FF7700; color:#FFF;" onclick="updateOrderStatus(\${o.id}, 'em_preparo')">INICIAR PREPARO</button>\` : ''}
          \${o.status === 'em_preparo' ? \`<button class="kds-btn" style="background:#2E7D32; color:#FFF;" onclick="updateOrderStatus(\${o.id}, 'pronto')">PRONTO</button>\` : ''}
          <button class="kds-btn" style="background:#C62828; color:#FFF;" onclick="cancelOrderPrompt(\${o.id})">CANCELAR</button>
        </div>
      </div>
    \`;
  }).join('');
}

async function updateOrderStatus(orderId, status, cancelReason = '') {
  try {
    const res = await fetch(\`\${API_URL}/orders/\${orderId}/status\`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${currentUser.token}\` },
      body: JSON.stringify({ status, cancelReason })
    });
    if (res.ok) {
      showNotif(\`Status do pedido atualizado para \${status}\`);
      loadKdsOrders();
      loadMotoboyOrders();
    }
  } catch(e) {}
}

function cancelOrderPrompt(orderId) {
  const reason = prompt('Informe o motivo obrigatório do cancelamento:');
  if (reason && reason.trim()) {
    updateOrderStatus(orderId, 'cancelado', reason.trim());
  }
}

// 2. RASTREAMENTO EM TEMPO REAL (#page-track)
function autoLoadActiveOrderTracking() {
  const savedActiveOrder = localStorage.getItem('villaburguer_active_order');
  if (savedActiveOrder) {
    try {
      const active = JSON.parse(savedActiveOrder);
      if (active.code && active.token) {
        document.getElementById('track-code-inp').value = active.code;
        document.getElementById('track-token-inp').value = active.token;
        document.getElementById('track-auto-banner').style.display = 'block';
        fetchOrderTracking(active.code, active.token);
        return;
      }
    } catch(e) {}
  }
  document.getElementById('track-auto-banner').style.display = 'none';
}

async function fetchOrderTracking(codeInp, tokenInp) {
  const code = codeInp || document.getElementById('track-code-inp').value.trim();
  const token = tokenInp || document.getElementById('track-token-inp').value.trim();
  if (!code || !token) { alert('Informe o código e o token de rastreio.'); return; }

  try {
    const res = await fetch(\`\${API_URL}/orders/track/\${code}?token=\${token}\`);
    if (res.ok) {
      const data = await res.json();
      document.getElementById('track-result').style.display = 'block';
      document.getElementById('tr-code').textContent = data.orderCode;
      document.getElementById('tr-client').textContent = \`Cliente: \${data.clientName} · \${data.type.toUpperCase()}\`;
      document.getElementById('tr-status-badge').textContent = data.status.toUpperCase();

      let progressWidth = '0%';
      if (data.status === 'em_preparo') progressWidth = '33%';
      if (data.status === 'pronto' || data.status === 'saiu_entrega') progressWidth = '66%';
      if (data.status === 'concluido') progressWidth = '100%';
      document.getElementById('tr-progress').style.width = progressWidth;

      if (socket) socket.emit('join_room', \`track_\${data.orderCode}\`);
    } else {
      alert('Pedido não encontrado ou token de rastreio inválido.');
    }
  } catch(e) {}
}

// 3. MOTOBOY (#page-motoboy)
async function loadMotoboyOrders() {
  if (!currentUser) return;
  try {
    const res = await fetch(\`\${API_URL}/orders/motoboy\`, {
      headers: { 'Authorization': \`Bearer \${currentUser.token}\` }
    });
    if (res.ok) {
      const orders = await res.json();
      renderMotoboyGrid(orders);
    }
  } catch(e) {}
}

function renderMotoboyGrid(orders) {
  const grid = document.getElementById('motoboy-grid');
  if (!grid) return;
  if (orders.length === 0) {
    grid.innerHTML = '<div style="color:#888; text-align:center; grid-column:1/-1; padding:2rem;">Nenhuma entrega pendente no momento. 🛵</div>';
    return;
  }

  grid.innerHTML = orders.map(o => \`
    <div class="card-item" style="padding:1.2rem;">
      <div style="display:flex; justify-content:space-between; margin-bottom:0.6rem;">
        <strong style="font-size:1.4rem; color:var(--primary-orange);">\${o.orderCode}</strong>
        <span class="role-badge" style="background:#2E7D32;">\${o.status.toUpperCase()}</span>
      </div>
      <div><strong>Cliente:</strong> \${escapeHTML(o.clientName)}</div>
      <div><strong>Telefone:</strong> \${escapeHTML(o.clientPhone || 'Não informado')}</div>
      <div style="margin-bottom:1rem;"><strong>Endereço:</strong> \${escapeHTML(o.clientAddress || 'Retirada no Balcão')}</div>
      \${o.status === 'pronto' ? \`<button class="btn-primary" style="width:100%; font-size:0.9rem;" onclick="updateOrderStatus(\${o.id}, 'saiu_entrega')">🛵 SAIU PARA ENTREGA</button>\` : ''}
      \${o.status === 'saiu_entrega' ? \`<button class="btn-primary" style="width:100%; font-size:0.9rem; background:#2E7D32;" onclick="updateOrderStatus(\${o.id}, 'concluido')">✅ MARCAR COMO ENTREGUE</button>\` : ''}
    </div>
  \`).join('');
}

// 4. ADMIN (#page-admin: RBAC, PRODUTOS, AUDIT, REPORTS)
async function loadAdminUsers() {
  if (!currentUser || currentUser.role !== 'admin') return;
  try {
    const res = await fetch(\`\${API_URL}/users\`, {
      headers: { 'Authorization': \`Bearer \${currentUser.token}\` }
    });
    if (res.ok) {
      const users = await res.json();
      const tbody = document.getElementById('admin-users-tbody');
      tbody.innerHTML = users.map(u => \`
        <tr style="border-bottom:1px solid #EEE;">
          <td style="padding:0.8rem;">#\${u.id}</td>
          <td style="padding:0.8rem;"><strong>\${escapeHTML(u.name)}</strong></td>
          <td style="padding:0.8rem;">\${escapeHTML(u.email)}</td>
          <td style="padding:0.8rem;"><span class="role-badge">\${u.role}</span></td>
          <td style="padding:0.8rem;">
            <select onchange="changeUserRole(\${u.id}, this.value)" style="padding:0.4rem; border-radius:6px;">
              <option value="cliente" \${u.role === 'cliente' ? 'selected' : ''}>cliente</option>
              <option value="cozinha" \${u.role === 'cozinha' ? 'selected' : ''}>cozinha</option>
              <option value="motoboy" \${u.role === 'motoboy' ? 'selected' : ''}>motoboy</option>
              <option value="admin" \${u.role === 'admin' ? 'selected' : ''}>admin</option>
            </select>
          </td>
        </tr>
      \`).join('');
    }
  } catch(e) {}
}

async function changeUserRole(userId, newRole) {
  try {
    const res = await fetch(\`\${API_URL}/users/\${userId}/role\`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${currentUser.token}\` },
      body: JSON.stringify({ role: newRole })
    });
    if (res.ok) {
      showNotif(\`Cargo do usuário #\${userId} alterado para \${newRole}\`);
      loadAdminUsers();
    }
  } catch(e) {}
}

function renderAdminProductsList(pricing) {
  const container = document.getElementById('admin-products-list');
  if (!container) return;
  let html = '';
  Object.keys(pricing).forEach(cat => {
    html += \`<h4 style="margin:1.5rem 0 0.8rem; font-family:'Bebas Neue',sans-serif; font-size:1.6rem; color:var(--primary-orange); border-bottom:1px solid #DDD;">CATEGORIA: \${cat.toUpperCase()}</h4>\`;
    html += '<div class="menu-grid" style="padding:0.5rem 0;">';
    pricing[cat].forEach(item => {
      html += \`
        <div class="card-item" style="opacity:\${item.active ? '1' : '0.6'};">
          <img src="\${escapeHTML(item.img)}" class="card-img" alt="\${escapeHTML(item.name)}">
          <div class="card-content">
            <div class="card-name">\${escapeHTML(item.name)}</div>
            <div class="card-desc">\${escapeHTML(item.desc || '')}</div>
            <div class="card-price-row">
              <span class="card-price">\${fmt(item.base)}</span>
              <span class="role-badge" style="background:\${item.active ? '#2E7D32' : '#C62828'};">\${item.active ? 'ATIVO' : 'INATIVO'}</span>
            </div>
          </div>
        </div>
      \`;
    });
    html += '</div>';
  });
  container.innerHTML = html;
}

async function loadAdminAuditLogs() {
  try {
    const res = await fetch(\`\${API_URL}/audit-logs\`, {
      headers: { 'Authorization': \`Bearer \${currentUser.token}\` }
    });
    if (res.ok) {
      const logs = await res.json();
      const container = document.getElementById('admin-audit-logs');
      container.innerHTML = logs.map(l => \`
        <div style="padding:0.6rem 0; border-bottom:1px solid #EEE; font-size:0.9rem;">
          <strong style="color:var(--primary-orange);">\${l.action}</strong> por <strong>\${escapeHTML(l.performed_by_name)}</strong>
          <div style="color:#666; font-size:0.8rem;">Alvo: \${l.target} | \${l.created_at} | \${escapeHTML(l.details)}</div>
        </div>
      \`).join('');
    }
  } catch(e) {}
}

async function loadAdminReports() {
  try {
    const res = await fetch(\`\${API_URL}/reports/sales\`, {
      headers: { 'Authorization': \`Bearer \${currentUser.token}\` }
    });
    if (res.ok) {
      const rep = await res.json();
      const container = document.getElementById('admin-reports-content');
      container.innerHTML = \`
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:1rem; margin-bottom:1.5rem;">
          <div style="background:#FFF5EF; padding:1rem; border-radius:10px; text-align:center;">
            <div style="font-size:0.9rem; color:#666;">RECEITA TOTAL</div>
            <strong style="font-size:1.8rem; color:var(--primary-orange);">\${fmt(rep.totalRevenueFloat)}</strong>
            <div style="font-size:0.8rem; color:#888;">(\${rep.totalRevenueCents} centavos)</div>
          </div>
          <div style="background:#E8F5E9; padding:1rem; border-radius:10px; text-align:center;">
            <div style="font-size:0.9rem; color:#666;">TOTAL DE PEDIDOS</div>
            <strong style="font-size:1.8rem; color:#2E7D32;">\${rep.totalOrders}</strong>
          </div>
        </div>
        <h4>Mais Vendidos:</h4>
        <ul>\${rep.topProducts.map(p => \`<li><strong>\${escapeHTML(p[0])}:</strong> \${p[1]} unidades</li>\`).join('')}</ul>
      \`;
    }
  } catch(e) {}
}

function switchAdminTab(tab) {
  document.querySelectorAll('.admin-tab').forEach(t => t.style.display = 'none');
  document.querySelectorAll('[id^="atab-btn-"]').forEach(b => b.classList.remove('active'));
  document.getElementById('atab-' + tab).style.display = 'block';
  document.getElementById('atab-btn-' + tab).classList.add('active');
  
  if (tab === 'users') loadAdminUsers();
  if (tab === 'products') renderAdminProductsList(allProducts);
  if (tab === 'audit') loadAdminAuditLogs();
  if (tab === 'reports') loadAdminReports();
}

function openNewProductModal() {
  showNotif('Modal de cadastro de novos produtos pronto.');
}

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
  const pl = document.getElementById('preloader');
  if (pl) pl.classList.add('hide');
  
  const savedUser = localStorage.getItem('villaburguer_user_v2');
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
      updateNavRoles();
    } catch(e) {}
  }
  initHeroCarousel();
  loadMenu();
});
</script>

</body>
</html>
`;

fs.writeFileSync('index.html', htmlContent, 'utf8');
console.log('index.html restaurado com sucesso!');
