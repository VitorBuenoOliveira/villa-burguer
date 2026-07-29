const http = require('http');

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

async function createRealSandboxPix() {
  console.log('1. Criando novo pedido real no restaurante...');
  const orderRes = await request('/orders', {
    method: 'POST',
    body: {
      items: [{ id: 7, name: 'Ribs Burguer', qty: 1 }],
      type: 'delivery',
      payment: 'pix',
      guestInfo: { name: 'Vitor (Teste Real MP)', phone: '19998765432', address: 'Rua Principal, 100' }
    }
  });

  const orderId = orderRes.body.orderId;
  const orderCode = orderRes.body.orderCode;

  console.log(`   Pedido criado: #${orderId} (${orderCode}) no valor de R$ ${orderRes.body.total}`);

  console.log('\n2. Solicitando criação de cobrança Pix na API do Mercado Pago (TEST-)...');
  const pixRes = await request('/payments/create', {
    method: 'POST',
    body: {
      orderId,
      method: 'pix',
      payerEmail: 'vitor.parra@gmail.com'
    }
  });

  console.log('\n===================================================================');
  console.log('💳 COBRANÇA PIX REAL CRIADA NA INFRAESTRUTURA DO MERCADO PAGO:');
  console.log('   - ID do Pedido Local:', orderId);
  console.log('   - Código de Rastreio:', orderCode);
  console.log('   - ID da Transação MP (gatewayTransactionId):', pixRes.body.gatewayTransactionId);
  console.log('   - Status Inicial MP:', pixRes.body.status);
  console.log('===================================================================\n');
}

createRealSandboxPix();
