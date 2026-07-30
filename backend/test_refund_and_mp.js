/**
 * TESTE ESPECÍFICO DE ESTORNO DE PAGAMENTO (POST /api/payments/:id/refund) E WEBHOK MERCADO PAGO
 */
require('dotenv').config();
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

async function runRefundTest() {
  console.log('===================================================================');
  console.log('💳 INICIANDO TESTE DO FLUXO DE ESTORNO & INTEGRAÇÃO MERCADO PAGO');
  console.log('===================================================================\n');

  const SECRET = process.env.MP_WEBHOOK_SECRET || process.env.SECRET_KEY || 'dev_fallback_secret_only_for_local_testing_12345';

  // 1. Logar como Admin
  const adminLogin = await request('/login', {
    method: 'POST',
    body: { email: 'admin@villaburguer.com', password: 'villa123' }
  });
  const adminToken = adminLogin.body.token;

  // 2. Criar um pedido e aprová-lo
  console.log('1. Criando novo pedido Pix no valor de R$ 37,90...');
  const orderRes = await request('/orders', {
    method: 'POST',
    body: {
      items: [{ id: 3, name: 'Bacon Burguer', qty: 1 }],
      type: 'delivery',
      payment: 'pix',
      guestInfo: { name: 'Cliente Estorno Teste', phone: '19966665555', address: 'Rua Estorno, 20' }
    }
  });

  const orderId = orderRes.body.orderId;
  const txId = `PIX-REFUND-${orderId}-${Date.now()}`;
  console.log(`   Pedido #${orderId} (${orderRes.body.orderCode}) gerado.`);

  // 3. Aprovar via Webhook Assinado legítimo
  console.log('2. Aprovando o pagamento via Webhook Assinado do Mercado Pago...');
  const ts = String(Date.now());
  const xRequestId = `REQ-REFUND-${Date.now()}`;
  const validSignature = generateMercadoPagoSignature(SECRET, txId, xRequestId, ts);

  await request('/payments/webhook', {
    method: 'POST',
    headers: { 'x-signature': validSignature, 'x-request-id': xRequestId },
    body: { action: 'payment.created', type: 'payment', data: { id: txId }, status: 'approved', orderId }
  });

  // 4. Consultar o pagamento recém-criado
  const payStatusRes = await request(`/payments/${orderId}/status`);
  const paymentRecord = payStatusRes.body;
  console.log(`   Pagamento #${paymentRecord.id} registrado com status: '${paymentRecord.status}'.\n`);

  // 5. EFETUAR ESTORNO VIA POST /api/payments/:id/refund (ADMIN)
  console.log(`🔹 EXECUTANDO ESTORNO: POST /api/payments/${paymentRecord.id}/refund...`);
  const refundRes = await request(`/payments/${paymentRecord.id}/refund`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });

  console.log(`   STATUS HTTP: ${refundRes.status}`);
  console.log('   (a) RETORNO DA API:');
  console.dir(refundRes.body, { depth: null });

  // 6. Consultar tabela payments para verificar status atualizado
  console.log('\n   (b) STATUS ATUALIZADO NA TABELA payments:');
  const payAfterRefund = await request(`/payments/${orderId}/status`);
  console.dir(payAfterRefund.body, { depth: null });

  // 7. Consultar tabela audit_log para verificar registro do estorno
  console.log('\n   (c) REGISTRO DE AUDITORIA CRIADO EM audit_log:');
  const auditRes = await request('/audit-logs', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  
  const refundAuditEntry = auditRes.body.find(a => a.action === 'payment_refunded' && a.target === `payment:${paymentRecord.id}`);
  console.dir(refundAuditEntry, { depth: null });

  if (refundRes.status === 200 && payAfterRefund.body.status === 'estornado' && refundAuditEntry) {
    console.log('\n✅ SUCESSO ABSOLUTO: O estorno foi efetuado, o status na tabela payments virou "estornado" e o evento foi gravado no audit_log!\n');
  } else {
    console.error('\n❌ FALHA NO TESTE DE ESTORNO!\n');
  }

  console.log('===================================================================');
  console.log('🎉 AUDITORIA DE ESTORNO E PAGAMENTOS CONCLUÍDA');
  console.log('===================================================================\n');
}

runRefundTest();
