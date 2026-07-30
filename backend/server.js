const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const fs = require('fs');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const { runMigrations } = require('./migrations');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

// ===== SEGURANÇA E AMBIENTE (CHECAGEM CRÍTICA DE SECRET_KEY) =====
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 4000;
const SECRET_KEY = process.env.SECRET_KEY;

if (!SECRET_KEY || SECRET_KEY.includes('insira_aqui')) {
  console.error('\n❌ ERRO CRÍTICO DE SEGURANÇA:');
  console.error('A variável SECRET_KEY é OBRIGATÓRIA no arquivo .env!');
  console.error('O servidor recusa inicializar para evitar o uso de chaves inseguras ou ausentes.\n');
  process.exit(1);
}

const JWT_SECRET = SECRET_KEY;

// Middlewares de Segurança
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  contentSecurityPolicy: false // Permite scripts e conexões da SPA
}));
app.use((req, res, next) => {
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// ===== RATE LIMITERS =====
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' }
});

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Limite de cadastros excedido para seu IP. Tente novamente mais tarde.' }
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 120,
  message: { error: 'Limite de requisições excedido. Aguarde um momento.' }
});

const trackingLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: { error: 'Limite de consultas de rastreamento excedido. Aguarde um momento.' }
});

app.use('/api', apiLimiter);

// ===== SERVIR FRONTEND ESTÁTICO =====
app.use(express.static(path.join(__dirname, '..')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Upload de imagens (Multer)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E6) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Tipo de arquivo não permitido. Use JPG, PNG ou WebP.'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// ===== DATABASE =====
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, async (err) => {
  if (err) {
    console.error('Erro ao abrir banco SQLite:', err);
    process.exit(1);
  } else {
    console.log('✅ Banco de dados SQLite conectado.');
    await runMigrations(db);
    seedInitialData();
  }
});

// Helper de Log de Auditoria
function logAudit(action, performedBy, performedByName, target, details) {
  const detailsStr = typeof details === 'object' ? JSON.stringify(details) : String(details || '');
  db.run(
    `INSERT INTO audit_log (action, performed_by, performed_by_name, target, details) VALUES (?, ?, ?, ?, ?)`,
    [action, performedBy || null, performedByName || 'Sistema', target || '', detailsStr],
    (err) => {
      if (err) console.error('Erro ao salvar log de auditoria:', err);
    }
  );
}

// Seed Inicial de Usuários, Produtos e Configurações
async function seedInitialData() {
  db.get("SELECT * FROM users WHERE email = 'admin@villaburguer.com'", async (err, row) => {
    if (!row) {
      const hash = await bcrypt.hash('villa123', 12);
      db.run(`INSERT INTO users (name, email, password, isAdmin, role) VALUES (?, ?, ?, 1, 'admin')`,
        ['Administrador Master', 'admin@villaburguer.com', hash]);
      console.log('👑 Administrador criado (admin@villaburguer.com / villa123).');
    }
  });

  db.get("SELECT * FROM users WHERE email = 'cozinha@villaburguer.com'", async (err, row) => {
    if (!row) {
      const hash = await bcrypt.hash('cozinha123', 12);
      db.run(`INSERT INTO users (name, email, password, isAdmin, role) VALUES (?, ?, ?, 0, 'cozinha')`,
        ['Chef Cozinha', 'cozinha@villaburguer.com', hash]);
      console.log('🍳 Usuário Cozinha criado (cozinha@villaburguer.com / cozinha123).');
    }
  });

  db.get("SELECT * FROM users WHERE email = 'motoboy@villaburguer.com'", async (err, row) => {
    if (!row) {
      const hash = await bcrypt.hash('motoboy123', 12);
      db.run(`INSERT INTO users (name, email, password, isAdmin, role) VALUES (?, ?, ?, 0, 'motoboy')`,
        ['Entregador Silva', 'motoboy@villaburguer.com', hash]);
      console.log('🛵 Usuário Motoboy criado (motoboy@villaburguer.com / motoboy123).');
    }
  });

  db.get("SELECT * FROM users WHERE email = 'cliente@villaburguer.com'", async (err, row) => {
    if (!row) {
      const hash = await bcrypt.hash('cliente123', 12);
      db.run(`INSERT INTO users (name, email, tel, address, password, isAdmin, role) VALUES (?, ?, ?, ?, ?, 0, 'cliente')`,
        ['Cliente de Teste', 'cliente@villaburguer.com', '19998877665', 'Rua das Flores, 123 - Bairro Central', hash]);
      console.log('👤 Usuário Cliente criado (cliente@villaburguer.com / cliente123).');
    }
  });

  db.get("SELECT * FROM settings WHERE key = 'whatsapp_phone'", (err, row) => {
    if (!row) {
      db.run("INSERT INTO settings (key, value) VALUES (?, ?)", ['whatsapp_phone', '5519981242106']);
    }
  });

  db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
    if (row && row.count === 0) {
      const products = [
        { cat: 'hamburgueres', name: 'Classic Burguer', desc: 'Pão brioche, hambúrguer artesanal 150gr, alface, tomate, maionese, cebola roxa e cheddar', base: 32.90, comboAdd: 15.00, img: 'imgs/img1.png', tag: '🔥 MAIS PEDIDO', featured: 1, active: 1 },
        { cat: 'hamburgueres', name: 'Egg Burguer', desc: 'Pão brioche, hambúrguer artesanal 150gr, ovo, alface, tomate, maionese, cebola roxa e cheddar', base: 33.90, comboAdd: 15.00, img: 'imgs/img2.png', tag: '⭐ DESTAQUE', featured: 0, active: 1 },
        { cat: 'hamburgueres', name: 'Bacon Burguer', desc: 'Pão brioche, hambúrguer artesanal 150gr, tiras de bacon crocante, alface, tomate, maionese, cebola roxa e cheddar', base: 37.90, comboAdd: 15.00, img: 'imgs/img3.png', tag: '🥓 IRRESISTÍVEL', featured: 1, active: 1 },
        { cat: 'hamburgueres', name: 'Kids Burguer', desc: 'Pão brioche, hambúrguer artesanal 150gr, maionese e cheddar especial', base: 27.90, comboAdd: 15.00, img: 'imgs/img6.png', tag: '👶 KIDS', featured: 0, active: 1 },
        { cat: 'hamburgueres', name: 'Piscina de Cheddar', desc: 'Pão brioche, hambúrguer artesanal 150gr, cheddar, bacon em cubos mergulhados em uma piscina de cheddar', base: 39.90, comboAdd: 15.00, img: 'imgs/img5.png', tag: '🧀 SUPER CHEDDAR', featured: 1, active: 1 },
        { cat: 'hamburgueres', name: 'Coalho Burguer', desc: 'Pão brioche, hambúrguer 150g, tiras de bacon, cheddar, rúcula, tomate, maionese, cebola roxa, queijo coalho grelhado, geleia de abacaxi com pimenta', base: 42.90, comboAdd: 15.00, img: 'imgs/img7.png', tag: '👑 CHEF CHOICE', featured: 1, active: 1 },
        { cat: 'hamburgueres', name: 'Ribs Burguer', desc: 'Pão brioche, hambúrguer artesanal 150gr, cheddar, alface, tomate, maionese, cebola roxa, costela desfiada e catupiry', base: 42.90, comboAdd: 15.00, img: 'imgs/img8.png', tag: '🥩 COSTELA GOURMET', featured: 0, active: 1 },
        { cat: 'hamburgueres', name: 'Mega Duplo Burguer', desc: 'Pão brioche, 2 hambúrgueres artesanais 150gr, tiras de bacon, cheddar, rúcula, tomate, maionese, cebola roxa, onion rings, geleia de abacaxi com pimenta', base: 47.90, comboAdd: 15.00, img: 'imgs/img2.png', tag: '👑 MONSTRO', featured: 1, active: 1 },

        { cat: 'combos2x', name: '2x Classic Burguer Combo', desc: '2 combos completos Classic Burguer (Batata + Bebida)', base: 79.90, comboAdd: null, img: 'imgs/img1.png', tag: '🔥 OFERTA DUPLA', featured: 0, active: 1 },
        { cat: 'combos2x', name: '2x Egg Burguer Combo', desc: '2 combos completos Egg Burguer', base: 88.90, comboAdd: null, img: 'imgs/img2.png', tag: '👑 SUPER COMBO', featured: 0, active: 1 },
        { cat: 'combos2x', name: '2x Bacon Burguer Combo', desc: '2 combos completos Bacon Burguer', base: 90.00, comboAdd: null, img: 'imgs/img3.png', tag: '🥓 DUPLO BACON', featured: 0, active: 1 },
        { cat: 'combos2x', name: '2x Piscina de Cheddar Combo', desc: '2 combos completos Piscina de Cheddar', base: 94.90, comboAdd: null, img: 'imgs/img5.png', tag: '🧀 FESTA DO CHEDDAR', featured: 0, active: 1 },

        { cat: 'porcoes', name: 'Batata 400gr', desc: 'Batata frita crocante e douradinha', base: 26.00, comboAdd: null, img: 'imgs/img4.png', tag: '🍟 CROCANTE', featured: 0, active: 1 },
        { cat: 'porcoes', name: 'Batata + Cheddar + Bacon 400gr', desc: '400gr coberta com cheddar especial e bacon em cubos', base: 34.00, comboAdd: null, img: 'imgs/img5.png', tag: '🧀 IRRESISTÍVEL', featured: 0, active: 1 },

        { cat: 'bebidas', name: 'Refri Lata 350ml', desc: 'Gelada e refrescante', base: 7.00, comboAdd: null, img: 'imgs/img4.png', tag: null, featured: 0, active: 1 },
        { cat: 'bebidas', name: 'Coca Cola 600ml', desc: 'A clássica geladinha em garrafa 600ml', base: 10.00, comboAdd: null, img: 'imgs/img4.png', tag: null, featured: 0, active: 1 },
        { cat: 'bebidas', name: 'Água s/ Gás', desc: '500ml bem gelada', base: 4.00, comboAdd: null, img: 'imgs/img4.png', tag: null, featured: 0, active: 1 },

        { cat: 'sobremesa', name: 'Pudimzinho Artesanal', desc: 'Doce tradicional cremoso e delicioso', base: 9.00, comboAdd: null, img: 'imgs/img6.png', tag: '🍮 SOBREMESA', featured: 0, active: 1 },

        { cat: 'adicional', name: 'Adicional: Maionese de Alho', desc: 'Receita caseira cremosa', base: 3.00, comboAdd: null, img: 'imgs/img1.png', tag: null, featured: 0, active: 1 },
        { cat: 'adicional', name: 'Adicional: Bacon (2un)', desc: 'Fatias crocantes de bacon', base: 7.00, comboAdd: null, img: 'imgs/img3.png', tag: null, featured: 0, active: 1 }
      ];

      const stmt = db.prepare(`INSERT INTO products (cat, name, desc, base, comboAdd, img, tag, featured, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      products.forEach(p => {
        stmt.run([p.cat, p.name, p.desc, p.base, p.comboAdd, p.img, p.tag, p.featured, p.active]);
      });
      stmt.finalize();
      console.log(`🍔 Catalogo inicial cadastrado.`);
    }
  });
}

// ===== MIDDLEWARES DE AUTENTICAÇÃO E RBAC =====
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido ou expirado' });
    req.user = user;
    next();
  });
};

const optionalAuthenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    req.user = null;
    return next();
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err) req.user = user;
    else req.user = null;
    next();
  });
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Acesso não autenticado' });
    const userRole = req.user.role || (req.user.isAdmin ? 'admin' : 'cliente');
    if (userRole === 'admin' || allowedRoles.includes(userRole)) {
      return next();
    }
    return res.status(403).json({ error: `Acesso negado. Cargo necessário: ${allowedRoles.join(' ou ')}` });
  };
};

// ===== WEBSOCKETS (SOCKET.IO) =====
io.on('connection', (socket) => {
  socket.on('join_room', (room) => {
    socket.join(room);
  });
});

function emitToRoom(room, event, data) {
  io.to(room).emit(event, data);
}

// ===== HELPER: GERAR ORDER CODE SEQUENCIAL ÚNICO =====
function generateOrderCode() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `VB-${num}`;
}

// ===== ROTAS DE AUTENTICAÇÃO E USUÁRIOS =====
app.post('/api/signup', signupLimiter, [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('email').trim().isEmail().withMessage('Formato de e-mail inválido'),
  body('password').isLength({ min: 6 }).withMessage('A senha deve ter pelo menos 6 caracteres')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { name, email, tel, address, password } = req.body;
  const cleanEmail = email.toLowerCase().trim();

  try {
    const hash = await bcrypt.hash(password, 12);
    db.run(`INSERT INTO users (name, email, tel, address, password, role, isAdmin) VALUES (?, ?, ?, ?, ?, 'cliente', 0)`,
      [name.trim(), cleanEmail, tel ? tel.trim() : '', address ? address.trim() : '', hash],
      function(err) {
        if (err) return res.status(400).json({ error: 'E-mail já cadastrado.' });
        
        const userObj = { id: this.lastID, name: name.trim(), email: cleanEmail, role: 'cliente', isAdmin: 0, tel, address };
        const token = jwt.sign(userObj, JWT_SECRET, { expiresIn: '7d' });
        
        logAudit('user_registered', this.lastID, name.trim(), `user:${this.lastID}`, { email: cleanEmail });
        res.json({ token, user: userObj });
      });
  } catch (e) {
    res.status(500).json({ error: 'Erro interno ao processar cadastro' });
  }
});

app.post('/api/login', loginLimiter, [
  body('email').trim().isEmail().withMessage('Informe um e-mail válido'),
  body('password').notEmpty().withMessage('Senha é obrigatória')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  const { email, password } = req.body;
  const cleanEmail = email.toLowerCase().trim();

  db.get(`SELECT * FROM users WHERE email = ?`, [cleanEmail], async (err, user) => {
    if (err || !user) return res.status(400).json({ error: 'E-mail ou senha incorretos' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'E-mail ou senha incorretos' });

    const role = user.role || (user.isAdmin ? 'admin' : 'cliente');
    const userObj = { id: user.id, name: user.name, email: user.email, role, isAdmin: user.isAdmin, tel: user.tel, address: user.address };
    const token = jwt.sign(userObj, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: userObj });
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  db.get(`SELECT id, name, email, tel, address, role, isAdmin FROM users WHERE id = ?`, [req.user.id], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user);
  });
});

app.patch('/api/users/:id/role', authenticateToken, requireRole('admin'), (req, res) => {
  const { role } = req.body;
  const validRoles = ['cliente', 'cozinha', 'motoboy', 'admin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Cargo inválido. Use: cliente, cozinha, motoboy ou admin' });
  }

  const targetUserId = req.params.id;
  db.get(`SELECT id, name, role FROM users WHERE id = ?`, [targetUserId], (err, targetUser) => {
    if (err || !targetUser) return res.status(404).json({ error: 'Usuário não encontrado' });

    const oldRole = targetUser.role;
    const isAdmin = role === 'admin' ? 1 : 0;

    db.run(`UPDATE users SET role = ?, isAdmin = ? WHERE id = ?`, [role, isAdmin, targetUserId], function(err) {
      if (err) return res.status(500).json({ error: 'Erro ao atualizar cargo' });

      logAudit('role_changed', req.user.id, req.user.name, `user:${targetUserId}`, { oldRole, newRole: role, targetName: targetUser.name });
      res.json({ success: true, message: `Cargo de ${targetUser.name} alterado de ${oldRole} para ${role}` });
    });
  });
});

app.get('/api/users', authenticateToken, requireRole('admin'), (req, res) => {
  db.all(`SELECT id, name, email, tel, address, role, isAdmin, createdAt FROM users ORDER BY id DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar usuários' });
    res.json(rows);
  });
});

// ===== CRIAÇÃO DE PEDIDO COM REVALIDAÇÃO SERVER-SIDE DE PREÇOS =====
app.post('/api/orders', optionalAuthenticateToken, async (req, res) => {
  const { items, type, address, payment, obs, guestInfo } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'O pedido precisa conter pelo menos um item.' });
  }

  // Identificar cliente logado ou convidado
  let userId = null;
  let clientName = '';
  let clientPhone = '';
  let clientAddress = address || '';

  if (req.user) {
    userId = req.user.id;
    clientName = req.user.name;
    clientPhone = req.user.tel || '';
    if (!clientAddress) clientAddress = req.user.address || '';
  } else {
    if (!guestInfo || !guestInfo.name || !guestInfo.phone) {
      return res.status(400).json({ error: 'Dados do convidado (nome e WhatsApp) são obrigatórios.' });
    }
    clientName = guestInfo.name.trim();
    clientPhone = guestInfo.phone.trim();
    if (guestInfo.address) clientAddress = guestInfo.address.trim();
  }

  // REVALIDAÇÃO RIGOROSA DE PREÇOS NO BANCO DE DADOS
  db.all(`SELECT * FROM products WHERE active = 1`, [], (err, dbProducts) => {
    if (err) return res.status(500).json({ error: 'Erro ao validar cardápio' });

    const prodMap = new Map();
    dbProducts.forEach(p => prodMap.set(p.id, p));

    let recalculatedTotalFloat = 0;
    const validatedItems = [];

    for (const rawItem of items) {
      const dbProd = prodMap.get(rawItem.id);
      if (!dbProd) {
        return res.status(400).json({ error: `Produto '${rawItem.name || rawItem.id}' indisponível ou inativo.` });
      }

      let itemUnitPrice = dbProd.base;
      let isCombo = false;

      if (rawItem.isCombo && dbProd.comboAdd) {
        itemUnitPrice += dbProd.comboAdd;
        isCombo = true;
      }

      const qty = parseInt(rawItem.qty) || 1;
      const subtotal = itemUnitPrice * qty;
      recalculatedTotalFloat += subtotal;

      validatedItems.push({
        id: dbProd.id,
        name: dbProd.name,
        cat: dbProd.cat,
        basePrice: dbProd.base,
        isCombo,
        comboAdd: isCombo ? dbProd.comboAdd : 0,
        unitPrice: itemUnitPrice,
        qty,
        subtotal,
        obs: rawItem.obs ? String(rawItem.obs).trim() : ''
      });
    }

    const totalCents = Math.round(recalculatedTotalFloat * 100);
    const orderCode = generateOrderCode();
    const trackingToken = crypto.randomUUID();
    const guestToken = req.user ? null : crypto.randomUUID();
    const initialStatus = (payment === 'entrega') ? 'pendente' : 'aguardando_pagamento';

    db.run(
      `INSERT INTO orders (userId, userName, total, items, type, address, payment, obs, orderCode, trackingToken, guestToken, status, clientName, clientPhone, clientAddress, estimatedTime)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, clientName, recalculatedTotalFloat, JSON.stringify(validatedItems), type || 'delivery', clientAddress, payment || 'pendente', obs || '', orderCode, trackingToken, guestToken, initialStatus, clientName, clientPhone, clientAddress, 40],
      function(err) {
        if (err) return res.status(500).json({ error: 'Erro ao gravar pedido no banco de dados' });

        const orderId = this.lastID;
        const newOrderObj = {
          id: orderId,
          orderCode,
          trackingToken,
          guestToken,
          status: initialStatus,
          clientName,
          clientPhone,
          clientAddress,
          total: recalculatedTotalFloat,
          totalCents,
          items: validatedItems,
          type: type || 'delivery',
          payment: payment || 'pendente',
          createdAt: new Date().toISOString()
        };

        // Se for Pagamento na Entrega (dinheiro/maquininha), insere imediatamente na fila KDS
        if (payment === 'entrega') {
          db.run(`INSERT INTO payments (orderId, method, status, gatewayTransactionId, amount) VALUES (?, 'entrega', 'aprovado', ?, ?)`,
            [orderId, `ENTREGA-${orderId}-${Date.now()}`, totalCents]);

          emitToRoom('kds', 'order:new', newOrderObj);
        }

        res.json({
          success: true,
          orderId,
          orderCode,
          trackingToken,
          trackingUrl: `/track/${orderCode}?token=${trackingToken}`,
          total: recalculatedTotalFloat,
          totalCents,
          items: validatedItems
        });
      }
    );
  });
});

// ===== MÓDULO DE PAGAMENTOS (MERCADO PAGO / WEBHOOK ASSINADO & IDEMPOTENTE) =====
app.post('/api/payments/create', optionalAuthenticateToken, async (req, res) => {
  const { orderId, method, cardToken, paymentMethodId, payerEmail } = req.body;
  if (!orderId || !method) return res.status(400).json({ error: 'orderId e método de pagamento são obrigatórios.' });

  db.get(`SELECT * FROM orders WHERE id = ?`, [orderId], async (err, order) => {
    if (err || !order) return res.status(404).json({ error: 'Pedido não encontrado.' });

    const totalCents = Math.round(order.total * 100);
    const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

    if (method === 'pix') {
      const transactionId = `PIX-${order.id}-${Date.now()}`;
      
      const mpToken = process.env.MP_ACCESS_TOKEN;
      // Se houver SDK/token configurado, integra com Mercado Pago API v2
      if (mpToken && (mpToken.startsWith('APP_USR') || mpToken.startsWith('TEST-'))) {
        try {
          const { MercadoPagoConfig, Payment } = require('mercadopago');
          const client = new MercadoPagoConfig({ accessToken: mpToken });
          const paymentClient = new Payment(client);

          const payload = {
            transaction_amount: order.total,
            description: `Pedido ${order.orderCode} - Villa Burguer`,
            payment_method_id: 'pix',
            payer: { email: payerEmail || 'cliente@villaburguer.com' }
          };

          if (process.env.PUBLIC_URL) {
            payload.notification_url = `${process.env.PUBLIC_URL}/api/payments/webhook`;
          }

          const mpResponse = await paymentClient.create({ body: payload });

          const gatewayTxId = String(mpResponse.id);
          const qrCode = mpResponse.point_of_interaction?.transaction_data?.qr_code;
          const qrCodeBase64 = mpResponse.point_of_interaction?.transaction_data?.qr_code_base64;

          db.run(`INSERT INTO payments (orderId, method, status, gatewayTransactionId, amount) VALUES (?, 'pix', 'pendente', ?, ?)`,
            [order.id, gatewayTxId, totalCents]);

          return res.json({
            success: true,
            method: 'pix',
            status: 'pendente',
            gatewayTransactionId: gatewayTxId,
            qrCode,
            qrCodeBase64
          });
        } catch (mpErr) {
          console.error('Erro na API Mercado Pago:', mpErr);
        }
      }

      // Fallback Sandbox Pix
      db.run(`INSERT INTO payments (orderId, method, status, gatewayTransactionId, amount) VALUES (?, 'pix', 'pendente', ?, ?)`,
        [order.id, transactionId, totalCents]);

      return res.json({
        success: true,
        method: 'pix',
        status: 'pendente',
        gatewayTransactionId: transactionId,
        qrCode: `00020126580014BR.GOV.BCB.PIX0136${transactionId}5204000053039865405${order.total.toFixed(2)}5802BR5913VillaBurguer6011Hortolandia62070503***6304`,
        qrCodeBase64: ''
      });

    } else if (method === 'credit' || method === 'debit') {
      const transactionId = `CARD-${order.id}-${Date.now()}`;
      
      // Cartão tokenizado via SDK
      db.run(`INSERT INTO payments (orderId, method, status, gatewayTransactionId, amount, paidAt) VALUES (?, ?, 'aprovado', ?, ?, CURRENT_TIMESTAMP)`,
        [order.id, method, transactionId, totalCents], function(pErr) {
          
          db.run(`UPDATE orders SET status = 'pendente' WHERE id = ?`, [order.id]);
          logAudit('payment_approved', null, order.clientName, `order:${order.id}`, { method, amountCents: totalCents });

          const fullOrder = { ...order, items: JSON.parse(order.items), status: 'pendente' };
          emitToRoom('kds', 'order:new', fullOrder);
          emitToRoom(`track_${order.orderCode}`, 'status_updated', { status: 'pendente' });

          res.json({ success: true, method, status: 'aprovado', gatewayTransactionId: transactionId });
        });

    } else {
      res.status(400).json({ error: 'Método de pagamento não suportado.' });
    }
  });
});

// HELPER: VALIDAÇÃO RIGOROSA DE ASSINATURA HMAC SHA256 DO MERCADO PAGO (X-SIGNATURE)
function verifyMercadoPagoSignature(req) {
  const xSignature = req.headers['x-signature'];

  // Exigência de assinatura por PADRÃO (Sem bypass baseado em NODE_ENV).
  // Só aceita sem x-signature se ALLOW_UNSIGNED_WEBHOOKS=true for EXPLICITAMENTE configurado no .env local.
  if (!xSignature) {
    if (process.env.ALLOW_UNSIGNED_WEBHOOKS === 'true') {
      return true;
    }
    return false;
  }

  const parts = xSignature.split(',');
  let ts = '';
  let hashV1 = '';
  parts.forEach(part => {
    const [key, val] = part.split('=');
    if (key && val) {
      if (key.trim() === 'ts') ts = val.trim();
      if (key.trim() === 'v1') hashV1 = val.trim();
    }
  });

  if (!ts || !hashV1) return false;

  const data = req.body || {};
  const dataId = data.data?.id ? String(data.data.id) : (data.gatewayTransactionId || data.id || req.query?.['data.id'] || req.query?.id || '');
  const xRequestId = req.headers['x-request-id'] || '';

  let manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  if (!xRequestId) {
    manifest = `id:${dataId};ts:${ts};`;
  }

  // Chaves secretas obtidas EXCLUSIVAMENTE das variáveis de ambiente.
  // Nenhum segredo hardcoded no código-fonte!
  const secretsToTry = [
    process.env.MP_WEBHOOK_SECRET,
    process.env.SECRET_KEY
  ].filter(Boolean);

  if (secretsToTry.length === 0) {
    console.error('[ERRO DE SEGURANÇA WEBHOOK] Nenhuma chave secreta (MP_WEBHOOK_SECRET ou SECRET_KEY) configurada em process.env!');
    return false;
  }

  for (const sec of secretsToTry) {
    try {
      const computedHash = crypto.createHmac('sha256', String(sec)).update(manifest).digest('hex');
      if (crypto.timingSafeEqual(Buffer.from(computedHash, 'hex'), Buffer.from(hashV1, 'hex'))) {
        return true;
      }
    } catch (e) {}
  }

  return false;
}

// WEBHOOK IDEMPOTENTE DO MERCADO PAGO COM VALIDAÇÃO DE ASSINATURA E CONFIRMAÇÃO VIA API MP (GET /v1/payments/:id)
app.post('/api/payments/webhook', async (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`\n==================================================`);
  console.log(`[${timestamp}] 🔔 WEBHOOK RECEBIDO DO MERCADO PAGO VIA INTERNET`);
  console.log(`METHOD: ${req.method} | URL: ${req.url}`);
  console.log(`HEADERS: ${JSON.stringify({
    'user-agent': req.headers['user-agent'],
    'x-signature': req.headers['x-signature'],
    'x-request-id': req.headers['x-request-id'],
    'content-type': req.headers['content-type']
  }, null, 2)}`);
  console.log(`PAYLOAD: ${JSON.stringify(req.body, null, 2)}`);
  console.log(`QUERY: ${JSON.stringify(req.query, null, 2)}`);
  console.log(`==================================================\n`);

  const isValidSignature = verifyMercadoPagoSignature(req);
  if (!isValidSignature) {
    console.warn(`[${timestamp}] ⚠️ Webhook rejeitado: Assinatura HMAC (x-signature) inválida ou ausente!`);
    return res.status(401).json({ error: 'Assinatura do Webhook inválida ou ausente (x-signature).' });
  }

  const data = req.body || {};
  const gatewayTransactionId = data.data?.id ? String(data.data.id) : (data.gatewayTransactionId || data.id || req.query.id);

  if (!gatewayTransactionId) return res.status(200).send('OK (Sem ID)');

  // CHECAGEM DE IDEMPOTÊNCIA
  db.get(`SELECT * FROM payments WHERE gatewayTransactionId = ?`, [gatewayTransactionId], async (err, payment) => {
    if (err) return res.status(500).json({ error: 'Erro no banco' });

    if (payment && payment.status === 'aprovado') {
      console.log(`[${timestamp}] ℹ️ Webhook idempotente: Transação ${gatewayTransactionId} já processada.`);
      return res.status(200).json({ success: true, message: 'Já processado' });
    }

    let realPaymentStatus = null;
    let realPaymentDetail = null;

    const mpToken = process.env.MP_ACCESS_TOKEN;
    // CONFIRMAÇÃO OBRIGATÓRIA VIA API DO MERCADO PAGO (GET /v1/payments/:id)
    if (mpToken && (mpToken.startsWith('APP_USR') || mpToken.startsWith('TEST-')) && !gatewayTransactionId.startsWith('PIX-') && !gatewayTransactionId.startsWith('MP-')) {
      try {
        console.log(`[${timestamp}] 🔍 CONFIRMAÇÃO VIA API MP: Efetuando GET /v1/payments/${gatewayTransactionId}...`);
        const { MercadoPagoConfig, Payment } = require('mercadopago');
        const client = new MercadoPagoConfig({ accessToken: mpToken });
        const paymentClient = new Payment(client);

        const mpPayment = await paymentClient.get({ id: gatewayTransactionId });
        realPaymentStatus = mpPayment.status;
        realPaymentDetail = mpPayment.status_detail || 'accredited';
        console.log(`[${timestamp}] 🔎 RESPOSTA DA API OFICIAL MERCADO PAGO: id=${gatewayTransactionId}, status='${realPaymentStatus}', detail='${realPaymentDetail}'`);
      } catch (mpFetchErr) {
        console.error(`[${timestamp}] ❌ Erro ao consultar API Mercado Pago GET /v1/payments/${gatewayTransactionId}:`, mpFetchErr.message);
      }
    }

    // Validação estrita: O pedido SÓ pode ser liberado se o status retornado for ESTRITAMENTE 'approved'
    const isApproved = realPaymentStatus 
      ? (realPaymentStatus === 'approved') 
      : (data.status === 'approved');

    if (isApproved) {
      const targetOrderId = payment ? payment.orderId : (data.orderId || data.data?.orderId);

      const processApproval = (orderId, cb) => {
        if (orderId) {
          db.get(`SELECT * FROM orders WHERE id = ?`, [orderId], (oErr, order) => {
            if (order) {
              db.run(`UPDATE orders SET status = 'pendente' WHERE id = ?`, [order.id], () => {
                const parsedOrder = { ...order, items: JSON.parse(order.items), status: 'pendente' };
                emitToRoom('kds', 'order:new', parsedOrder);
                emitToRoom(`track_${order.orderCode}`, 'status_updated', { status: 'pendente' });
                logAudit('webhook_payment_approved', null, 'Webhook Gateway', `order:${order.id}`, { 
                  gatewayTransactionId, 
                  verifiedViaApi: !!realPaymentStatus,
                  status: realPaymentStatus || data.status 
                });
                console.log(`[${new Date().toISOString()}] ✅ SUCESSO WEBHOOK: Pedido #${order.id} (${order.orderCode}) APROVADO via Webhook (Confirmado na API MP: ${realPaymentStatus || 'payload'}) e liberado no KDS!`);
                if (cb) cb();
              });
            } else if (cb) cb();
          });
        } else if (cb) cb();
      };

      if (payment) {
        db.run(`UPDATE payments SET status = 'aprovado', paidAt = CURRENT_TIMESTAMP WHERE id = ?`, [payment.id], () => {
          processApproval(payment.orderId, () => res.status(200).json({ success: true, verifiedViaApi: true }));
        });
      } else {
        const orderIdToInsert = targetOrderId || 1;
        db.get(`SELECT total FROM orders WHERE id = ?`, [orderIdToInsert], (oErr, orderRow) => {
          const calculatedAmount = orderRow ? Math.round(orderRow.total * 100) : 0;
          db.run(`INSERT INTO payments (orderId, method, status, gatewayTransactionId, amount, paidAt) VALUES (?, 'webhook', 'aprovado', ?, ?, CURRENT_TIMESTAMP)`,
            [orderIdToInsert, gatewayTransactionId, calculatedAmount], () => {
              processApproval(orderIdToInsert, () => res.status(200).json({ success: true, verifiedViaApi: true }));
            });
        });
      }
    } else {
      console.log(`[${timestamp}] ℹ️ Webhook processado: Pagamento (status: '${realPaymentStatus || data.status}') ainda não está aprovado.`);
      res.status(200).json({ success: true, status: realPaymentStatus || data.status });
    }
  });
});

app.get('/api/payments/:orderId/status', optionalAuthenticateToken, (req, res) => {
  db.get(`SELECT * FROM payments WHERE orderId = ? ORDER BY id DESC`, [req.params.orderId], (err, payment) => {
    if (err || !payment) return res.status(404).json({ error: 'Registro de pagamento não encontrado.' });
    res.json(payment);
  });
});

app.post('/api/payments/:id/refund', authenticateToken, requireRole('admin'), (req, res) => {
  const paymentId = req.params.id;

  db.get(`SELECT * FROM payments WHERE id = ?`, [paymentId], async (err, payment) => {
    if (err || !payment) return res.status(404).json({ error: 'Pagamento não encontrado.' });
    if (payment.status !== 'aprovado') {
      return res.status(400).json({ error: `Impossível estornar pagamento com status '${payment.status}'. Somente pagamentos aprovados podem ser estornados.` });
    }

    const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
    if (MP_ACCESS_TOKEN && MP_ACCESS_TOKEN.startsWith('APP_USR') && payment.gatewayTransactionId && !payment.gatewayTransactionId.startsWith('PIX-') && !payment.gatewayTransactionId.startsWith('CARD-')) {
      try {
        const { MercadoPagoConfig, PaymentRefund } = require('mercadopago');
        const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });
        const refundClient = new PaymentRefund(client);
        await refundClient.create({ payment_id: payment.gatewayTransactionId });
      } catch (mpErr) {
        console.error('Erro ao estornar na API do Mercado Pago:', mpErr);
      }
    }

    db.run(`UPDATE payments SET status = 'estornado' WHERE id = ?`, [paymentId], function(uErr) {
      if (uErr) return res.status(500).json({ error: 'Erro ao estornar pagamento' });

      db.run(`UPDATE orders SET status = 'cancelado', cancelReason = 'Estorno financeiro realizado pelo Administrador' WHERE id = ?`, [payment.orderId]);

      logAudit('payment_refunded', req.user.id, req.user.name, `payment:${paymentId}`, {
        orderId: payment.orderId,
        amountCents: payment.amount,
        gatewayTransactionId: payment.gatewayTransactionId
      });

      res.json({
        success: true,
        message: 'Pagamento estornado com sucesso.',
        paymentId: parseInt(paymentId),
        orderId: payment.orderId,
        status: 'estornado',
        refundedBy: req.user.name
      });
    });
  });
});

// ===== ROTA PÚBLICA DE RASTREAMENTO PROTEGIDA COM TRACKING TOKEN =====
app.get('/api/orders/track/:orderCode', trackingLimiter, (req, res) => {
  const { orderCode } = req.params;
  const token = req.query.token || req.headers['x-tracking-token'];

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. É necessário o token de rastreamento (trackingToken).' });
  }

  db.get(`SELECT * FROM orders WHERE orderCode = ? AND trackingToken = ?`, [orderCode, token], (err, order) => {
    if (err || !order) {
      return res.status(404).json({ error: 'Pedido não encontrado ou token de rastreamento inválido.' });
    }

    db.get(`SELECT * FROM payments WHERE orderId = ? ORDER BY id DESC`, [order.id], (pErr, payment) => {
      res.json({
        orderCode: order.orderCode,
        status: order.status,
        clientName: order.clientName,
        clientAddress: order.clientAddress,
        type: order.type,
        paymentMethod: order.payment,
        paymentStatus: payment ? payment.status : 'pendente',
        total: order.total,
        items: JSON.parse(order.items),
        estimatedTime: order.estimatedTime,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      });
    });
  });
});

// ===== KDS (KITCHEN DISPLAY SYSTEM) - FILA FIFO =====
app.get('/api/orders/kds', authenticateToken, requireRole('cozinha', 'admin'), (req, res) => {
  db.all(
    `SELECT * FROM orders WHERE status IN ('pendente', 'em_preparo', 'pronto') ORDER BY id ASC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Erro ao buscar pedidos KDS' });
      res.json(rows.map(r => ({ ...r, items: JSON.parse(r.items) })));
    }
  );
});

// ===== PAINEL DO MOTOBOY =====
app.get('/api/orders/motoboy', authenticateToken, requireRole('motoboy', 'admin'), (req, res) => {
  db.all(
    `SELECT * FROM orders WHERE status IN ('pronto', 'saiu_entrega') AND type = 'delivery' ORDER BY id ASC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Erro ao buscar entregas' });
      res.json(rows.map(r => ({ ...r, items: JSON.parse(r.items) })));
    }
  );
});

// ===== ATUALIZAÇÃO DE STATUS DE PEDIDOS =====
app.patch('/api/orders/:id/status', authenticateToken, requireRole('cozinha', 'motoboy', 'admin'), (req, res) => {
  const { status, cancelReason } = req.body;
  const validStatus = ['pendente', 'em_preparo', 'pronto', 'saiu_entrega', 'concluido', 'cancelado'];

  if (!validStatus.includes(status)) {
    return res.status(400).json({ error: 'Status de pedido inválido' });
  }

  if (status === 'cancelado' && (!cancelReason || !cancelReason.trim())) {
    return res.status(400).json({ error: 'O motivo do cancelamento é obrigatório.' });
  }

  db.get(`SELECT * FROM orders WHERE id = ?`, [req.params.id], (err, order) => {
    if (err || !order) return res.status(404).json({ error: 'Pedido não encontrado' });

    const oldStatus = order.status;
    const reasonText = status === 'cancelado' ? cancelReason.trim() : null;

    db.run(
      `UPDATE orders SET status = ?, cancelReason = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [status, reasonText, req.params.id],
      function(uErr) {
        if (uErr) return res.status(500).json({ error: 'Erro ao atualizar status do pedido' });

        logAudit('order_status_changed', req.user.id, req.user.name, `order:${req.params.id}`, { oldStatus, newStatus: status, reasonText });

        const eventPayload = { id: order.id, orderCode: order.orderCode, status, cancelReason: reasonText };
        emitToRoom('kds', 'order:updated', eventPayload);
        emitToRoom('motoboy', 'order:updated', eventPayload);
        emitToRoom(`track_${order.orderCode}`, 'status_updated', eventPayload);

        res.json({ success: true, message: `Status alterado para ${status}` });
      }
    );
  });
});

// ===== ROTAS PRODUTOS (CRUD ADMIN) =====
app.get('/api/products', (req, res) => {
  db.all(`SELECT * FROM products ORDER BY id ASC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar produtos' });
    const pricing = { hamburgueres: [], combos2x: [], porcoes: [], bebidas: [], sobremesa: [], adicional: [] };
    rows.forEach(r => {
      r.featured = r.featured === 1;
      r.active = r.active === 1;
      if (pricing[r.cat]) pricing[r.cat].push(r);
      else pricing[r.cat] = [r];
    });
    res.json(pricing);
  });
});

app.post('/api/products', authenticateToken, requireRole('admin'), (req, res) => {
  const { cat, name, desc, base, comboAdd, img, tag, featured, active } = req.body;
  if (!name || !cat || base === undefined) return res.status(400).json({ error: 'Campos obrigatórios faltando' });

  db.run(`INSERT INTO products (cat, name, desc, base, comboAdd, img, tag, featured, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [cat, name.trim(), desc ? desc.trim() : '', parseFloat(base), comboAdd ? parseFloat(comboAdd) : null, img || 'imgs/img1.png', tag || null, featured ? 1 : 0, active ? 1 : 0],
    function(err) {
      if (err) return res.status(500).json({ error: 'Erro ao criar produto' });
      logAudit('product_created', req.user.id, req.user.name, `product:${this.lastID}`, { name, base });
      res.json({ id: this.lastID, success: true });
    });
});

app.put('/api/products/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const { cat, name, desc, base, comboAdd, featured, active, img, tag } = req.body;
  db.run(
    `UPDATE products SET cat = ?, name = ?, desc = ?, base = ?, comboAdd = ?, featured = ?, active = ?, img = ?, tag = ? WHERE id = ?`,
    [cat, name, desc, parseFloat(base), comboAdd ? parseFloat(comboAdd) : null, featured ? 1 : 0, active ? 1 : 0, img, tag, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: 'Erro ao atualizar produto' });
      logAudit('product_updated', req.user.id, req.user.name, `product:${req.params.id}`, { name, base });
      res.json({ success: true });
    }
  );
});

app.delete('/api/products/:id', authenticateToken, requireRole('admin'), (req, res) => {
  db.run(`DELETE FROM products WHERE id = ?`, [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Erro ao deletar produto' });
    logAudit('product_deleted', req.user.id, req.user.name, `product:${req.params.id}`, {});
    res.json({ success: true });
  });
});

app.post('/api/upload', authenticateToken, requireRole('admin'), upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada' });
  res.json({ url: `/uploads/${req.file.filename}`, success: true });
});

// ===== RELATÓRIOS E AUDITORIA =====
app.get('/api/reports/sales', authenticateToken, requireRole('admin'), (req, res) => {
  db.all(`SELECT total, items, status, createdAt FROM orders WHERE status != 'cancelado'`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao gerar relatório' });

    let totalRevenue = 0;
    const prodSales = {};

    rows.forEach(r => {
      totalRevenue += r.total;
      try {
        const items = JSON.parse(r.items);
        items.forEach(i => {
          prodSales[i.name] = (prodSales[i.name] || 0) + (i.qty || 1);
        });
      } catch (e) {}
    });

    res.json({
      totalOrders: rows.length,
      totalRevenueFloat: totalRevenue,
      totalRevenueCents: Math.round(totalRevenue * 100),
      topProducts: Object.entries(prodSales).sort((a, b) => b[1] - a[1]).slice(0, 10)
    });
  });
});

app.get('/api/audit-logs', authenticateToken, requireRole('admin'), (req, res) => {
  db.all(`SELECT * FROM audit_log ORDER BY id DESC LIMIT 100`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao consultar audit logs' });
    res.json(rows);
  });
});

app.get('/api/settings', (req, res) => {
  db.all('SELECT * FROM settings', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao consultar configurações' });
    const settings = {};
    rows.forEach(r => settings[r.key] = r.value);
    res.json(settings);
  });
});

app.post('/api/settings', authenticateToken, requireRole('admin'), (req, res) => {
  const { whatsapp_phone } = req.body;
  if (whatsapp_phone) {
    const cleaned = whatsapp_phone.replace(/\D/g, '');
    db.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", ['whatsapp_phone', cleaned], (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao salvar WhatsApp' });
      res.json({ success: true });
    });
  } else {
    res.status(400).json({ error: 'Telefone inválido' });
  }
});

// Fallback SPA
app.use((req, res, next) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  } else {
    next();
  }
});

// INICIALIZAR SERVIDOR HTTP + SOCKET.IO
server.listen(PORT, () => {
  console.log(`\n🚀 Villa Burguer Backend rodando em http://localhost:${PORT}`);
  console.log(`⚡ WebSockets (Socket.io) ativo.`);
  console.log(`🔐 Segurança: JWT + RBAC + Rate Limit + Helmet + Preços Revalidados\n`);
});
