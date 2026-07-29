const http = require('http');
const https = require('https');
const { exec } = require('child_process');
const fs = require('fs');

console.log('===================================================================');
console.log('🌐 TESTE 100% ORGANICO DO WEBHOOK MERCADO PAGO VIA INTERNET');
console.log('===================================================================\n');

// 1. Iniciar localtunnel para expor porta 4000
const ltProc = exec('npx localtunnel --port 4000');
let tunnelUrl = '';

ltProc.stdout.on('data', async (data) => {
  const str = data.toString();
  const match = str.match(/https:\/\/[^\s]+/);
  if (match && !tunnelUrl) {
    tunnelUrl = match[0].trim();
    console.log(`✅ TÚNEL PÚBLICO HTTPS ATIVO: ${tunnelUrl}`);
    console.log(`📍 Webhook registrado no MP: ${tunnelUrl}/api/payments/webhook\n`);

    // Atualizar PUBLIC_URL no backend .env e reiniciar backend se necessário
    fs.appendFileSync('backend/.env', `\nPUBLIC_URL=${tunnelUrl}\n`);
    
    // Executar teste de pagamento real no MP
    await triggerRealMercadoPagoOrganicWebhook(tunnelUrl);
  }
});

ltProc.stderr.on('data', (data) => console.log('LT Error:', data.toString()));

async function triggerRealMercadoPagoOrganicWebhook(publicUrl) {
  const MP_TOKEN = 'TEST-3450778340992733-072816-376e22b243561bd57c739c016fee380d-1107428453';
  const { MercadoPagoConfig, Payment } = require('./backend/node_modules/mercadopago');
  
  const client = new MercadoPagoConfig({ accessToken: MP_TOKEN });
  const paymentClient = new Payment(client);

  console.log('1. Disparando requisição à API oficial do Mercado Pago para criar cobrança...');
  console.log(`   Configurando notification_url = "${publicUrl}/api/payments/webhook"`);

  try {
    const mpRes = await paymentClient.create({
      body: {
        transaction_amount: 39.90,
        description: 'Pedido Villa Burguer - Teste Orgânico Webhook',
        payment_method_id: 'pix',
        notification_url: `${publicUrl}/api/payments/webhook`,
        payer: { email: 'vitor.parra@gmail.com' }
      }
    });

    console.log('\n2. Resposta de criação retornada pela API do Mercado Pago:');
    console.log(`   - ID da Transação MP: ${mpRes.id}`);
    console.log(`   - Status Inicial: ${mpRes.status}`);
    console.log(`   - Notification URL: ${mpRes.notification_url}`);

    console.log('\n⏳ Aguardando notificação WEBHOOK ORGÂNICA enviada pelos servidores do Mercado Pago pela internet...');
    console.log('   (Os servidores do MP enviarão um POST HTTPS para ' + publicUrl + '/api/payments/webhook nas próximas linhas)\n');
  } catch (err) {
    console.error('Erro na API Mercado Pago:', err);
  }
}
