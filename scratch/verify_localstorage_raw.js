const store = {};
global.localStorage = {
  getItem: (key) => store[key] !== undefined ? store[key] : null,
  setItem: (key, val) => { store[key] = String(val); },
  removeItem: (key) => { delete store[key]; }
};

// 1. Simula a gravação do token no checkout (index.html:752)
const trackPayload = { code: 'VB-4207', token: 'aae24a1b-55c2-429b-aa20-c20821003de3' };
localStorage.setItem('guest_order_token', JSON.stringify(trackPayload));

console.log('--------------------------------------------------');
console.log('> localStorage.getItem("guest_order_token") [ANTES DE CLICAR]');
console.log(localStorage.getItem('guest_order_token'));
console.log('--------------------------------------------------');

// 2. Função de limpeza idêntica a index.html (linha 1123)
function clearTrackSession() {
  localStorage.removeItem('guest_order_token');
  localStorage.removeItem('villaburguer_active_order');
}

clearTrackSession();

console.log('> localStorage.getItem("guest_order_token") [DEPOIS DE CLICAR]');
console.log(localStorage.getItem('guest_order_token'));
console.log('--------------------------------------------------');
