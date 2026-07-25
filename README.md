# 🍔 Villa Burguer – Sistema Completo de Delivery & Cardápio Digital

O **Villa Burguer** é uma plataforma web completa (*Full-Stack Single Page Application*) desenvolvida para hamburguerias artesanais, restaurantes e estabelecimentos de delivery. 

O sistema oferece uma experiência moderna de compra para os clientes (desktop e celular), integração direta com pedidos via **WhatsApp** e um **Painel de Administração completo** para gerenciar produtos, preços, fotos e funcionamento da loja em tempo real.

---

## 🌟 Funcionalidades Chave

### 📱 Para os Clientes (Frontend & Mobile)
- **Cardápio Digital Interativo**: Visualização limpa categorizada por Hambúrgueres, Combos 2x, Porções, Bebidas, Sobremesas e Adicionais.
- **Personalização Dinâmica**: Opção de transformar hambúrgueres em combos (Batata + Bebida), adicionar observações por item (ex: *sem cebola*) e observação geral do pedido.
- **Experiência Mobile-First**: Barra flutuante de carrinho fixa em smartphones (`<= 768px`) permitindo visualizar itens e abrir checkout com 1 toque.
- **Checkout Inteligente com WhatsApp**: Redireciona o pedido perfeitamente formatado para o WhatsApp do estabelecimento e grava o histórico no banco de dados.
- **Área do Cliente**: Cadastro, login, histórico de pedidos recentes e alteração segura de senha.

### 👑 Para o Dono / Administrador (Painel Admin)
- **Alteração do WhatsApp em Tempo Real**: Altere o número de WhatsApp da loja diretamente pelo painel admin sem necessidade de programar.
- **Gestão Completa de Produtos (CRUD Total)**:
  - Criar novos produtos com upload de foto do computador/celular.
  - Editar nome, descrição, categoria, preço base, preço de combo, tag de destaque e fotos.
  - Excluir produtos indesejados.
- **Controle de Funcionamento**: Alternância entre status Automático (por horário), Forçar ABERTO ou Forçar FECHADO (pausa de emergência).
- **Relatório de KPIs**: Total de produtos, itens em destaque e preço médio.

---

## 🛡️ Recursos de Segurança (Pronto para Produção)
- **Criptografia de Senhas**: `bcrypt` com *salt* de 12 rounds.
- **Autenticação Stateless**: JSON Web Tokens (`jwt`) com expiração de 7 dias e verificação por perfil de acesso.
- **Proteção contra Brute Force (Rate Limiting)**:
  - Limite de tentativas no Login (10 tent. / 15 min).
  - Limite de cadastros por IP (5 cad. / hora).
  - Limite geral de requisições na API (120 req. / min).
- **Proteção XSS**: Higienização dinâmica de dados via `escapeHTML()`.
- **Cabeçalhos Seguros**: Proteção via `helmet` e `cors`.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js instalado (v16 ou superior)

### Passo a Passo

1. **Acessar o diretório do backend**:
   ```bash
   cd backend
   ```

2. **Instalar as dependências**:
   ```bash
   npm install
   ```

3. **Iniciar o servidor**:
   ```bash
   npm start
   ```

4. **Acessar a aplicação**:
   Abra seu navegador em: `http://localhost:4000`

---

## 🔑 Credenciais Padrão para Testes

### 👑 Usuário Administrador (Proprietário)
- **E-mail**: `admin@villaburguer.com`
- **Senha**: `villa123`

### 👤 Usuário Padrão (Cliente de Teste)
- **E-mail**: `cliente@villaburguer.com`
- **Senha**: `cliente123`
- **Endereço Pré-cadastrado**: *Rua das Flores, 123 - Bairro Central*
- **Telefone**: *(19) 99887-7665*

*(Recomenda-se alterar as senhas dos usuários após a apresentação ou entrega ao cliente).*

---

## 📂 Estrutura do Projeto

```
villa-burguer/
├── index.html          # Aplicação Web (HTML5 + CSS3 + JS SPA)
├── README.md           # Manual do projeto e guia de instalação
├── imgs/               # Fotos de produtos e logotipo da marca
└── backend/
    ├── server.js       # Servidor Express API + Serviço Estático
    ├── database.sqlite # Banco de dados SQLite pré-populado
    ├── package.json    # Dependências Node.js
    ├── .env            # Variáveis de ambiente (PORT, SECRET_KEY)
    └── uploads/        # Diretório para fotos de produtos enviadas pelo admin
```

---

## ☁️ Dicas para Deploy em Produção

- **Plataformas recomendadas**: Render, Railway, Vercel ou VPS Linux (Ubuntu/Debian com PM2).
- **Variáveis de Ambiente**: Altere a variável `SECRET_KEY` no arquivo `.env` para uma chave secreta forte e aleatória em produção.
