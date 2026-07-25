const API_URL = (window.location.port === '4000') ? '/api' : 'http://localhost:4000/api';
let VILLA_BURG_PRICING = {};
let storeStatusOverride = 'auto';
let storeWhatsAppPhone = '5519981242105';
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

async function loadStoredPricing() {
  try {
    const res = await fetch(`${API_URL}/products`);
    if (res.ok) {
      VILLA_BURG_PRICING = await res.json();
    }
    
    await loadStoreSettings();

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
  } catch(e) {
    console.error('Erro ao carregar produtos do servidor:', e);
  }
}

async function loadStoreSettings() {
  try {
    const res = await fetch(`${API_URL}/settings`);
    if (res.ok) {
      const data = await res.json();
      if (data.whatsapp_phone) {
        storeWhatsAppPhone = data.whatsapp_phone;
        const wppInp = document.getElementById('admin-wpp-phone');
        if (wppInp) wppInp.value = storeWhatsAppPhone;
        const wppLink = document.getElementById('wpp-float-link');
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
  if (!phone) { alert('Informe um número de WhatsApp válido (apenas números com DDD).'); return; }

  try {
    const res = await fetch(`${API_URL}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.token}` },
      body: JSON.stringify({ whatsapp_phone: phone })
    });
    if (res.ok) {
      storeWhatsAppPhone = phone;
      const wppLink = document.getElementById('wpp-float-link');
      if (wppLink) wppLink.href = `https://wa.me/${storeWhatsAppPhone}`;
      showNotif('Número do WhatsApp da loja atualizado com sucesso! 📱');
    } else {
      alert('Erro ao salvar número do WhatsApp.');
    }
  } catch (e) {
    alert('Erro de conexão ao salvar configuração.');
  }
}

function saveStoredPricing() {
  localStorage.setItem('villaburguer_store_override_v1', storeStatusOverride);
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

function getAllItems() {
  let all = [];
  if (VILLA_BURG_PRICING && typeof VILLA_BURG_PRICING === 'object') {
    Object.keys(VILLA_BURG_PRICING).forEach(key => {
      if (Array.isArray(VILLA_BURG_PRICING[key])) {
        all = all.concat(VILLA_BURG_PRICING[key].filter(i => i.active !== false));
      }
    });
  }
  return all;
}

let cart = [];
let selectedCombo = {};

function fmt(val) {
  return 'R$ ' + parseFloat(val).toFixed(2).replace('.', ',');
}

// ---- NAVEGAÇÃO SPA ----
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
      showNotif('🔒 Acesso exclusivo ao Administrador. Faça login para acessar.');
      return;
    }
    renderAdminDashboard();
  }
  initObserver();
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
      document.getElementById('logged-user-name').textContent = 'Olá, ' + currentUser.name + '!';
      document.getElementById('logged-user-email').textContent = currentUser.email;
      document.getElementById('logged-user-tel').textContent = currentUser.tel || 'Não informado';
      document.getElementById('logged-user-end').textContent = currentUser.address || 'Não informado';
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
      showNotif('Bem-vindo ao Painel do Proprietário! 👑');
    } else {
      showNotif('Login realizado com sucesso! Olá, ' + currentUser.name + ' 👋');
      await loadUserOrders();
    }
  } catch(e) {
    alert('Erro de conexão com o servidor.');
  }
}

async function processUserSignup() {
  const name = document.getElementById('usign-name').value.trim();
  const tel = document.getElementById('usign-tel').value.trim();
  const email = document.getElementById('usign-email').value.trim().toLowerCase();
  const pass = document.getElementById('usign-pass').value.trim();
  const address = document.getElementById('usign-end').value.trim();

  if (!name || !tel || !email || !pass) {
    alert('Por favor, preencha os campos obrigatórios (Nome, Tel, Email e Senha).');
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
    showNotif('Conta criada com sucesso! Seja bem-vindo, ' + name + '! 🎉');
  } catch(e) {
    alert('Erro de conexão com o servidor.');
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
    alert('A nova senha deve ter no mínimo 6 caracteres.');
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
    alert('Senha alterada com sucesso! 🔐');
    document.getElementById('chg-curr-pwd').value = '';
    document.getElementById('chg-new-pwd').value = '';
    document.getElementById('pwd-change-box').style.display = 'none';
  } catch (e) {
    alert('Erro de conexão ao alterar senha.');
  }
}

function logoutUser() {
  currentUser = null;
  localStorage.removeItem('villaburguer_current_user_v1');
  updateUserNavUI();
  closeUserModal();
  showPage('home');
  showNotif('Você deslogou da sua conta.');
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
      btn.textContent = '👤 Olá, ' + currentUser.name.split(' ')[0];
    }
  } else {
    btn.style.display = 'block';
    navAdmin.style.display = 'none';
    navLogout.style.display = 'none';
    btn.textContent = '👤 Entrar / Cadastrar';
  }
}

// ---- DASHBOARD ADMIN ENGINE ----
// ---- DASHBOARD ADMIN ENGINE ----
async function renderAdminDashboard() {
  if (!VILLA_BURG_PRICING || Object.keys(VILLA_BURG_PRICING).length === 0) {
    await loadStoredPricing();
  }

  let allItems = getAllItems();
  if (allItems.length === 0) {
    await loadStoredPricing();
    allItems = getAllItems();
  }

  const activeProd = allItems.filter(i => i.active !== false).length;
  const featuredProd = allItems.filter(i => i.active !== false && i.featured).length;
  const avgPrice = allItems.reduce((acc, i) => acc + i.base, 0) / (allItems.length || 1);

  document.getElementById('kpi-total-prod').textContent = activeProd;
  document.getElementById('kpi-total-feat').textContent = `${featuredProd} / 6`;
  document.getElementById('kpi-avg-price').textContent = fmt(avgPrice);

  const statusKpi = document.getElementById('kpi-store-status');
  if (storeStatusOverride === 'open') {
    statusKpi.textContent = 'ABERTO 🟢';
    statusKpi.style.color = '#388E3C';
  } else if (storeStatusOverride === 'closed') {
    statusKpi.textContent = 'FECHADO 🔴';
    statusKpi.style.color = '#D32F2F';
  } else {
    statusKpi.textContent = 'AUTO ⏱️';
    statusKpi.style.color = '#E65100';
  }

  document.getElementById('admin-store-override').value = storeStatusOverride;

  const wppInp = document.getElementById('admin-wpp-phone');
  if (wppInp) wppInp.value = storeWhatsAppPhone;

  const tbody = document.getElementById('admin-products-table');
  if (!tbody) return;

  const catNames = {
    'hamburgueres': '🍔 Hambúrguer',
    'combos2x': '👑 Combo 2x',
    'porcoes': '🍟 Porção',
    'bebidas': '🥤 Bebida',
    'sobremesa': '🍮 Sobremesa',
    'adicional': '➕ Adicional'
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
          <button style="background:#FFF8E1; color:#F57F17; border:1.5px solid #FFD54F; padding:0.45rem 0.8rem; border-radius:20px; font-weight:800; font-size:0.82rem; cursor:pointer; transition:transform 0.15s;" onclick="toggleProductFeaturedFromAdmin(${item.id}, false)">⭐ Na Capa</button>
        ` : `
          <button style="background:#FAFAFA; color:#777; border:1.5px solid #E0E0E0; padding:0.45rem 0.8rem; border-radius:20px; font-weight:700; font-size:0.82rem; cursor:pointer; transition:transform 0.15s;" onclick="toggleProductFeaturedFromAdmin(${item.id}, true)">☆ Colocar na Capa</button>
        `}
      </td>
      <td style="padding:0.75rem 0.8rem; text-align:center;">
        ${item.active !== false ? `
          <button style="background:#E8F5E9; color:#2E7D32; border:1.5px solid #81C784; padding:0.45rem 0.85rem; border-radius:20px; font-weight:800; font-size:0.82rem; cursor:pointer; transition:transform 0.15s;" onclick="toggleProductActiveFromAdmin(${item.id}, false)">🟢 À Venda</button>
        ` : `
          <button style="background:#FFEBEE; color:#C62828; border:1.5px solid #EF9A9A; padding:0.45rem 0.85rem; border-radius:20px; font-weight:800; font-size:0.82rem; cursor:pointer; transition:transform 0.15s;" onclick="toggleProductActiveFromAdmin(${item.id}, true)">🔴 Pausado (Esgotado)</button>
        `}
      </td>
      <td style="padding:0.75rem 0.8rem; text-align:center;">
        <div style="display:flex; gap:0.4rem; justify-content:center;">
          <button class="add-btn-sm" style="background:#0288D1; padding:0.45rem 0.85rem; font-size:0.82rem; border-radius:6px; font-weight:800;" onclick="openEditProdModal(${item.id})">✏️ EDITAR</button>
          <button class="add-btn-sm" style="background:#D32F2F; padding:0.45rem 0.65rem; font-size:0.82rem; border-radius:6px;" onclick="deleteProductFromAdmin(${item.id})">🗑️</button>
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
      alert('⚠️ Limite atingido! O carrossel da capa aceita no máximo 6 produtos em destaque ao mesmo tempo. Desmarque um produto da capa antes de adicionar este.');
      return;
    }
  }

  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.token}` },
      body: JSON.stringify({ featured: newFeatured })
    });
    if (res.ok) {
      await loadStoredPricing();
      renderCarouselItems();
      renderOrderGrid('todos');
      renderMenuPage();
      renderAdminDashboard();
      showNotif(newFeatured ? `"${name}" colocado na capa! ⭐` : `"${name}" removido da capa!`);
    } else {
      alert('Erro ao alterar destaques.');
    }
  } catch (e) {
    alert('Erro de conexão ao alterar destaque.');
  }
}

async function toggleProductActiveFromAdmin(id, newActive) {
  if (!currentUser || !currentUser.isAdmin) return;
  const allItems = getAllItems();
  const item = allItems.find(i => String(i.id) === String(id));
  const name = item ? item.name : 'Produto';

  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.token}` },
      body: JSON.stringify({ active: newActive })
    });
    if (res.ok) {
      await loadStoredPricing();
      renderCarouselItems();
      renderOrderGrid('todos');
      renderMenuPage();
      renderAdminDashboard();
      showNotif(newActive ? `"${name}" ativado para venda! 🟢` : `"${name}" pausado (esgotado)! 🔴`);
    } else {
      alert('Erro ao alterar status do produto.');
    }
  } catch (e) {
    alert('Erro de conexão ao alterar status.');
  }
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
  const allItems = getAllItems();
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
    alert('Informe ao menos o Nome e o Preço Base.');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.token}` },
      body: JSON.stringify({ cat, name, desc, base, comboAdd, tag: tag || null, img, featured, active })
    });
    if (res.ok) {
      closeEditProdModal();
      await loadStoredPricing();
      renderCarouselItems();
      renderOrderGrid('todos');
      renderMenuPage();
      renderAdminDashboard();
      showNotif(`Produto "${name}" atualizado com sucesso! 💾`);
    } else {
      alert('Erro ao atualizar produto.');
    }
  } catch (e) {
    alert('Erro de conexão ao atualizar produto.');
  }
}

async function deleteProductFromAdmin(id) {
  if (!currentUser || !currentUser.isAdmin) return;
  const allItems = getAllItems();
  const item = allItems.find(i => String(i.id) === String(id));
  const itemName = item ? item.name : 'este produto';

  if (!confirm(`Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`)) return;

  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${currentUser.token}` }
    });
    if (res.ok) {
      closeEditProdModal();
      await loadStoredPricing();
      renderCarouselItems();
      renderOrderGrid('todos');
      renderMenuPage();
      renderAdminDashboard();
      showNotif(`Produto "${itemName}" excluído com sucesso! 🗑️`);
    } else {
      alert('Erro ao excluir produto.');
    }
  } catch (e) {
    alert('Erro de conexão ao excluir produto.');
  }
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
      showNotif('Foto carregada com sucesso! 📷');
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
  if (hasError) alert('Alguns produtos não puderam ser salvos.');
  else showNotif(`${savedCount} produtos salvos com sucesso! 💾`);
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
    alert('Por favor, preencha Nome e Preço Base.');
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
      showNotif('Novo produto "' + name + '" cadastrado no cardápio! 🚀');
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
    list.innerHTML = '<p style="color:red;">Erro ao buscar histórico.</p>';
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
    showNotif('Dados recarregados do servidor com sucesso! 🔄');
  }
}

// ---- RENDERIZAÇÃO DO CARDÁPIO ----
function renderMenuPage() {
  const container = document.getElementById('menu-content-container');
  let html = '';
  
  const categories = [
    { key: 'hamburgueres', title: '🍔 Hambúrgueres Artesanais' },
    { key: 'combos2x', title: '👑 Combos 2x' },
    { key: 'porcoes', title: '🍟 Porções Porcionadas' },
    { key: 'bebidas', title: '🥤 Bebidas Geladas' },
    { key: 'sobremesa', title: '🍮 Sobremesas' },
    { key: 'adicional', title: '➕ Adicionais' }
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

// ---- GRADE DE PRODUTOS DINÂMICA ----
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
            <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
            <span class="qty-num" id="qty-${item.id}">0</span>
            <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
          </div>
        </div>

        <button class="item-obs-toggle" onclick="toggleItemObs(${item.id})">+ Observação</button>
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
  showNotif('Item adicionado ao carrinho! 🛒');
}

function updateCart() {
  const container = document.getElementById('cart-items');
  const btn = document.getElementById('whatsapp-btn');
  const totalEl = document.getElementById('cart-total');

  const mbar = document.getElementById('mobile-cart-bar');
  const mcount = document.getElementById('mcart-count');
  const mtotal = document.getElementById('mcart-total');

  if (cart.length === 0) {
    container.innerHTML = `<div class="cart-empty"><span style="font-size:2.4rem; display:block; margin-bottom:0.4rem;">🛒</span>Seu carrinho está vazio</div>`;
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
      <button class="cart-item-remove" onclick="removeCartItem(${c.id})">✕</button>
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
  const obsGeral = document.getElementById('obs-input').value.trim();

  if (!nome) { alert('Por favor, informe seu nome.'); return; }
  if (!tel) { alert('Por favor, informe seu WhatsApp.'); return; }
  if (tipo === 'entrega' && !end) { alert('Por favor, informe o endereço de entrega.'); return; }

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
      console.error('Falha ao salvar no histórico', e);
    }
  }

  let msg = `🍔 *NOVO PEDIDO - VILLA BURGUER*\n\n`;
  msg += `👤 *Nome:* ${nome}\n`;
  msg += `📞 *WhatsApp:* ${tel}\n`;
  msg += tipo === 'entrega' ? `🛵 *Entrega em:* ${end}\n` : `🏪 *Retirada no local*\n`;
  msg += `💳 *Pagamento:* ${pag}\n`;
  msg += `------------------\n`;
  msg += `📋 *ITENS DO PEDIDO:*\n`;

  cart.forEach(c => {
    const itemObs = getItemObs(c.id);
    msg += `• ${c.qty}x ${c.name} — ${fmt(c.price * c.qty)}`;
    if (itemObs) msg += ` _(Obs: ${itemObs})_`;
    msg += `\n`;
  });

  msg += `------------------\n`;
  msg += `💰 *TOTAL: ${fmt(total)}*`;
  if (obsGeral) msg += `\n\n📝 *Obs Geral:* ${obsGeral}`;
  msg += `\n\n_Pedido gerado via site Villa Burguer_`;

  const orderSnapshot = [...cart];
  const orderTotal = total;

  window.open(`https://wa.me/${storeWhatsAppPhone}?text=${encodeURIComponent(msg)}`, '_blank');

  cart = [];
  selectedCombo = {};
  clearAllStorage();
  document.getElementById('obs-input').value = '';
  closeModal();
  updateCart();

  showThankYou(orderSnapshot, orderTotal);
}

function showThankYou(items, total) {
  const summary = document.getElementById('thanks-summary');
  if (summary) {
    summary.innerHTML = `<h4 style="font-family:'Bebas Neue'; font-size:1.5rem; color:var(--primary-orange); margin-bottom:0.6rem;">RESUMO DO PEDIDO</h4>` +
      items.map(c => `<div style="display:flex; justify-content:space-between; font-size:0.92rem; margin-bottom:0.4rem;"><span>${c.qty}x ${escapeHTML(c.name)}</span><strong>${fmt(c.price * c.qty)}</strong></div>`).join('') +
      `<div style="display:flex; justify-content:space-between; font-weight:700; font-size:1.15rem; border-top:2px solid var(--border-color); padding-top:0.5rem; margin-top:0.8rem; color:var(--primary-orange);"><span>TOTAL</span><span>${fmt(total)}</span></div>`;
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

// ---- STATUS DA LOJA AUTOMÁTICO ----
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
    text.textContent = `🟢 Aberto Agora! (Status forçado pelo administrador)`;
    return;
  }
  if (storeStatusOverride === 'closed') {
    bar.className = 'store-status-bar closed';
    text.textContent = `🟠 Fechado Agora (Pausa solicitada pela gerência)`;
    return;
  }

  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours() + now.getMinutes() / 60;
  const hours = STORE_HOURS[day];
  const isOpen = hour >= hours.open && hour < hours.close;

  if (isOpen) {
    bar.className = 'store-status-bar open';
    text.textContent = `🟢 Aberto Agora! Fechamos às ${hours.close}h`;
  } else {
    bar.className = 'store-status-bar closed';
    text.textContent = `🟠 Fechado Agora · Abrimos hoje às ${hours.open}h`;
  }
}

// ---- CARROSSEL DA HOME COM AUTOPLAY ----
let carouselIndex = 0;
let carouselAutoPlayTimer = null;

function renderCarouselItems() {
  const track = document.getElementById('carousel-track');
  if (!track) return;

  const allItems = getAllItems();
  const items = allItems.filter(i => i.active !== false && i.featured);

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

// ---- OBSERVER PARA ANIMAÇÕES DE SCROLL ----
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

// ---- HAMBÚRGUER MENU TOGGLE ----
const mobileToggle = document.getElementById('mobile-toggle');
const navMenu = document.getElementById('nav-menu');

if (mobileToggle && navMenu) {
  mobileToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
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
    banner.innerHTML = `⚠️ Pedido mínimo para entrega: <strong>R$ ${MIN_ORDER_DELIVERY},00</strong> · Faltam <strong>${fmt(MIN_ORDER_DELIVERY - total)}</strong>`;
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

// ---- INICIALIZAÇÃO ----
document.addEventListener('DOMContentLoaded', async () => {
  await loadStoredPricing();
  setTimeout(() => {
    const pl = document.getElementById('preloader');
    if (pl) pl.classList.add('hide');
    checkStoreStatus();
  }, 1000);

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
});
</script>
