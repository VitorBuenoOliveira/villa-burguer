const http = require('http');
const crypto = require('crypto');

const BASE_URL = 'http://localhost:4000/api';

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

async function runLiveMpTest() {
  console.log('===================================================================');
  console.log('💳 TESTE DE VALIDAÇÃO MERCADO PAGO API (GET /v1/payments/:id) & WEBHOOK');
  console.log('===================================================================\n');

  // 1. Criar um pedido Pix
  console.log('1. Criando pedido no backend...');
  const orderRes = await request('/orders', {
    method: 'POST',
    body: {
      items: [{ id: 1, name: 'Villa Smash', qty: 1 }],
      type: 'delivery',
      payment: 'pix',
      guestInfo: { name: 'Cliente MP Live', phone: '19988887777', address: 'Rua Teste MP, 100' }
    }
  });

  console.log('   Resultado da criação do pedido:', orderRes.body);
  const orderId = orderRes.body.orderId;

  // 2. Gerar transação Pix via Mercado Pago API
  console.log('\n2. Gerando transação Pix via POST /api/payments/create com credenciais TEST-...');
  const pixRes = await request('/payments/create', {
    method: 'POST',
    body: {
      orderId,
      method: 'pix',
      payerEmail: 'teste_sandbox@villaburguer.com'
    }
  });

  console.log('   Resposta do Gateway:', pixRes.body);
  const gatewayTxId = pixRes.body.gatewayTransactionId;

  const secret = 'villa_burguer_mp_webhook_secret_2026';
  // 3. Teste da Validação de Assinatura HMAC (x-signature) - Rejeição quando inválida
  console.log('\n3. Testando segurança HMAC x-signature (Tentativa com assinatura falsa)...');
  
  const badWebhookRes = await request('/payments/webhook', {
    method: 'POST',
    headers: { 'x-signature': 'ts=12345,v1=hash_invalido_fake' },
    body: { action: 'payment.created', type: 'payment', data: { id: gatewayTxId } }
  });
  console.log(`   Status de resposta com assinatura inválida (esperado 401): ${badWebhookRes.status}`, badWebhookRes.body);

  // 4. Teste de Assinatura Válida com consulta GET /v1/payments/:id na API do Mercado Pago
  console.log('\n4. Disparando Webhook com Assinatura HMAC Legítima...');
  const ts = String(Date.now());
  const xRequestId = `REQ-MP-${Date.now()}`;
  const validSignature = generateMercadoPagoSignature(secret, gatewayTxId, xRequestId, ts);

  const webhookRes = await request('/payments/webhook', {
    method: 'POST',
    headers: {
      'x-signature': validSignature,
      'x-request-id': xRequestId
    },
    body: {
      action: 'payment.created',
      type: 'payment',
      data: { id: gatewayTxId }
    }
  });

  console.log(`   Resposta do Webhook (Status ${webhookRes.status}):`, webhookRes.body);

  // 5. Verificar o banco de dados
  const statusRes = await request(`/payments/${orderId}/status`);
  console.log('\n5. Registro final no Banco de Dados:', statusRes.body);
}

runLiveMpTest();
