<!-- ==================== JAVASCRIPT ENGINE ==================== -->
<script>
const API_URL = (window.location.port === '4000') ? '/api' : 'http://localhost:4000/api';

const DEFAULT_PRICING = {
  hamburgueres: [
    { id: 1, cat: 'hamburgueres', name: 'Classic Burguer', desc: 'P├úo brioche, hamb├║rguer artesanal 150gr, alface, tomate, maionese, cebola roxa e cheddar', base: 32.90, comboAdd: 15.00, img: 'imgs/img1.png', tag: '­ƒöÑ MAIS PEDIDO', featured: true, active: true },
    { id: 2, cat: 'hamburgueres', name: 'Egg Burguer', desc: 'P├úo brioche, hamb├║rguer artesanal 150gr, ovo, alface, tomate, maionese, cebola roxa e cheddar', base: 33.90, comboAdd: 15.00, img: 'imgs/img2.png', tag: 'Ô¡É DESTAQUE', featured: true, active: true },
    { id: 3, cat: 'hamburgueres', name: 'Bacon Burguer', desc: 'P├úo brioche, hamb├║rguer artesanal 150gr, tiras de bacon crocante, alface, tomate, maionese, cebola roxa e cheddar', base: 37.90, comboAdd: 15.00, img: 'imgs/img3.png', tag: '­ƒÑô IRRESIST├ìVEL', featured: true, active: true },
    { id: 4, cat: 'hamburgueres', name: 'Kids Burguer', desc: 'P├úo brioche, hamb├║rguer artesanal 150gr, maionese e cheddar especial', base: 27.90, comboAdd: 15.00, img: 'imgs/img6.png', tag: '­ƒæÂ KIDS', featured: false, active: true },
    { id: 5, cat: 'hamburgueres', name: 'Piscina de Cheddar', desc: 'P├úo brioche, hamb├║rguer artesanal 150gr, cheddar, bacon em cubos mergulhados em uma piscina de cheddar', base: 39.90, comboAdd: 15.00, img: 'imgs/img5.png', tag: '­ƒºÇ SUPER CHEDDAR', featured: true, active: true },
    { id: 6, cat: 'hamburgueres', name: 'Coalho Burguer', desc: 'P├úo brioche, hamb├║rguer 150g, tiras de bacon, cheddar, r├║cula, tomate, maionese, cebola roxa, queijo coalho grelhado, geleia de abacaxi com pimenta', base: 42.90, comboAdd: 15.00, img: 'imgs/img7.png', tag: '­ƒææ CHEF CHOICE', featured: false, active: true },
    { id: 7, cat: 'hamburgueres', name: 'Ribs Burguer', desc: 'P├úo brioche, hamb├║rguer artesanal 150gr, cheddar, alface, tomate, maionese, cebola roxa, costela desfiada e catupiry', base: 42.90, comboAdd: 15.00, img: 'imgs/img8.png', tag: '­ƒÑ® COSTELA GOURMET', featured: true, active: true },
    { id: 8, cat: 'hamburgueres', name: 'Mega Duplo Burguer', desc: 'P├úo brioche, 2 hamb├║rgueres artesanais 150gr, tiras de bacon, cheddar, r├║cula, tomate, maionese, cebola roxa, onion rings, geleia de abacaxi com pimenta', base: 47.90, comboAdd: 15.00, img: 'imgs/img2.png', tag: '­ƒææ MONSTRO', featured: true, active: true }
  ],
  combos2x: [
    { id: 9, cat: 'combos2x', name: '2x Classic Burguer Combo', desc: '2 combos completos Classic Burguer (Batata + Bebida)', base: 79.90, comboAdd: null, img: 'imgs/img1.png', tag: '­ƒöÑ OFERTA DUPLA', featured: false, active: true },
    { id: 10, cat: 'combos2x', name: '2x Egg Burguer Combo', desc: '2 combos completos Egg Burguer', base: 88.90, comboAdd: null, img: 'imgs/img2.png', tag: '­ƒææ SUPER COMBO', featured: false, active: true },
    { id: 11, cat: 'combos2x', name: '2x Bacon Burguer Combo', desc: '2 combos completos Bacon Burguer', base: 90.00, comboAdd: null, img: 'imgs/img3.png', tag: '­ƒÑô DUPLO BACON', featured: false, active: true },
    { id: 12, cat: 'combos2x', name: '2x Piscina de Cheddar Combo', desc: '2 combos completos Piscina de Cheddar', base: 94.90, comboAdd: null, img: 'imgs/img5.png', tag: '­ƒºÇ FESTA DO CHEDDAR', featured: false, active: true },
    { id: 13, cat: 'combos2x', name: '2x Ribs Burguer Combo', desc: '2 combos completos Ribs Burguer', base: 100.00, comboAdd: null, img: 'imgs/img8.png', tag: '­ƒÑ® DUPLA COSTELA', featured: false, active: true },
    { id: 14, cat: 'combos2x', name: '2x Coalho Burguer Combo', desc: '2 combos completos Coalho Burguer', base: 100.00, comboAdd: null, img: 'imgs/img7.png', tag: '­ƒöÑ DUPLO COALHO', featured: false, active: true },
    { id: 15, cat: 'combos2x', name: '2x Mega Duplo Burguer Combo', desc: '2 combos completos Mega Duplo Burguer', base: 110.00, comboAdd: null, img: 'imgs/img2.png', tag: '­ƒææ MONSTRO DUPLO', featured: false, active: true }
  ],
  porcoes: [
    { id: 16, cat: 'porcoes', name: 'Batata 400gr', desc: 'Batata frita crocante e douradinha', base: 26.00, comboAdd: null, img: 'imgs/img4.png', tag: '­ƒìƒ CROCANTE', featured: false, active: true },
    { id: 17, cat: 'porcoes', name: 'Batata + Cheddar + Bacon 400gr', desc: '400gr coberta com cheddar especial e bacon em cubos', base: 34.00, comboAdd: null, img: 'imgs/img5.png', tag: '­ƒºÇ IRRESIST├ìVEL', featured: false, active: true },
    { id: 18, cat: 'porcoes', name: 'Batata + Catupiry + Costela 400gr', desc: '400gr gourmet coberta com costela desfiada e Catupiry', base: 43.00, comboAdd: null, img: 'imgs/img8.png', tag: '­ƒÑ® GOURMET', featured: false, active: true }
  ],
  bebidas: [
    { id: 19, cat: 'bebidas', name: 'Refri Lata 350ml', desc: 'Gelada e refrescante', base: 7.00, comboAdd: null, img: 'imgs/img4.png', tag: null, featured: false, active: true },
    { id: 20, cat: 'bebidas', name: 'Coca Cola 600ml', desc: 'A cl├íssica geladinha em garrafa 600ml', base: 10.00, comboAdd: null, img: 'imgs/img4.png', tag: null, featured: false, active: true },
    { id: 21, cat: 'bebidas', name: '├ügua s/ G├ís', desc: '500ml bem gelada', base: 4.00, comboAdd: null, img: 'imgs/img4.png', tag: null, featured: false, active: true },
    { id: 22, cat: 'bebidas', name: '├ügua c/ G├ís', desc: '500ml bem gelada', base: 4.00, comboAdd: null, img: 'imgs/img4.png', tag: null, featured: false, active: true },
    { id: 23, cat: 'bebidas', name: 'H2OH! Limoneto', desc: 'Refrescante e leve sabor lim├úo', base: 8.00, comboAdd: null, img: 'imgs/img4.png', tag: null, featured: false, active: true }
  ],
  sobremesa: [
    { id: 24, cat: 'sobremesa', name: 'Pudimzinho Artesanal', desc: 'Doce tradicional cremoso e delicioso', base: 9.00, comboAdd: null, img: 'imgs/img6.png', tag: '­ƒì« SOBREMESA', featured: false, active: true }
  ],
  adicional: [
    { id: 25, cat: 'adicional', name: 'Adicional: Maionese de Alho', desc: 'Receita caseira cremosa', base: 3.00, comboAdd: null, img: 'imgs/img1.png', tag: null, featured: false, active: true },
    { id: 26, cat: 'adicional', name: 'Adicional: Barbecue', desc: 'Molho defumado gourmet', base: 4.00, comboAdd: null, img: 'imgs/img3.png', tag: null, featured: false, active: true },
    { id: 27, cat: 'adicional', name: 'Adicional: Onion Rings (2un)', desc: 'An├®is de cebola crocantes', base: 6.00, comboAdd: null, img: 'imgs/img1.png', tag: null, featured: false, active: true },
    { id: 28, cat: 'adicional', name: 'Adicional: Bacon (2un)', desc: 'Fatias crocantes de bacon', base: 7.00, comboAdd: null, img: 'imgs/img3.png', tag: null, featured: false, active: true },
    { id: 29, cat: 'adicional', name: 'Adicional: Coalho (1un)', desc: 'Queijo coalho grelhado no ma├ºarico', base: 9.00, comboAdd: null, img: 'imgs/img7.png', tag: null, featured: false, active: true },
    { id: 30, cat: 'adicional', name: 'Adicional: Costela', desc: 'Costela desfiada temperada', base: 9.00, comboAdd: null, img: 'imgs/img8.png', tag: null, featured: false, active: true },
    { id: 31, cat: 'adicional', name: 'Adicional: Hamb├║rguer extra', desc: 'Blend bovino 150g adicional', base: 12.00, comboAdd: null, img: 'imgs/img1.png', tag: null, featured: false, active: true },
    { id: 32, cat: 'adicional', name: 'Adicional: Batata 150gr', desc: 'Por├º├úo individual extra', base: 9.00, comboAdd: null, img: 'imgs/img4.png', tag: null, featured: false, active: true },
    { id: 33, cat: 'adicional', name: 'Adicional: Cheddar (2 fatias)', desc: 'Cheddar derretido especial', base: 8.00, comboAdd: null, img: 'imgs/img5.png', tag: null, featured: false, active: true },
    { id: 34, cat: 'adicional', name: 'Adicional: Catupiry/Molho Cheddar', desc: 'Por├º├úo extra cremosa', base: 6.00, comboAdd: null, img: 'imgs/img5.png', tag: null, featured: false, active: true }
  ]
};

let VILLA_BURG_PRICING = DEFAULT_PRICING;
let storeStatusOverride = 'auto';
let storeWhatsAppPhone = '5519981242106';
let currentUser = null;

function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 1200 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function loadStoredPricing() {
  try {
    const res = await fetchWithTimeout(`${API_URL}/products`, { timeout: 1200 });
    if (res.ok) {
      VILLA_BURG_PRICING = await res.json();
    } else {
      VILLA_BURG_PRICING = DEFAULT_PRICING;
    }
  } catch(e) {
    VILLA_BURG_PRICING = DEFAULT_PRICING;
  }
  
  await loadStoreSettings();

  try {
    const override = localStorage.getItem('villaburguer_store_override_v1');
    if (override) storeStatusOverride = override;

    const curr = localStorage.getItem('villaburguer_current_user_v1');
    if (curr) {
      const parsedUser = JSON.parse(curr);
      if (!parsedUser.token) {
        localStorage.removeItem('villaburguer_current_user_v1');
        currentUser = null;
      } else {
        currentUser = parsedUser;
        updateUserNavUI();
      }
    }
  } catch(e) {}
}

async function loadStoreSettings() {
  const savedWpp = localStorage.getItem('villaburguer_wpp_phone_v1');
  if (savedWpp && savedWpp.endsWith('2106')) {
    storeWhatsAppPhone = savedWpp;
  } else {
    storeWhatsAppPhone = '5519981242106';
    localStorage.setItem('villaburguer_wpp_phone_v1', '5519981242106');
  }

  const wppInp = document.getElementById('admin-wpp-phone');
  if (wppInp) wppInp.value = storeWhatsAppPhone;
  const wppLink = document.getElementById('wpp-float-link');
  if (wppLink) wppLink.href = `https://wa.me/${storeWhatsAppPhone}`;

  try {
    const res = await fetchWithTimeout(`${API_URL}/settings`, { timeout: 1200 });
    if (res.ok) {
      const data = await res.json();
      if (data.whatsapp_phone) {
        storeWhatsAppPhone = data.whatsapp_phone;
        localStorage.setItem('villaburguer_wpp_phone_v1', storeWhatsAppPhone);
        if (wppInp) wppInp.value = storeWhatsAppPhone;
        if (wppLink) wppLink.href = `https://wa.me/${storeWhatsAppPhone}`;
      }
    }
  } catch (e) {}
}

async function saveStoreSettingsFromAdmin() {
  if (!currentUser || !currentUser.isAdmin) return;
  const inp = document.getElementById('admin-wpp-phone');
  if (!inp) return;
  const phone = inp.value.trim().replace(/\D/g, '');
  if (!phone) { alert('Informe um n├║mero de WhatsApp v├ílido (apenas n├║meros com DDD).'); return; }

  storeWhatsAppPhone = phone;
  localStorage.setItem('villaburguer_wpp_phone_v1', phone);
  
  const wppLink = document.getElementById('wpp-float-link');
  if (wppLink) wppLink.href = `https://wa.me/${storeWhatsAppPhone}`;

  try {
    await fetch(`${API_URL}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.token}` },
      body: JSON.stringify({ whatsapp_phone: phone })
    });
  } catch (e) {}

  showNotif('N├║mero do WhatsApp da loja atualizado com sucesso! ­ƒô▒');
}

function saveStoredPricing() {
  localStorage.setItem('villaburguer_store_override_v1', storeStatusOverride);
}

function getAllItems() {
  let all = [];
  Object.keys(VILLA_BURG_PRICING).forEach(key => {
    all = all.concat(VILLA_BURG_PRICING[key].filter(i => i.active !== false));
  });
  return all;
}

let cart = [];
let selectedCombo = {};

function fmt(val) {
  return 'R$ ' + parseFloat(val).toFixed(2).replace('.', ',');
}

// ---- NAVEGA├ç├âO SPA ----
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pg = document.getElementById('page-' + id);
  if (pg) pg.classList.add('active');
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  const navEl = document.getElementById('nav-' + id);
  if (navEl) navEl.classList.add('active');
  window.scrollTo(0, 0);
  if (id === 'pedido') renderOrderGrid('todos');
  if (id === 'cardapio') renderMenuPage();
  if (id === 'admin') {
    if (!currentUser || !currentUser.isAdmin) {
      showPage('home');
      openUserModal();
      showNotif('­ƒöÆ Acesso exclusivo ao Administrador. Fa├ºa login para acessar.');
      return;
    }
    renderAdminDashboard();
  }
  initObserver();
}

function getAllItemsForAdmin() {
  let all = [];
  if (VILLA_BURG_PRICING && typeof VILLA_BURG_PRICING === 'object') {
    Object.keys(VILLA_BURG_PRICING).forEach(key => {
      if (Array.isArray(VILLA_BURG_PRICING[key])) {
        all = all.concat(VILLA_BURG_PRICING[key]);
      }
    });
  }
  return all;
}

function selectNav(id) {
  showPage(id);
  closeMenuMobile();
}

function closeMenuMobile() {
  const menu = document.getElementById('nav-menu');
  if (menu) menu.classList.remove('open');
}

// ---- SISTEMA DE LOGIN UNIFICADO ----
function openUserModal() {
  document.getElementById('user-modal').classList.add('open');
  if (currentUser) {
    document.getElementById('user-unlogged-view').style.display = 'none';
    
    if (currentUser.isAdmin) {
      closeUserModal();
      showPage('admin');
      renderAdminDashboard();
    } else {
      document.getElementById('user-logged-view').style.display = 'block';
      document.getElementById('logged-user-name').textContent = 'Ol├í, ' + currentUser.name + '!';
      document.getElementById('logged-user-email').textContent = currentUser.email;
      document.getElementById('logged-user-tel').textContent = currentUser.tel || 'N├úo informado';
      document.getElementById('logged-user-end').textContent = currentUser.address || 'N├úo informado';
      loadUserOrders();
    }
  } else {
    document.getElementById('user-unlogged-view').style.display = 'block';
    document.getElementById('user-logged-view').style.display = 'none';
    switchAuthTab('login');
  }
}

function closeUserModal() {
  document.getElementById('user-modal').classList.remove('open');
}

function closeUserModalOutside(e) {
  if (e.target === document.getElementById('user-modal')) closeUserModal();
}

function switchAuthTab(tab) {
  document.getElementById('tab-btn-login').className = 'modal-tab-btn ' + (tab === 'login' ? 'active' : '');
  document.getElementById('tab-btn-signup').className = 'modal-tab-btn ' + (tab === 'signup' ? 'active' : '');
  document.getElementById('form-user-login').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('form-user-signup').style.display = tab === 'signup' ? 'block' : 'none';
}

function switchAdminTab(tab) {
  document.getElementById('atab-btn-prices').className = 'modal-tab-btn ' + (tab === 'prices' ? 'active' : '');
  document.getElementById('atab-btn-add').className = 'modal-tab-btn ' + (tab === 'add' ? 'active' : '');
  document.getElementById('atab-btn-store').className = 'modal-tab-btn ' + (tab === 'store' ? 'active' : '');
  
  document.getElementById('adash-prices-sec').style.display = tab === 'prices' ? 'block' : 'none';
  document.getElementById('adash-add-sec').style.display = tab === 'add' ? 'block' : 'none';
  document.getElementById('adash-store-sec').style.display = tab === 'store' ? 'block' : 'none';
}

async function processUnifiedLogin() {
  const emailInput = document.getElementById('ulog-email').value.trim().toLowerCase();
  const passInput = document.getElementById('ulog-pass').value.trim();

  if (!emailInput || !passInput) {
    alert('Por favor, informe seu e-mail e senha.');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailInput, password: passInput })
    });
    const data = await res.json();
    
    if (!res.ok) {
      alert(data.error || 'Erro no login');
      return;
    }

    currentUser = { ...data.user, token: data.token };
    localStorage.setItem('villaburguer_current_user_v1', JSON.stringify(currentUser));

    updateUserNavUI();
    closeUserModal();
    
    if (currentUser.isAdmin) {
      showPage('admin');
      renderAdminDashboard();
      showNotif('Bem-vindo ao Painel do Propriet├írio! ­ƒææ');
    } else {
      showNotif('Login realizado com sucesso! Ol├í, ' + currentUser.name + ' ­ƒæï');
      await loadUserOrders();
    }
  } catch(e) {
    // Fallback de teste para GitHub Pages (Modo Demo)
    if (emailInput === 'admin@villaburguer.com' && passInput === 'villa123') {
      currentUser = { id: 1, name: 'Administrador (Demo)', email: 'admin@villaburguer.com', isAdmin: 1, token: 'demo_admin_token' };
      localStorage.setItem('villaburguer_current_user_v1', JSON.stringify(currentUser));
      updateUserNavUI();
      closeUserModal();
      showPage('admin');
      renderAdminDashboard();
      showNotif('Modo Demo: Logado como Administrador! ­ƒææ');
      return;
    } else if (emailInput === 'cliente@villaburguer.com' && passInput === 'cliente123') {
      currentUser = { id: 2, name: 'Cliente de Teste', email: 'cliente@villaburguer.com', tel: '19998877665', address: 'Rua das Flores, 123 - Bairro Central', isAdmin: 0, token: 'demo_client_token' };
      localStorage.setItem('villaburguer_current_user_v1', JSON.stringify(currentUser));
      updateUserNavUI();
      closeUserModal();
      showNotif('Modo Demo: Login realizado! Ol├í, Cliente de Teste ­ƒæï');
      return;
    }

    alert('Erro de conex├úo com o servidor. Verifique se a API est├í rodando.');
  }
}

async function processUserSignup() {
  const name = document.getElementById('usign-name').value.trim();
  const tel = document.getElementById('usign-tel').value.trim();
  const email = document.getElementById('usign-email').value.trim().toLowerCase();
  const pass = document.getElementById('usign-pass').value.trim();
  const address = document.getElementById('usign-end').value.trim();

  if (!name || !tel || !email || !pass) {
    alert('Por favor, preencha os campos obrigat├│rios (Nome, Tel, Email e Senha).');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, tel, email, address, password: pass })
    });
    const data = await res.json();
    
    if (!res.ok) {
      alert(data.error || 'Erro no cadastro');
      return;
    }

    currentUser = { ...data.user, token: data.token };
    localStorage.setItem('villaburguer_current_user_v1', JSON.stringify(currentUser));

    updateUserNavUI();
    closeUserModal();
    showNotif('Conta criada com sucesso! Seja bem-vindo, ' + name + '! ­ƒÄë');
  } catch(e) {
    currentUser = { id: Date.now(), name, email, tel, address, isAdmin: 0, token: 'demo_token' };
    localStorage.setItem('villaburguer_current_user_v1', JSON.stringify(currentUser));
    updateUserNavUI();
    closeUserModal();
    showNotif('Modo Demo: Conta criada com sucesso! Seja bem-vindo, ' + name + '! ­ƒÄë');
  }
}

async function changeUserPassword() {
  if (!currentUser) return;
  const currentPassword = document.getElementById('chg-curr-pwd').value.trim();
  const newPassword = document.getElementById('chg-new-pwd').value.trim();

  if (!currentPassword || !newPassword) {
    alert('Preencha a senha atual e a nova senha.');
    return;
  }
  if (newPassword.length < 6) {
    alert('A nova senha deve ter no m├¡nimo 6 caracteres.');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/user/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.token}` },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Erro ao alterar senha');
      return;
    }
    alert('Senha alterada com sucesso! ­ƒöÉ');
    document.getElementById('chg-curr-pwd').value = '';
    document.getElementById('chg-new-pwd').value = '';
    document.getElementById('pwd-change-box').style.display = 'none';
  } catch (e) {
    alert('Erro de conex├úo ao alterar senha.');
  }
}

function logoutUser() {
  currentUser = null;
  localStorage.removeItem('villaburguer_current_user_v1');
  updateUserNavUI();
  closeUserModal();
  showPage('home');
  showNotif('Voc├¬ deslogou da sua conta.');
}

function updateUserNavUI() {
  const btn = document.getElementById('user-nav-btn');
  const navAdmin = document.getElementById('nav-admin');
  const navLogout = document.getElementById('nav-logout');
  if (!btn || !navAdmin || !navLogout) return;
  if (currentUser) {
    navLogout.style.display = 'block';
    if (currentUser.isAdmin) {
      btn.style.display = 'none';
      navAdmin.style.display = 'block';
    } else {
      btn.style.display = 'block';
      navAdmin.style.display = 'none';
      btn.textContent = '­ƒæñ Ol├í, ' + currentUser.name.split(' ')[0];
    }
  } else {
    btn.style.display = 'block';
    navAdmin.style.display = 'none';
    navLogout.style.display = 'none';
    btn.textContent = '­ƒæñ Entrar / Cadastrar';
  }
}

// ---- DASHBOARD ADMIN ENGINE ----
async function renderAdminDashboard() {
  if (!VILLA_BURG_PRICING || Object.keys(VILLA_BURG_PRICING).length === 0) {
    await loadStoredPricing();
  }

  let allItems = getAllItemsForAdmin();
  if (allItems.length === 0) {
    await loadStoredPricing();
    allItems = getAllItemsForAdmin();
  }

  const activeProd = allItems.filter(i => i.active !== false).length;
  const featuredProd = allItems.filter(i => i.active !== false && i.featured).length;
  const avgPrice = allItems.reduce((acc, i) => acc + i.base, 0) / (allItems.length || 1);

  document.getElementById('kpi-total-prod').textContent = activeProd;
  document.getElementById('kpi-total-feat').textContent = `${featuredProd} / 6`;
  document.getElementById('kpi-avg-price').textContent = fmt(avgPrice);

  const statusKpi = document.getElementById('kpi-store-status');
  if (storeStatusOverride === 'open') {
    statusKpi.textContent = 'ABERTO ­ƒƒó';
    statusKpi.style.color = '#388E3C';
  } else if (storeStatusOverride === 'closed') {
    statusKpi.textContent = 'FECHADO ­ƒö┤';
    statusKpi.style.color = '#D32F2F';
  } else {
    statusKpi.textContent = 'AUTO ÔÅ▒´©Å';
    statusKpi.style.color = '#E65100';
  }

  document.getElementById('admin-store-override').value = storeStatusOverride;

  const wppInp = document.getElementById('admin-wpp-phone');
  if (wppInp) wppInp.value = storeWhatsAppPhone;

  const tbody = document.getElementById('admin-products-table');
  if (!tbody) return;

  const catNames = {
    'hamburgueres': '­ƒìö Hamb├║rguer',
    'combos2x': '­ƒææ Combo 2x',
    'porcoes': '­ƒìƒ Por├º├úo',
    'bebidas': '­ƒÑñ Bebida',
    'sobremesa': '­ƒì« Sobremesa',
    'adicional': 'Ô×ò Adicional'
  };

  tbody.innerHTML = allItems.map(item => `
    <tr data-id="${item.id}" style="border-bottom:1px solid var(--border-color);">
      <td style="padding:0.75rem 0.8rem; text-align:center;">
        <img src="${escapeHTML(item.img)}" style="width:55px; height:42px; border-radius:8px; object-fit:cover; border:1px solid var(--border-color); background:#FFF;" alt="${escapeHTML(item.name)}">
      </td>
      <td style="padding:0.75rem 0.8rem;">
        <div style="display:flex; align-items:center; gap:0.4rem; flex-wrap:wrap;">
          <strong style="font-size:1.02rem; color:#1F1F1F;">${escapeHTML(item.name)}</strong>
          ${item.tag ? `<span style="font-size:0.72rem; font-weight:800; background:#FF5500; color:#FFF; padding:0.1rem 0.5rem; border-radius:10px;">${escapeHTML(item.tag)}</span>` : ''}
        </div>
        <span style="font-size:0.78rem; font-weight:700; background:#FFF0E0; color:var(--primary-orange); padding:0.15rem 0.55rem; border-radius:10px; border:1px solid var(--border-color); display:inline-block; margin-top:0.25rem;">${catNames[item.cat] || item.cat}</span>
      </td>
      <td style="padding:0.75rem 0.8rem;">
        <strong style="font-size:1.05rem; color:var(--primary-orange);">${fmt(item.base)}</strong>
        ${item.comboAdd !== null && item.comboAdd !== undefined ? `<div style="font-size:0.78rem; color:#666; font-weight:600;">Combo: +${fmt(item.comboAdd)}</div>` : ''}
      </td>
      <td style="padding:0.75rem 0.8rem; text-align:center;">
        ${item.featured ? `
          <button style="background:#FFF8E1; color:#F57F17; border:1.5px solid #FFD54F; padding:0.45rem 0.8rem; border-radius:20px; font-weight:800; font-size:0.82rem; cursor:pointer; transition:transform 0.15s;" onclick="toggleProductFeaturedFromAdmin(${item.id}, false)">Ô¡É Na Capa</button>
        ` : `
          <button style="background:#FAFAFA; color:#777; border:1.5px solid #E0E0E0; padding:0.45rem 0.8rem; border-radius:20px; font-weight:700; font-size:0.82rem; cursor:pointer; transition:transform 0.15s;" onclick="toggleProductFeaturedFromAdmin(${item.id}, true)">Ôÿå Colocar na Capa</button>
        `}
      </td>
      <td style="padding:0.75rem 0.8rem; text-align:center;">
        ${item.active !== false ? `
          <button style="background:#E8F5E9; color:#2E7D32; border:1.5px solid #81C784; padding:0.45rem 0.85rem; border-radius:20px; font-weight:800; font-size:0.82rem; cursor:pointer; transition:transform 0.15s;" onclick="toggleProductActiveFromAdmin(${item.id}, false)">­ƒƒó ├Ç Venda</button>
        ` : `
          <button style="background:#FFEBEE; color:#C62828; border:1.5px solid #EF9A9A; padding:0.45rem 0.85rem; border-radius:20px; font-weight:800; font-size:0.82rem; cursor:pointer; transition:transform 0.15s;" onclick="toggleProductActiveFromAdmin(${item.id}, true)">­ƒö┤ Pausado (Esgotado)</button>
        `}
      </td>
      <td style="padding:0.75rem 0.8rem; text-align:center;">
        <div style="display:flex; gap:0.4rem; justify-content:center;">
          <button class="add-btn-sm" style="background:#0288D1; padding:0.45rem 0.85rem; font-size:0.82rem; border-radius:6px; font-weight:800;" onclick="openEditProdModal(${item.id})">Ô£Å´©Å EDITAR</button>
          <button class="add-btn-sm" style="background:#D32F2F; padding:0.45rem 0.65rem; font-size:0.82rem; border-radius:6px;" onclick="deleteProductFromAdmin(${item.id})">­ƒùæ´©Å</button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function toggleProductFeaturedFromAdmin(id, newFeatured) {
  if (!currentUser || !currentUser.isAdmin) return;
  const allItems = getAllItemsForAdmin();
  const item = allItems.find(i => String(i.id) === String(id));
  const name = item ? item.name : 'Produto';

  if (newFeatured) {
    const currentFeaturedCount = allItems.filter(i => i.featured && i.active !== false).length;
    if (currentFeaturedCount >= 6) {
      alert('ÔÜá´©Å Limite atingido! O carrossel da capa aceita no m├íximo 6 produtos em destaque ao mesmo tempo. Desmarque um produto da capa antes de adicionar este.');
      return;
    }
  }

  if (item) item.featured = newFeatured;
  localStorage.setItem('villaburguer_custom_pricing_v1', JSON.stringify(VILLA_BURG_PRICING));

  try {
    await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.token}` },
      body: JSON.stringify({ featured: newFeatured })
    });
  } catch (e) {}

  renderCarouselItems();
  renderOrderGrid('todos');
  renderMenuPage();
  renderAdminDashboard();
  showNotif(newFeatured ? `"${name}" colocado na capa! Ô¡É` : `"${name}" removido da capa!`);
}

async function toggleProductActiveFromAdmin(id, newActive) {
  if (!currentUser || !currentUser.isAdmin) return;
  const allItems = getAllItemsForAdmin();
  const item = allItems.find(i => String(i.id) === String(id));
  const name = item ? item.name : 'Produto';

  if (item) item.active = newActive;
  localStorage.setItem('villaburguer_custom_pricing_v1', JSON.stringify(VILLA_BURG_PRICING));

  try {
    await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.token}` },
      body: JSON.stringify({ active: newActive })
    });
  } catch (e) {}

  renderCarouselItems();
  renderOrderGrid('todos');
  renderMenuPage();
  renderAdminDashboard();
  showNotif(newActive ? `"${name}" ativado para venda! ­ƒƒó` : `"${name}" pausado (esgotado)! ­ƒö┤`);
}

function filterAdminProductsList(query) {
  const rows = document.querySelectorAll('#admin-products-table tr');
  const q = query.toLowerCase().trim();
  rows.forEach(r => {
    const text = r.textContent.toLowerCase();
    r.style.display = text.includes(q) ? '' : 'none';
  });
}

function openEditProdModal(id) {
  const allItems = getAllItemsForAdmin();
  const item = allItems.find(i => String(i.id) === String(id));
  if (!item) return;

  document.getElementById('eprod-id').value = item.id;
  document.getElementById('eprod-cat').value = item.cat || 'hamburgueres';
  document.getElementById('eprod-name').value = item.name || '';
  document.getElementById('eprod-desc').value = item.desc || '';
  document.getElementById('eprod-price').value = item.base || 0;
  document.getElementById('eprod-combo').value = item.comboAdd !== null && item.comboAdd !== undefined ? item.comboAdd : '';
  document.getElementById('eprod-tag').value = item.tag || '';
  document.getElementById('eprod-img').value = item.img || '';
  document.getElementById('eprod-feat').checked = !!item.featured;
  document.getElementById('eprod-active').checked = item.active !== false;

  document.getElementById('edit-prod-modal').classList.add('open');
}

function closeEditProdModal() {
  document.getElementById('edit-prod-modal').classList.remove('open');
}

function closeEditProdModalOutside(e) {
  if (e.target === document.getElementById('edit-prod-modal')) closeEditProdModal();
}

async function saveEditedProductFromModal() {
  if (!currentUser || !currentUser.isAdmin) return;
  const id = document.getElementById('eprod-id').value;
  const cat = document.getElementById('eprod-cat').value;
  const name = document.getElementById('eprod-name').value.trim();
  const desc = document.getElementById('eprod-desc').value.trim();
  const base = parseFloat(document.getElementById('eprod-price').value.replace(',', '.'));
  const comboVal = document.getElementById('eprod-combo').value.trim();
  const comboAdd = comboVal ? parseFloat(comboVal.replace(',', '.')) : null;
  const tag = document.getElementById('eprod-tag').value.trim();
  const img = document.getElementById('eprod-img').value.trim();
  const featured = document.getElementById('eprod-feat').checked;
  const active = document.getElementById('eprod-active').checked;

  if (!name || isNaN(base)) {
    alert('Informe ao menos o Nome e o Pre├ºo Base.');
    return;
  }

  const allItems = getAllItemsForAdmin();
  const targetItem = allItems.find(i => String(i.id) === String(id));
  if (targetItem) {
    targetItem.cat = cat;
    targetItem.name = name;
    targetItem.desc = desc;
    targetItem.base = base;
    targetItem.comboAdd = comboAdd;
    targetItem.tag = tag || null;
    targetItem.img = img || targetItem.img;
    targetItem.featured = featured;
    targetItem.active = active;
  }
  localStorage.setItem('villaburguer_custom_pricing_v1', JSON.stringify(VILLA_BURG_PRICING));

  try {
    await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.token}` },
      body: JSON.stringify({ cat, name, desc, base, comboAdd, tag: tag || null, img, featured, active })
    });
  } catch (e) {}

  closeEditProdModal();
  renderCarouselItems();
  renderOrderGrid('todos');
  renderMenuPage();
  renderAdminDashboard();
  showNotif(`Produto "${name}" atualizado com sucesso! ­ƒÆ¥`);
}

async function deleteProductFromAdmin(id) {
  if (!currentUser || !currentUser.isAdmin) return;
  const allItems = getAllItemsForAdmin();
  const item = allItems.find(i => String(i.id) === String(id));
  const itemName = item ? item.name : 'este produto';

  if (!confirm(`Tem certeza que deseja excluir "${itemName}"? Esta a├º├úo n├úo pode ser desfeita.`)) return;

  Object.keys(VILLA_BURG_PRICING).forEach(k => {
    if (Array.isArray(VILLA_BURG_PRICING[k])) {
      VILLA_BURG_PRICING[k] = VILLA_BURG_PRICING[k].filter(i => String(i.id) !== String(id));
    }
  });
  localStorage.setItem('villaburguer_custom_pricing_v1', JSON.stringify(VILLA_BURG_PRICING));

  try {
    await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${currentUser.token}` }
    });
  } catch (e) {}

  closeEditProdModal();
  renderCarouselItems();
  renderOrderGrid('todos');
  renderMenuPage();
  renderAdminDashboard();
  showNotif(`Produto "${itemName}" exclu├¡do com sucesso! ­ƒùæ´©Å`);
}

function handleTableRowFileUpload(id, input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const dataUrl = e.target.result;
      document.getElementById('aimg-prev-' + id).src = dataUrl;
      document.getElementById('aimg-' + id).value = dataUrl;
      showNotif('Nova imagem selecionada! Clique em "Salvar Tudo" para aplicar.');
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function handleNewProdFileUpload(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const dataUrl = e.target.result;
      document.getElementById('nprod-img').value = dataUrl;
      document.getElementById('nprod-img-preview').src = dataUrl;
      showNotif('Foto carregada com sucesso! ­ƒôÀ');
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function updateNewProdPreview(val) {
  const prev = document.getElementById('nprod-img-preview');
  if (prev && val) prev.src = val;
}

async function saveAdminChanges() {
  if (!currentUser || !currentUser.isAdmin) return;
  const rows = document.querySelectorAll('#admin-products-table tr');
  let hasError = false;
  let savedCount = 0;
  
  for (const row of rows) {
    const id = row.getAttribute('data-id');
    if (!id) continue;
    const baseEl = row.querySelector('.inp-base');
    const comboEl = row.querySelector('.inp-combo');
    const featEl = row.querySelector('.inp-feat');
    const activeEl = row.querySelector('.inp-active');
    const imgEl = row.querySelector('.inp-img');
    
    if (!baseEl) continue;

    const base = parseFloat(baseEl.value.replace(',', '.')) || 0;
    const comboVal = comboEl ? comboEl.value.trim() : '';
    const comboAdd = comboVal ? parseFloat(comboVal.replace(',', '.')) : null;
    const featured = featEl ? featEl.checked : false;
    const active = activeEl ? activeEl.checked : true;
    const imgUrl = imgEl ? imgEl.value.trim() : '';

    try {
      await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.token}` },
        body: JSON.stringify({ base, comboAdd, featured, active, img: imgUrl })
      });
      savedCount++;
    } catch(e) {
      hasError = true;
    }
  }

  await loadStoredPricing();
  renderCarouselItems();
  renderOrderGrid('todos');
  renderMenuPage();
  renderAdminDashboard();
  if (hasError) alert('Alguns produtos n├úo puderam ser salvos.');
  else showNotif(`${savedCount} produtos salvos com sucesso! ­ƒÆ¥`);
}

async function addNewProductFromAdmin() {
  if (!currentUser || !currentUser.isAdmin) return;
  const cat = document.getElementById('nprod-cat').value;
  const name = document.getElementById('nprod-name').value.trim();
  const desc = document.getElementById('nprod-desc').value.trim();
  const price = parseFloat(document.getElementById('nprod-price').value.replace(',', '.'));
  let comboVal = document.getElementById('nprod-combo').value.trim();
  const comboAdd = comboVal ? parseFloat(comboVal.replace(',', '.')) : null;
  const tag = document.getElementById('nprod-tag').value.trim();
  const img = document.getElementById('nprod-img').value.trim() || 'imgs/img1.png';
  const featured = document.getElementById('nprod-feat').checked;

  if (!name || isNaN(price)) {
    alert('Por favor, preencha Nome e Pre├ºo Base.');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.token}` },
      body: JSON.stringify({ cat, name, desc, base: price, comboAdd, tag: tag || null, featured, active: true, img })
    });
    if (res.ok) {
      document.getElementById('nprod-name').value = '';
      document.getElementById('nprod-desc').value = '';
      document.getElementById('nprod-price').value = '';
      document.getElementById('nprod-combo').value = '';
      document.getElementById('nprod-tag').value = '';
      document.getElementById('nprod-img').value = '';
      document.getElementById('nprod-feat').checked = false;
      document.getElementById('nprod-img-preview').src = 'imgs/img1.png';
      
      await loadStoredPricing();
      renderCarouselItems();
      renderOrderGrid('todos');
      renderMenuPage();
      renderAdminDashboard();
      
      switchAdminTab('prices');
      showNotif('Novo produto "' + name + '" cadastrado no card├ípio! ­ƒÜÇ');
    }
  } catch(e) {
    alert('Erro ao cadastrar produto.');
  }
}

async function loadUserOrders() {
  if (!currentUser) return;
  const list = document.getElementById('user-orders-list');
  if (!list) return;
  
  try {
    const res = await fetch(`${API_URL}/orders`, {
      headers: { 'Authorization': `Bearer ${currentUser.token}` }
    });
    if (!res.ok) throw new Error();
    const orders = await res.json();
    
    if (orders.length === 0) {
      list.innerHTML = '<p style="color:var(--text-muted); font-style:italic;">Nenhum pedido encontrado. Vamos fazer o primeiro?</p>';
      return;
    }
    
    list.innerHTML = orders.map(o => `
      <div style="border-bottom:1px solid var(--border-light); padding:0.8rem 0;">
        <div style="display:flex; justify-content:space-between; margin-bottom:0.2rem;">
          <strong style="color:var(--primary-orange);">Pedido #${o.id}</strong>
          <span style="font-weight:700;">${fmt(o.total)}</span>
        </div>
        <div style="color:var(--text-muted); font-size:0.8rem; margin-bottom:0.4rem;">${new Date(o.createdAt).toLocaleString()}</div>
        <div style="font-size:0.85rem;">
          ${o.items.map(i => `${i.qty}x ${escapeHTML(i.name)}`).join(', ')}
        </div>
      </div>
    `).join('');
  } catch(e) {
    list.innerHTML = '<p style="color:red;">Erro ao buscar hist├│rico.</p>';
  }
}

function updateStoreOverride(val) {
  storeStatusOverride = val;
  saveStoredPricing();
  checkStoreStatus();
  renderAdminDashboard();
}

async function resetAdminDefaults() {
  if (confirm('Deseja restaurar todos os produtos recarregando do servidor?')) {
    storeStatusOverride = 'auto';
    localStorage.removeItem('villaburguer_store_override_v1');
    await loadStoredPricing();
    renderAdminDashboard();
    renderCarouselItems();
    renderOrderGrid('todos');
    renderMenuPage();
    checkStoreStatus();
    showNotif('Dados recarregados do servidor com sucesso! ­ƒöä');
  }
}

// ---- RENDERIZA├ç├âO DO CARD├üPIO ----
function renderMenuPage() {
  const container = document.getElementById('menu-content-container');
  let html = '';
  
  const categories = [
    { key: 'hamburgueres', title: '­ƒìö Hamb├║rgueres Artesanais' },
    { key: 'combos2x', title: '­ƒææ Combos 2x' },
    { key: 'porcoes', title: '­ƒìƒ Por├º├Áes Porcionadas' },
    { key: 'bebidas', title: '­ƒÑñ Bebidas Geladas' },
    { key: 'sobremesa', title: '­ƒì« Sobremesas' },
    { key: 'adicional', title: 'Ô×ò Adicionais' }
  ];

  categories.forEach((c, idx) => {
    const items = (VILLA_BURG_PRICING[c.key] || []).filter(i => i.active !== false);
    html += `<div class="menu-section ${idx === 0 ? 'active' : ''}" id="menu-${c.key}">
      <div class="menu-cat-title">${c.title}</div>`;

    items.forEach(item => {
      const hasCombo = item.comboAdd !== null && item.comboAdd !== undefined;
      const comboPrice = hasCombo ? item.base + item.comboAdd : null;

      html += `<div class="menu-item-row fade-in">
        <img src="${escapeHTML(item.img)}" class="menu-item-thumb" alt="${escapeHTML(item.name)}">
        <div>
          <div class="menu-item-name">${escapeHTML(item.name)} ${item.tag ? `<span class="card-tag" style="margin-left:0.5rem; font-size:0.75rem; background:var(--primary-orange); color:#FFF; padding:0.2rem 0.6rem; border-radius:12px;">${escapeHTML(item.tag)}</span>` : ''}</div>
          <div class="menu-item-desc">${escapeHTML(item.desc)}</div>
        </div>
        <div class="menu-item-prices">
          <div><span class="price-value">${fmt(item.base)}</span> ${hasCombo ? `<span style="font-size:0.75rem; color:var(--text-muted);">(Normal)</span>` : ''}</div>
          ${hasCombo ? `<div style="font-size:0.85rem; font-weight:800; color:var(--primary-orange);">Combo: ${fmt(comboPrice)}</div>` : ''}
          <button class="add-btn-sm" onclick="addDirectToCart(${item.id})">+ PEDIR</button>
        </div>
      </div>`;
    });

    html += `</div>`;
  });

  container.innerHTML = html;
  initObserver();
}

function switchMenuTab(sectionKey, el) {
  document.querySelectorAll('.menu-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.menu-tab').forEach(t => t.classList.remove('active'));
  const target = document.getElementById('menu-' + sectionKey);
  if (target) target.classList.add('active');
  el.classList.add('active');
  initObserver();
}

// ---- GRADE DE PRODUTOS DIN├éMICA ----
function renderOrderGrid(filterCat) {
  const grid = document.getElementById('order-grid');
  const allItems = getAllItems();
  const items = filterCat === 'todos' ? allItems : allItems.filter(i => i.cat === filterCat);

  grid.innerHTML = items.map(item => {
    const hasCombo = item.comboAdd !== null && item.comboAdd !== undefined;
    const selType = selectedCombo[item.id] || 'normal';
    const currentPrice = hasCombo && selType === 'combo' ? item.base + item.comboAdd : item.base;

    return `<div class="order-card fade-in" id="ocard-${item.id}">
      ${item.tag ? `<div class="card-ribbon">${escapeHTML(item.tag)}</div>` : ''}
      <img src="${escapeHTML(item.img)}" class="order-card-img" alt="${escapeHTML(item.name)}">
      <div class="order-card-body">
        <div class="order-card-name">${escapeHTML(item.name)}</div>
        <div class="order-card-desc">${escapeHTML(item.desc)}</div>
        
        ${hasCombo ? `<div class="combo-toggle">
          <button class="combo-opt ${selType === 'normal' ? 'active' : ''}" onclick="setCombo(${item.id}, 'normal')">Normal ${fmt(item.base)}</button>
          <button class="combo-opt ${selType === 'combo' ? 'active' : ''}" onclick="setCombo(${item.id}, 'combo')">Combo ${fmt(item.base + item.comboAdd)}</button>
        </div>` : ''}

        <div class="order-card-footer">
          <span class="order-card-price" id="price-${item.id}">${fmt(currentPrice)}</span>
          <div class="qty-controls">
            <button class="qty-btn" onclick="changeQty(${item.id}, -1)">ÔêÆ</button>
            <span class="qty-num" id="qty-${item.id}">0</span>
            <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
          </div>
        </div>

        <button class="item-obs-toggle" onclick="toggleItemObs(${item.id})">+ Observa├º├úo</button>
        <textarea class="item-obs-input" id="item-obs-${item.id}" placeholder="Ex: Sem cebola, bem passado..." rows="2" oninput="saveItemObs(${item.id}, this.value.trim())">${escapeHTML(loadItemObs(item.id))}</textarea>
      </div>
    </div>`;
  }).join('');

  cart.forEach(ci => {
    const el = document.getElementById('qty-' + ci.id);
    if (el) el.textContent = ci.qty;
  });

  items.forEach(item => {
    const savedObs = loadItemObs(item.id);
    if (savedObs) {
      const inp = document.getElementById('item-obs-' + item.id);
      if (inp) inp.classList.add('open');
    }
  });

  initObserver();
}

function filterOrder(cat, el) {
  document.querySelectorAll('.order-cat-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderOrderGrid(cat);
}

function setCombo(id, type) {
  selectedCombo[id] = type;
  const item = getAllItems().find(i => i.id === id);
  if (!item) return;

  const currentPrice = type === 'combo' ? item.base + item.comboAdd : item.base;
  const priceEl = document.getElementById('price-' + id);
  if (priceEl) priceEl.textContent = fmt(currentPrice);

  document.querySelectorAll(`#ocard-${id} .combo-opt`).forEach(b => b.classList.remove('active'));
  if (event && event.target) event.target.classList.add('active');

  const ci = cart.find(c => c.id === id);
  if (ci) {
    ci.price = currentPrice;
    ci.type = type;
    ci.name = item.name + (type === 'combo' ? ' (Combo)' : ' (Normal)');
    updateCart();
  }
}

function changeQty(id, delta) {
  const item = getAllItems().find(i => i.id === id);
  if (!item) return;

  const selType = selectedCombo[id] || 'normal';
  const hasCombo = item.comboAdd !== null && item.comboAdd !== undefined;
  const price = hasCombo && selType === 'combo' ? item.base + item.comboAdd : item.base;
  const displayName = item.name + (hasCombo ? (selType === 'combo' ? ' (Combo)' : ' (Normal)') : '');

  let ci = cart.find(c => c.id === id);
  if (!ci) {
    if (delta < 1) return;
    ci = { id, name: displayName, price, qty: 0, type: selType };
    cart.push(ci);
  }

  ci.qty += delta;
  ci.price = price;
  ci.name = displayName;

  if (ci.qty <= 0) {
    cart = cart.filter(c => c.id !== id);
  }

  const qEl = document.getElementById('qty-' + id);
  if (qEl) qEl.textContent = ci && ci.qty > 0 ? ci.qty : 0;

  updateCart();
}

function addDirectToCart(id) {
  changeQty(id, 1);
  showPage('pedido');
  showNotif('Item adicionado ao carrinho! ­ƒøÆ');
}

function updateCart() {
  const container = document.getElementById('cart-items');
  const btn = document.getElementById('whatsapp-btn');
  const totalEl = document.getElementById('cart-total');

  const mbar = document.getElementById('mobile-cart-bar');
  const mcount = document.getElementById('mcart-count');
  const mtotal = document.getElementById('mcart-total');

  if (cart.length === 0) {
    container.innerHTML = `<div class="cart-empty"><span style="font-size:2.4rem; display:block; margin-bottom:0.4rem;">­ƒøÆ</span>Seu carrinho est├í vazio</div>`;
    btn.disabled = true;
    totalEl.textContent = 'R$ 0,00';
    if (mbar) mbar.classList.remove('show');
    updateCartBadge();
    checkMinOrder();
    saveCart();
    return;
  }

  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  totalEl.textContent = fmt(total);
  btn.disabled = false;

  if (mbar && mcount && mtotal) {
    const totalQty = cart.reduce((s, c) => s + c.qty, 0);
    mcount.textContent = totalQty;
    mtotal.textContent = fmt(total);
    mbar.classList.add('show');
  }

  container.innerHTML = cart.map(c => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-name">${c.qty}x ${escapeHTML(c.name)}</div>
        <div class="cart-item-price">${fmt(c.price * c.qty)}</div>
      </div>
      <button class="cart-item-remove" onclick="removeCartItem(${c.id})">Ô£ò</button>
    </div>
  `).join('');

  updateCartBadge();
  checkMinOrder();
  saveCart();
}

function removeCartItem(id) {
  cart = cart.filter(c => c.id !== id);
  const qEl = document.getElementById('qty-' + id);
  if (qEl) qEl.textContent = '0';
  saveItemObs(id, '');
  updateCart();
}

// ---- CHECKOUT & WHATSAPP ----
function openModal() {
  if (cart.length === 0) return;
  const banner = document.getElementById('checkout-logged-banner');
  if (currentUser && !currentUser.isAdmin) {
    document.getElementById('f-nome').value = currentUser.name || '';
    document.getElementById('f-tel').value = currentUser.tel || '';
    document.getElementById('f-end').value = currentUser.address || '';
    if (banner) banner.style.display = 'block';
  } else {
    if (banner) banner.style.display = 'none';
  }
  document.getElementById('modal').classList.add('open');
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

function closeModalOutside(e) {
  if (e.target === document.getElementById('modal')) closeModal();
}

document.getElementById('f-tipo').addEventListener('change', function() {
  document.getElementById('endereco-group').style.display = this.value === 'entrega' ? 'block' : 'none';
  checkMinOrder();
});

async function sendWhatsApp() {
  const nome = document.getElementById('f-nome').value.trim();
  const tel = document.getElementById('f-tel').value.trim();
  const tipo = document.getElementById('f-tipo').value;
  const end = document.getElementById('f-end').value.trim();
  const pag = document.getElementById('f-pag').value;
  const trocoEl = document.getElementById('f-troco');
  const troco = trocoEl ? trocoEl.value.trim() : '';
  const obsGeral = document.getElementById('obs-input').value.trim();

  if (!nome) { alert('Por favor, informe seu nome.'); return; }
  if (!tel) { alert('Por favor, informe seu WhatsApp.'); return; }
  if (tipo === 'entrega' && !end) { alert('Por favor, informe o endere├ºo de entrega.'); return; }

  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);

  if (currentUser) {
    try {
      await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.token}` },
        body: JSON.stringify({ total, items: cart, type: tipo, address: end, payment: pag, obs: obsGeral })
      });
      loadUserOrders();
    } catch(e) {
      console.error('Falha ao salvar no hist├│rico', e);
    }
  }

  const orderNum = Math.floor(1000 + Math.random() * 9000);
  const orderId = `PED-${orderNum}`;

  const deliveryTax = (tipo === 'entrega') ? 5 : 0;
  const subtotal = total;
  const grandTotal = total + deliveryTax;

  let msg = `*­ƒìö NOVO PEDIDO - VILLA BURGUER (#${orderId}) ­ƒìö*\n`;
  msg += `ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ\n\n`;
  msg += `*­ƒåö C├ôDIGO DO PEDIDO:* #${orderId}\n`;
  msg += `*­ƒæñ CLIENTE:* ${nome}\n`;
  msg += `*­ƒô▒ WHATSAPP:* ${tel}\n`;
  msg += (tipo === 'entrega') ? `*­ƒøÁ TIPO:* Delivery (Entrega em Domic├¡lio)\n*­ƒôì ENDERE├çO:* ${end}\n` : `*­ƒÅ¬ TIPO:* Retirada no Balc├úo\n`;
  msg += `*­ƒÆ│ PAGAMENTO:* ${pag}\n`;
  if (troco) msg += `*­ƒÆÁ TROCO PARA:* ${troco}\n`;

  msg += `\nÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ\n`;
  msg += `*­ƒøì´©Å ITENS DO PEDIDO:*\n\n`;

  cart.forEach((c, idx) => {
    const itemObs = getItemObs(c.id);
    msg += ` *${idx + 1}.* *${c.qty}x ${c.name}* - ${fmt(c.price * c.qty)}\n`;
    if (c.isCombo) msg += `    _Ôöö Combo (Batata + Bebida)_ \n`;
    if (itemObs) msg += `    _Ôöö Obs: ${itemObs}_\n`;
    msg += `\n`;
  });

  msg += `ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ\n`;
  msg += `*­ƒÆ░ RESUMO FINANCEIRO:*\n`;
  msg += ` Ôû½´©Å Subtotal: ${fmt(subtotal)}\n`;
  if (tipo === 'entrega') msg += ` Ôû½´©Å Taxa de Entrega: ${fmt(deliveryTax)}\n`;
  msg += ` *­ƒöÑ TOTAL DO PEDIDO: ${fmt(tipo === 'entrega' ? grandTotal : subtotal)}*\n`;

  if (obsGeral) {
    msg += `\nÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ\n`;
    msg += `*­ƒôØ OBSERVA├ç├òES DO PEDIDO:*\n_${obsGeral}_\n`;
  }

  msg += `\nÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ\n`;
  msg += `_Enviado via Card├ípio Digital Villa Burguer_ Ô£¿`;

  const orderSnapshot = [...cart];
  const orderTotal = (tipo === 'entrega') ? grandTotal : subtotal;

  const waUrl = `https://wa.me/${storeWhatsAppPhone}?text=${encodeURIComponent(msg)}`;
  try {
    const win = window.open(waUrl, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = waUrl;
    }
  } catch(e) {
    window.location.href = waUrl;
  }

  cart = [];
  selectedCombo = {};
  clearAllStorage();
  document.getElementById('obs-input').value = '';
  closeModal();
  updateCart();

  showThankYou(orderSnapshot, orderTotal, orderId);
}

function showThankYou(items, total, orderId) {
  const summary = document.getElementById('thanks-summary');
  if (summary) {
    summary.innerHTML = `<h4 style="font-family:'Bebas Neue'; font-size:1.6rem; color:#141414; border-bottom:2px solid #141414; padding-bottom:0.4rem; margin-bottom:0.8rem; letter-spacing:1px;">­ƒôï RESUMO DO PEDIDO (${orderId || 'CONFIRMADO'})</h4>` +
      items.map(c => `<div style="display:flex; justify-content:space-between; font-size:0.95rem; font-weight:700; color:#222222; margin-bottom:0.4rem;"><span>${c.qty}x ${escapeHTML(c.name)}</span><strong style="color:#D84315;">${fmt(c.price * c.qty)}</strong></div>`).join('') +
      `<div style="display:flex; justify-content:space-between; font-weight:900; font-size:1.2rem; border-top:2px solid #141414; padding-top:0.6rem; margin-top:0.8rem; color:#D84315;"><span>TOTAL</span><span>${fmt(total)}</span></div>`;
  }
  showPage('obrigado');
}

// ---- STORAGE LOCAL ----
const STORAGE_KEY = 'villaburguer_cart_v2';
const STORAGE_OBS_KEY = 'villaburguer_obs_v2';

function saveCart() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ cart, selectedCombo, timestamp: Date.now() }));
  } catch (e) {}
}

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data.timestamp && (Date.now() - data.timestamp) > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    if (Array.isArray(data.cart)) cart = data.cart;
    if (data.selectedCombo) selectedCombo = data.selectedCombo;
  } catch (e) {}
}

function saveItemObs(id, val) {
  try {
    const raw = localStorage.getItem(STORAGE_OBS_KEY) || '{}';
    const obj = JSON.parse(raw);
    if (val) obj[id] = val; else delete obj[id];
    localStorage.setItem(STORAGE_OBS_KEY, JSON.stringify(obj));
  } catch (e) {}
}

function loadItemObs(id) {
  try {
    const raw = localStorage.getItem(STORAGE_OBS_KEY) || '{}';
    return JSON.parse(raw)[id] || '';
  } catch (e) { return ''; }
}

function getItemObs(id) {
  const inp = document.getElementById('item-obs-' + id);
  return inp ? inp.value.trim() : loadItemObs(id);
}

function toggleItemObs(id) {
  const inp = document.getElementById('item-obs-' + id);
  if (inp) {
    inp.classList.toggle('open');
    if (inp.classList.contains('open') && !inp.value) {
      inp.value = loadItemObs(id);
    }
  }
}

function clearAllStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_OBS_KEY);
  } catch (e) {}
}

// ---- STATUS DA LOJA AUTOM├üTICO ----
const STORE_HOURS = {
  0: { open: 18, close: 24 },
  1: { open: 18, close: 23 },
  2: { open: 18, close: 23 },
  3: { open: 18, close: 23 },
  4: { open: 18, close: 23 },
  5: { open: 18, close: 23 },
  6: { open: 18, close: 24 }
};

function checkStoreStatus() {
  const bar = document.getElementById('store-status-bar');
  const text = document.getElementById('store-status-text');

  if (storeStatusOverride === 'open') {
    bar.className = 'store-status-bar open';
    text.textContent = `­ƒƒó Aberto Agora! (Status for├ºado pelo administrador)`;
    return;
  }
  if (storeStatusOverride === 'closed') {
    bar.className = 'store-status-bar closed';
    text.textContent = `­ƒƒá Fechado Agora (Pausa solicitada pela ger├¬ncia)`;
    return;
  }

  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours() + now.getMinutes() / 60;
  const hours = STORE_HOURS[day];
  const isOpen = hour >= hours.open && hour < hours.close;

  if (isOpen) {
    bar.className = 'store-status-bar open';
    text.textContent = `­ƒƒó Aberto Agora! Fechamos ├ás ${hours.close}h`;
  } else {
    bar.className = 'store-status-bar closed';
    text.textContent = `­ƒƒá Fechado Agora ┬À Abrimos hoje ├ás ${hours.open}h`;
  }
}

// ---- CARROSSEL DA HOME COM AUTOPLAY ----
let carouselIndex = 0;
let carouselAutoPlayTimer = null;

function renderCarouselItems() {
  const track = document.getElementById('carousel-track');
  if (!track) return;

  const allItems = getAllItems();
  const items = allItems.filter(i => i.active !== false && i.featured).slice(0, 6);

  if (items.length === 0) {
    track.innerHTML = `<div style="text-align:center; padding:2rem; width:100%; color:var(--text-muted); font-weight:700;">Nenhum produto em destaque no momento.</div>`;
    return;
  }

  track.innerHTML = items.map(item => `
    <div class="carousel-card ${item.featured ? 'featured-star' : ''}">
      ${item.tag ? `<div class="card-ribbon">${escapeHTML(item.tag)}</div>` : ''}
      <div class="card-img-wrapper">
        <img src="${escapeHTML(item.img)}" alt="${escapeHTML(item.name)}" loading="lazy">
      </div>
      <div class="card-body">
        <div class="card-title">${escapeHTML(item.name)}</div>
        <div class="card-desc">${escapeHTML(item.desc)}</div>
        <div class="card-price-row">
          <span class="card-price">${fmt(item.base)}</span>
          <button class="btn-primary" style="padding:0.6rem 1.3rem; font-size:0.9rem;" onclick="addDirectToCart(${item.id})">PEDIR</button>
        </div>
      </div>
    </div>
  `).join('');

  setTimeout(() => carouselUpdate(), 60);
}

function carouselGetVisible() {
  const w = window.innerWidth;
  if (w <= 600) return 1;
  if (w <= 900) return 2;
  return 3;
}

function carouselUpdate() {
  const track = document.getElementById('carousel-track');
  const dotsEl = document.getElementById('carousel-dots');
  if (!track) return;

  const cards = track.querySelectorAll('.carousel-card');
  const total = cards.length;
  if (total === 0) return;
  const visible = carouselGetVisible();
  const maxIndex = Math.max(0, total - visible);
  
  if (carouselIndex > maxIndex) carouselIndex = 0;
  if (carouselIndex < 0) carouselIndex = maxIndex;

  const gap = 22.4;
  const trackOuter = track.parentElement;
  const cardWidth = (trackOuter.offsetWidth - gap * (visible - 1)) / visible;
  const offset = carouselIndex * (cardWidth + gap);
  track.style.transform = `translateX(-${offset}px)`;

  const pages = maxIndex + 1;
  dotsEl.innerHTML = Array.from({length: pages}, (_, i) =>
    `<button class="carousel-dot ${i === carouselIndex ? 'active' : ''}" onclick="carouselGoTo(${i})"></button>`
  ).join('');
}

function carouselMove(dir) {
  carouselIndex += dir;
  carouselUpdate();
  resetAutoPlay();
}

function carouselGoTo(i) {
  carouselIndex = i;
  carouselUpdate();
  resetAutoPlay();
}

function startAutoPlay() {
  if (carouselAutoPlayTimer) clearInterval(carouselAutoPlayTimer);
  carouselAutoPlayTimer = setInterval(() => {
    carouselIndex++;
    carouselUpdate();
  }, 3500);
}

function resetAutoPlay() {
  startAutoPlay();
}

const carouselWrapper = document.getElementById('carousel-wrapper');
if (carouselWrapper) {
  carouselWrapper.addEventListener('mouseenter', () => {
    if (carouselAutoPlayTimer) clearInterval(carouselAutoPlayTimer);
  });
  carouselWrapper.addEventListener('mouseleave', () => {
    startAutoPlay();
  });
}

window.addEventListener('resize', carouselUpdate);

// ---- OBSERVER PARA ANIMA├ç├òES DE SCROLL ----
function initObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// ---- HAMB├ÜRGUER MENU TOGGLE ----
const mobileToggle = document.getElementById('mobile-toggle');
const navMenu = document.getElementById('nav-menu');
if (mobileToggle && navMenu) {
  mobileToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    navMenu.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
      closeMenuMobile();
    }
  });
}

// ---- HELPERS ----
function updateCartBadge() {
  const total = cart.reduce((s, c) => s + c.qty, 0);
  const badge = document.getElementById('cart-count-badge');
  if (badge) badge.textContent = total;
}

const MIN_ORDER_DELIVERY = 25;
function checkMinOrder() {
  const banner = document.getElementById('min-order-banner');
  if (!banner) return;
  const tipo = document.getElementById('f-tipo');
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  if (tipo && tipo.value === 'entrega' && total < MIN_ORDER_DELIVERY && cart.length > 0) {
    banner.classList.add('show');
    banner.innerHTML = `ÔÜá´©Å Pedido m├¡nimo para entrega: <strong>R$ ${MIN_ORDER_DELIVERY},00</strong> ┬À Faltam <strong>${fmt(MIN_ORDER_DELIVERY - total)}</strong>`;
  } else {
    banner.classList.remove('show');
  }
}

function showNotif(msg) {
  const n = document.getElementById('notif');
  n.textContent = msg;
  n.classList.add('show');
  setTimeout(() => n.classList.remove('show'), 3000);
}

// ---- CARROSSEL DE FUNDO COM DESFOQUE (HERO BLUR) ----
function initHeroBgCarousel() {
  const slides = document.querySelectorAll('.hero-bg-slide');
  if (slides.length <= 1) return;
  let currentSlide = 0;

  setInterval(() => {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
  }, 4500);
}

function hidePreloader() {
  const pl = document.getElementById('preloader');
  if (pl) pl.classList.add('hide');
}

// Failsafe imediato para esconder o preloader independente do estado do DOM
setTimeout(hidePreloader, 300);

async function initApp() {
  hidePreloader();

  try {
    await loadStoredPricing();
  } catch(e) {
    console.warn('Erro ao carregar dados remotos, usando padr├Áes locais:', e);
  } finally {
    hidePreloader();
    checkStoreStatus();
  }

  try {
    loadCart();
    renderCarouselItems();
    renderOrderGrid('todos');
    renderMenuPage();
    updateCart();
    initObserver();
    initHeroBgCarousel();
    setTimeout(() => {
      carouselUpdate();
      startAutoPlay();
    }, 150);
  } catch(e) {
    console.error('Erro ao renderizar elementos da p├ígina:', e);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
</script>

</body>
</html>
