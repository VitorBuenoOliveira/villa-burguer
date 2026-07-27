# 🍔 Villa Burguer – Sistema Interno de Pedidos em Tempo Real, KDS & Pagamentos Online

O **Villa Burguer** é um sistema completo (*Full-Stack Single Page Application*) de pedidos em tempo real desenvolvido para hamburguerias artesanais, restaurantes e redes de delivery. 

O sistema substitui fluxos baseados em atendimento via WhatsApp por um ambiente automatizado com **Cardápio Digital com Checkout Pix/Cartão Tokenizado**, **Painel de Cozinha (KDS FIFO)**, **Painel de Entregadores (Motoboy)**, **Rastreamento em Tempo Real** e **Painel Administrativo com RBAC e Auditoria**.

---

## 🌟 Módulos e Funcionalidades

### 📱 1. Loja & Cardápio Digital (Cliente Logado ou Convidado)
- **Checkout Flexível**: Permite pedidos tanto por clientes cadastrados quanto convidados.
- **Validação Rigorosa de Preços no Backend**: Todos os preços de itens, adicionais e combos são recalculados no servidor em centavos (`amount = Math.round(total * 100)`). Nunca confia em valores vindos do frontend.
- **Pagamentos Integrados (Mercado Pago API v2)**:
  - **Pix**: Geração de QR Code e Copia e Cola via API com confirmação via Webhook assinado.
  - **Cartão (Crédito/Débito)**: Tokenização direta no navegador via SDK do gateway (em conformidade com PCI-DSS).
  - **Pagamento na Entrega**: Opção paralela explícita para pagamento presencial.
- **Tokens não previsíveis**: Geração de `orderCode` público (ex: `VB-9042`) e `trackingToken` (UUID v4 criptográfico) para acesso seguro à tela de acompanhamento.

### 🍳 2. KDS (Kitchen Display System — Cozinha)
- **Fila Estrita FIFO**: Exibição dos pedidos ordenados cronologicamente (mais antigos primeiro).
- **Indicador de Tempo Decorrido em Cores**:
  - 🟢 **0-15 min**: Normal
  - 🟡 **15-30 min**: Atenção
  - 🟠 **30-45 min**: Urgente
  - 🔴 **>45 min**: Atrasado
- **Destaque Visual para Observações**: Modificações e remoção de ingredientes destacados no ticket.
- **Notificação Sonora & Tempo Real**: WebSockets (Socket.io) com bipe de áudio sintético automático a cada novo pedido pago ou na entrega.

### 🛵 3. Painel do Motoboy
- Visualização exclusiva de pedidos prontos para saída e em trânsito.
- Baixa rápida de entregas concluídas.

### 👑 4. Painel Administrativo & Controle de Acesso (RBAC)
- **Cargos (RBAC)**: `cliente`, `cozinha`, `motoboy`, `admin`.
- **Logs de Auditoria (`audit_log`)**: Registro imutável de alterações de cargo de usuários, cancelamentos de pedidos (com motivo obrigatório) e atualizações de produtos/preços.
- **Relatório Financeiro**: Métrica de receita bruta em centavos e reais, contagem de pedidos e produtos mais vendidos.

---

## 🛡️ Requisitos Obrigatórios de Segurança (Pronto para Produção)

1. **JWT `SECRET_KEY` Obrigatória**:
   - Em produção (`NODE_ENV=production`), se a variável `SECRET_KEY` não for informada no arquivo `.env` ou contiver valor padrão, o servidor recusa iniciar (`process.exit(1)`).
2. **Rota de Rastreio Protegida (`GET /api/orders/track/:orderCode`)**:
   - Exige o token criptográfico `trackingToken` + Rate limiting dedicado (30 req/min).
3. **Webhooks Idempotentes e Assinados**:
   - A rota `POST /api/payments/webhook` valida a assinatura HMAC e impede cobranças ou edições duplicadas.
4. **HTTPS Obrigatório em Produção (Hostinger / VPS)**:
   - Em produção, a aplicação deve rodar sob **HTTPS** (Nginx/Apache com SSL Let's Encrypt / Certbot).
   - *Por quê?* O gateway do Mercado Pago recusa enviar notificações de Webhook para URLs `http://` inseguras. Além disso, cookies de sessão marcados como `Secure` e tokens JWT exigem canal criptografado.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js v18 ou superior instalado.

### Passo a Passo

1. **Acessar o diretório do backend**:
   ```bash
   cd backend
   ```

2. **Configurar as Variáveis de Ambiente**:
   Copie o arquivo de demonstração `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```
   *Abra o `.env` e defina uma `SECRET_KEY` forte e suas credenciais do Mercado Pago.*

3. **Instalar as dependências**:
   ```bash
   npm install
   ```

4. **Iniciar o servidor com migrações automáticas**:
   ```bash
   npm start
   ```

5. **Acessar no navegador**:
   Abra: `http://localhost:4000`

---

## 🔑 Credenciais Padrão para Testes

| Perfil | E-mail | Senha | Cargo |
|---|---|---|---|
| 👑 **Administrador Master** | `admin@villaburguer.com` | `villa123` | `admin` |
| 🍳 **Cozinha (Chef)** | `cozinha@villaburguer.com` | `cozinha123` | `cozinha` |
| 🛵 **Motoboy (Entregador)** | `motoboy@villaburguer.com` | `motoboy123` | `motoboy` |
| 👤 **Cliente de Teste** | `cliente@villaburguer.com` | `cliente123` | `cliente` |

---

## 🌐 Guia de Deploy na Hostinger (VPS Linux / Node.js)

### 1. Configurar Node.js & PM2
No terminal SSH da Hostinger VPS:
```bash
sudo apt update && sudo apt install -y nodejs npm nginx certbot python3-certbot-nginx
sudo npm install -g pm2
```

### 2. Iniciar a Aplicação com PM2
```bash
cd /var/www/villa-burguer/backend
npm install
NODE_ENV=production pm2 start server.js --name "villa-burguer"
pm2 save
pm2 startup
```

### 3. Configurar Nginx Reverse Proxy & WebSockets
Crie `/etc/nginx/sites-available/villaburguer`:
```nginx
server {
    server_name seudominio.com.br;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Ative a configuração:
```bash
sudo ln -s /etc/nginx/sites-available/villaburguer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Obter Certificado SSL Gratuito (Certbot)
```bash
sudo certbot --nginx -d seudominio.com.br
```

---

## 🔒 Política de Retenção de Dados (LGPD)

- Dados de convidados (nome, telefone e endereço) são armazenados estritamente para o cumprimento do pedido e histórico fiscal.
- Registros de pedidos e logs de auditoria expiram e podem ser anonimizados/descartados após 12 meses conforme regulamentação vigente.
