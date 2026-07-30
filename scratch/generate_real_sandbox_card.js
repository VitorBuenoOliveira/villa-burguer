const http = require('http');
const https = require('https');
const path = require('path');
require(path.join(__dirname, '../backend/node_modules/dotenv')).config({ path: path.join(__dirname, '../backend/.env') });
const { MercadoPagoConfig, CardToken, Payment } = require(path.join(__dirname, '../backend/node_modules/mercadopago'));

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

async function runApprovedCardTest() {
  console.log('===================================================================');
  console.log('💳 TESTE DE PAGAMENTO DE CARTÃO SANDBOX (APROVAÇÃO REAL MP)');
  console.log('===================================================================\n');

  // 1. Criar pedido real
  console.log('1. Criando pedido no restaurante...');
  const orderRes = await request('/orders', {
    method: 'POST',
    body: {
      items: [{ id: 1, name: 'Classic Burguer', qty: 1 }],
      type: 'delivery',
      payment: 'credit',
      guestInfo: { name: 'Cliente Cartão Aprovado', phone: '19988887777', address: 'Rua Teste MP, 50' }
    }
  });

  const orderId = orderRes.body.orderId;
  const orderCode = orderRes.body.orderCode;
  console.log(`   Pedido criado: #${orderId} (${orderCode}) - Total: R$ ${orderRes.body.total}`);

  // 2. Usar SDK do Mercado Pago para gerar Token de Cartão de Teste (APRO)
  console.log('\n2. Gerando Token de Cartão de Teste com o nome "APRO"...');
  const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
  const cardTokenClient = new CardToken(client);

  try {
    const tokenRes = await cardTokenClient.create({
      body: {
        card_number: '4242424242424242',
        expiration_month: '11',
        expiration_year: '2028',
        security_code: '123',
        cardholder: {
          name: 'APRO',
          identification: { type: 'CPF', number: '19119119100' }
        }
      }
    });

    const cardTokenId = tokenRes.id;
    console.log(`   Card Token gerado no Mercado Pago: ${cardTokenId}`);

    // 3. Processar pagamento via API do Mercado Pago
    console.log('\n3. Processando cobrança de Cartão de Crédito no Mercado Pago...');
    const paymentClient = new Payment(client);
    const mpPayment = await paymentClient.create({
      body: {
        transaction_amount: orderRes.body.total,
        token: cardTokenId,
        description: `Pedido ${orderCode} - Villa Burguer`,
        installments: 1,
        payment_method_id: 'visa',
        payer: {
          email: 'comprador_teste_sandbox@villaburguer.com',
          identification: { type: 'CPF', number: '19119119100' }
        }
      }
    });

    console.log('\n===================================================================');
    console.log('💳 RESPOSTA DA API OFICIAL DO MERCADO PAGO:');
    console.log('   - ID da Transação MP (gatewayTransactionId):', mpPayment.id);
    console.log('   - Status Real da Transação na API MP:', mpPayment.status);
    console.log('   - Detalhe do Status:', mpPayment.status_detail);
    console.log('===================================================================\n');

    return { orderId, orderCode, mpTxId: String(mpPayment.id), status: mpPayment.status };
  } catch (err) {
    console.error('Erro ao processar cartão na API do Mercado Pago:', err.message || err);
    if (err.cause) console.error('Causa:', JSON.stringify(err.cause, null, 2));
  }
}

runApprovedCardTest();
