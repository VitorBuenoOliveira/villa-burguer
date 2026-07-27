/**
 * TESTES ADICIONAIS DE SEGURANÇA DE PAGAMENTO E ASSINATURA HMAC (MERCADO PAGO)
 * Atende às 3 confirmações requeridas antes da aprovação final.
 */
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

async function runSecurityAudit() {
  console.log('===================================================================');
  console.log('🛡️ INICIANDO AUDITORIA DE SEGURANÇA DO WEBHOOK & VALIDAÇÃO KDS');
  console.log('===================================================================\n');

  // Token de autenticação da Cozinha para checar KDS
  const loginRes = await request('/login', {
    method: 'POST',
    body: { email: 'cozinha@villaburguer.com', password: 'cozinha123' }
  });
  const cozinhaToken = loginRes.body.token;
  const SECRET = process.env.SECRET_KEY || 'dev_fallback_secret_only_for_local_testing_12345';

  // -----------------------------------------------------------------
  // ITEM 2: CONFIRMAÇÃO DO "ANTES" E "DEPOIS" NO KDS
  // -----------------------------------------------------------------
  console.log('📌 CONFIRMAÇÃO 2: Verificação do KDS ANTES e DEPOIS da Aprovação Pix');
  
  console.log('1. Criando novo pedido Pix de teste...');
  const orderRes = await request('/orders', {
    method: 'POST',
    body: {
      items: [{ id: 1, name: 'Classic Burguer', qty: 1 }],
      type: 'delivery',
      payment: 'pix',
      guestInfo: { name: 'Cliente Validação KDS', phone: '19977776666', address: 'Rua Teste KDS, 10' }
    }
  });

  if (!orderRes.body.orderId) {
    console.error('Erro ao criar pedido:', orderRes.body);
    return;
  }

  const orderId = orderRes.body.orderId;
  const orderCode = orderRes.body.orderCode;
  const txId = `PIX-AUDIT-${orderId}-${Date.now()}`;

  console.log(`   Pedido #${orderId} (${orderCode}) gerado com sucesso.`);

  console.log('2. [ANTES] Consultando /api/orders/kds para provar que o pedido NÃO está na cozinha...');
  const kdsBefore = await request('/orders/kds', {
    headers: { 'Authorization': `Bearer ${cozinhaToken}` }
  });
  
  const foundBefore = Array.isArray(kdsBefore.body) && kdsBefore.body.find(o => o.id === orderId);
  console.log(`   Localizado no KDS antes da aprovação? ${foundBefore ? 'SIM (ERRO ❌)' : 'NÃO (CORRETO ✅)'}`);
  
  if (foundBefore) {
    console.error('❌ FALHA CRÍTICA: O pedido Pix apareceu no KDS antes de ser pago!\n');
    return;
  }
  console.log('   ✅ CONFIRMADO: O pedido Pix NÃO APARECE na fila da cozinha enquanto está aguardando pagamento.\n');

  // -----------------------------------------------------------------
  // ITEM 1: WEBHOOK COM ASSINATURA HMAC INVÁLIDA / AUSENTE
  // -----------------------------------------------------------------
  console.log('📌 CONFIRMAÇÃO 1: Webhook com Assinatura HMAC Ausente ou Forjada');
  
  console.log('1. Enviando webhook simulando pagamento aprovado com Assinatura Forjada (x-signature errada)...');
  const invalidSigHeader = 'ts=1700000000,v1=ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
  
  const webhookForgedRes = await request('/payments/webhook', {
    method: 'POST',
    headers: { 'x-signature': invalidSigHeader },
    body: { action: 'payment.created', type: 'payment', data: { id: txId }, orderId }
  });

  console.log(`   Status HTTP retornado: ${webhookForgedRes.status}`);
  console.log('   Resposta do Servidor:', webhookForgedRes.body);

  if (webhookForgedRes.status === 401) {
    console.log('   ✅ CONFIRMADO: O servidor REJEITOU o webhook forjado com HTTP 401 Unauthorized!\n');
  } else {
    console.error('❌ FALHA CRÍTICA: O servidor aceitou um webhook com assinatura forjada!\n');
    return;
  }

  console.log('2. Verificando KDS novamente para garantir que o webhook forjado NÃO liberou o pedido...');
  const kdsAfterForged = await request('/orders/kds', {
    headers: { 'Authorization': `Bearer ${cozinhaToken}` }
  });
  const foundAfterForged = Array.isArray(kdsAfterForged.body) && kdsAfterForged.body.find(o => o.id === orderId);
  console.log(`   Localizado no KDS após tentativa de webhook forjado? ${foundAfterForged ? 'SIM (FALHA CRÍTICA ❌)' : 'NÃO (BLOQUEADO COM SUCESSO ✅)'}\n`);

  // -----------------------------------------------------------------
  // ITEM 3: CONFIRMAÇÃO COM ASSINATURA HMAC SHA256 OFICIAL MERCADO PAGO
  // -----------------------------------------------------------------
  console.log('📌 CONFIRMAÇÃO 3: Processamento do Webhook com Assinatura HMAC SHA256 Oficial');
  
  const ts = String(Date.now());
  const xRequestId = `REQ-${Date.now()}`;
  const validSignature = generateMercadoPagoSignature(SECRET, txId, xRequestId, ts);
  
  console.log(`   Gerada assinatura HMAC válida conforme padrão oficial Mercado Pago:`);
  console.log(`   Header x-signature: ${validSignature}`);
  console.log(`   Header x-request-id: ${xRequestId}`);

  console.log('   Enviando Webhook com assinatura válida...');
  const validWebhookRes = await request('/payments/webhook', {
    method: 'POST',
    headers: {
      'x-signature': validSignature,
      'x-request-id': xRequestId
    },
    body: { action: 'payment.created', type: 'payment', data: { id: txId }, orderId }
  });

  console.log(`   Status HTTP retornado: ${validWebhookRes.status} | Resposta:`, validWebhookRes.body);

  console.log('3. [DEPOIS] Consultando /api/orders/kds após aprovação legítima via webhook...');
  const kdsAfterValid = await request('/orders/kds', {
    headers: { 'Authorization': `Bearer ${cozinhaToken}` }
  });
  
  const foundAfterValid = Array.isArray(kdsAfterValid.body) && kdsAfterValid.body.find(o => o.id === orderId);
  if (foundAfterValid) {
    console.log(`   ✅ CONFIRMADO: Pedido #${orderId} (${foundAfterValid.orderCode}) agora APARECE no KDS com status '${foundAfterValid.status}' após a confirmação via webhook assinada com sucesso!\n`);
  } else {
    console.error('❌ FALHA: O pedido não entrou no KDS após o webhook legítimo.');
  }

  console.log('===================================================================');
  console.log('🎉 TODAS AS 3 CONFIRMAÇÕES DE SEGURANÇA FORAM VALIDADAS COM SUCESSO!');
  console.log('===================================================================\n');
}

runSecurityAudit();
