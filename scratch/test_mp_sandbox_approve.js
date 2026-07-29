const http = require('http');
const crypto = require('crypto');

const BASE_URL = 'http://localhost:4000/api';
const SECRET = 'villa_burguer_mp_webhook_secret_2026';

async function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    const parsed = new URL(url);
    
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch(e) { json = data; }
        resolve({ status: res.statusCode, body: json });
      });
    });

    req.on('error', reject);
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

function generateMercadoPagoSignature(secret, dataId, xRequestId, ts) {
  let manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  if (!xRequestId) manifest = `id:${dataId};ts:${ts};`;
  const hash = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  return `ts=${ts},v1=${hash}`;
}

async function runEndToEndApprovalTest() {
  console.log('===================================================================');
  console.log('🍔 TESTE FLUXO COMPLETO: CRIÇÃO MP -> APROVAÇÃO -> KDS');
  console.log('===================================================================\n');

  // 1. Autenticar usuário Cozinha/Admin
  console.log('1. Autenticando usuário Cozinha/Admin para obter JWT Token...');
  const loginRes = await request('/login', {
    method: 'POST',
    body: { email: 'admin@villaburguer.com', password: 'villa123' }
  });
  const authToken = loginRes.body.token;
  console.log('   Autenticação realizada com sucesso.');

  // 2. Criar novo pedido
  console.log('\n2. Criando novo pedido no cardápio digital...');
  const orderRes = await request('/orders', {
    method: 'POST',
    body: {
      items: [{ id: 7, name: 'Ribs Burguer', qty: 2 }],
      type: 'delivery',
      payment: 'pix',
      guestInfo: { name: 'Vitor Bueno (Aprovação KDS)', phone: '19998765432', address: 'Rua das Palmeiras, 777' }
    }
  });

  const orderId = orderRes.body.orderId;
  const orderCode = orderRes.body.orderCode;
  console.log(`   Pedido #${orderId} (${orderCode}) criado no valor de R$ ${orderRes.body.total}`);

  // 3. Gerar transação Pix real na API do Mercado Pago
  console.log('\n3. Criando transação Pix na API oficial do Mercado Pago (credenciais TEST-)...');
  const pixRes = await request('/payments/create', {
    method: 'POST',
    body: {
      orderId,
      method: 'pix',
      payerEmail: 'vitor.parra@gmail.com'
    }
  });

  const realMpTxId = pixRes.body.gatewayTransactionId;
  console.log(`   ID de Transação retornado pelo Mercado Pago API: ${realMpTxId}`);
  console.log(`   Status inicial na API do Mercado Pago: '${pixRes.body.status}'`);

  // 4. Simular recebimento do Webhook de APROVAÇÃO do pagamento (status 'approved')
  console.log('\n4. Recebendo Webhook Assinado de Aprovação (status = approved)...');
  const ts = String(Date.now());
  const xRequestId = `REQ-APPROVED-${Date.now()}`;
  const signature = generateMercadoPagoSignature(SECRET, realMpTxId, xRequestId, ts);

  const webhookRes = await request('/payments/webhook', {
    method: 'POST',
    headers: {
      'x-signature': signature,
      'x-request-id': xRequestId
    },
    body: {
      action: 'payment.updated',
      type: 'payment',
      data: { id: realMpTxId, status: 'approved' },
      status: 'approved',
      orderId: orderId
    }
  });

  console.log(`   Resposta do Webhook (HTTP ${webhookRes.status}):`, webhookRes.body);

  // 5. Consultar Banco de Dados Local
  console.log('\n5. Verificando status atualizado do pagamento no banco de dados...');
  const payStatusRes = await request(`/payments/${orderId}/status`);
  console.log('   Registro de Pagamento Atualizado:', payStatusRes.body);

  // 6. Consultar GET /api/orders/kds para confirmar entrada do pedido na fila de preparo da Cozinha
  console.log('\n6. Consultando GET /api/orders/kds (Fila de Preparo da Cozinha)...');
  const kdsRes = await request('/orders/kds', {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });

  const kdsOrders = Array.isArray(kdsRes.body) ? kdsRes.body : [];
  const targetKdsOrder = kdsOrders.find(o => o.id === orderId);

  console.log('\n===================================================================');
  console.log('📊 ENTRADA CONFIRMADA NA TELA DO KDS (COZINHA):');
  if (targetKdsOrder) {
    console.log('✅ SUCESSO COMPLETO: O PEDIDO FOI APROVADO E ENTROU NA FILA DO KDS!');
    console.log('   - ID do Pedido:', targetKdsOrder.id);
    console.log('   - Código de Rastreio:', targetKdsOrder.orderCode);
    console.log('   - Cliente:', targetKdsOrder.clientName);
    console.log('   - Telefone:', targetKdsOrder.clientPhone);
    console.log('   - Endereço:', targetKdsOrder.clientAddress);
    console.log('   - Status do Pedido:', targetKdsOrder.status);
    console.log('   - Itens na Cozinha:', targetKdsOrder.items.map(i => `${i.qty}x ${i.name}`).join(', '));
  } else {
    console.log('❌ Pedido não encontrado no KDS.');
  }
  console.log('===================================================================\n');
}

runEndToEndApprovalTest();
