require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// ===== SEGURANÇA =====
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false // Permite os scripts e estilos inline do index.html
}));
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Rate Limiting - proteção contra ataques brute force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máx 10 tentativas de login por IP
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' }
});

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // máx 5 cadastros por hora por IP
  message: { error: 'Limite de cadastros excedido para seu IP. Tente novamente mais tarde.' }
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 120, // máx 120 requisições por minuto por IP
  message: { error: 'Limite de requisições excedido. Aguarde um momento.' }
});

app.use('/api', apiLimiter);

const PORT = process.env.PORT || 4000;
const SECRET_KEY = process.env.SECRET_KEY || 'fallback_dev_key_change_in_production';

if (SECRET_KEY === 'fallback_dev_key_change_in_production') {
  console.warn('⚠️ AVISO DE SEGURANÇA: Chave SECRET_KEY padrão detectada! Altere no arquivo .env para ambiente de produção.');
}

// ===== SERVIR FRONTEND ESTÁTICO =====
app.use(express.static(path.join(__dirname, '..')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== UPLOAD DE IMAGENS (MULTER) =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
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

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB max

// ===== DATABASE =====
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
  if (err) console.error('Erro ao abrir banco:', err);
  else {
    console.log('✅ Banco de dados SQLite conectado.');
    initDB();
  }
});

function initDB() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      tel TEXT,
      address TEXT,
      password TEXT NOT NULL,
      isAdmin BOOLEAN DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cat TEXT NOT NULL,
      name TEXT NOT NULL,
      desc TEXT,
      base REAL NOT NULL,
      comboAdd REAL,
      img TEXT,
      tag TEXT,
      featured BOOLEAN DEFAULT 0,
      active BOOLEAN DEFAULT 1
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      userName TEXT,
      total REAL,
      items TEXT,
      type TEXT,
      address TEXT,
      payment TEXT,
      obs TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )`);

    seedAdmin();
    seedClientUser();
    seedProducts();
    seedSettings();
  });
}

async function seedAdmin() {
  db.get("SELECT * FROM users WHERE email = 'admin@villaburguer.com'", async (err, row) => {
    if (!row) {
      const hash = await bcrypt.hash('villa123', 12);
      db.run(`INSERT INTO users (name, email, password, isAdmin) VALUES (?, ?, ?, ?)`,
        ['Administrador', 'admin@villaburguer.com', hash, 1]);
      console.log('👑 Administrador criado com sucesso.');
    }
  });
}

async function seedClientUser() {
  db.get("SELECT * FROM users WHERE email = 'cliente@villaburguer.com'", async (err, row) => {
    if (!row) {
      const hash = await bcrypt.hash('cliente123', 12);
      db.run(`INSERT INTO users (name, email, tel, address, password, isAdmin) VALUES (?, ?, ?, ?, ?, ?)`,
        ['Cliente de Teste', 'cliente@villaburguer.com', '19998877665', 'Rua das Flores, 123 - Bairro Central', hash, 0]);
      console.log('👤 Usuário Cliente de teste criado com sucesso.');
    }
  });
}

function seedSettings() {
  db.get("SELECT * FROM settings WHERE key = 'whatsapp_phone'", (err, row) => {
    if (!row) {
      db.run("INSERT INTO settings (key, value) VALUES (?, ?)", ['whatsapp_phone', '5519998011043']);
    }
  });
}

function seedProducts() {
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
        { cat: 'combos2x', name: '2x Ribs Burguer Combo', desc: '2 combos completos Ribs Burguer', base: 100.00, comboAdd: null, img: 'imgs/img8.png', tag: '🥩 DUPLA COSTELA', featured: 0, active: 1 },
        { cat: 'combos2x', name: '2x Coalho Burguer Combo', desc: '2 combos completos Coalho Burguer', base: 100.00, comboAdd: null, img: 'imgs/img7.png', tag: '🔥 DUPLO COALHO', featured: 0, active: 1 },
        { cat: 'combos2x', name: '2x Mega Duplo Burguer Combo', desc: '2 combos completos Mega Duplo Burguer', base: 110.00, comboAdd: null, img: 'imgs/img2.png', tag: '👑 MONSTRO DUPLO', featured: 0, active: 1 },

        { cat: 'porcoes', name: 'Batata 400gr', desc: 'Batata frita crocante e douradinha', base: 26.00, comboAdd: null, img: 'imgs/img4.png', tag: '🍟 CROCANTE', featured: 0, active: 1 },
        { cat: 'porcoes', name: 'Batata + Cheddar + Bacon 400gr', desc: '400gr coberta com cheddar especial e bacon em cubos', base: 34.00, comboAdd: null, img: 'imgs/img5.png', tag: '🧀 IRRESISTÍVEL', featured: 0, active: 1 },
        { cat: 'porcoes', name: 'Batata + Catupiry + Costela 400gr', desc: '400gr gourmet coberta com costela desfiada e Catupiry', base: 43.00, comboAdd: null, img: 'imgs/img8.png', tag: '🥩 GOURMET', featured: 0, active: 1 },

        { cat: 'bebidas', name: 'Refri Lata 350ml', desc: 'Gelada e refrescante', base: 7.00, comboAdd: null, img: 'imgs/img4.png', tag: null, featured: 0, active: 1 },
        { cat: 'bebidas', name: 'Coca Cola 600ml', desc: 'A clássica geladinha em garrafa 600ml', base: 10.00, comboAdd: null, img: 'imgs/img4.png', tag: null, featured: 0, active: 1 },
        { cat: 'bebidas', name: 'Água s/ Gás', desc: '500ml bem gelada', base: 4.00, comboAdd: null, img: 'imgs/img4.png', tag: null, featured: 0, active: 1 },
        { cat: 'bebidas', name: 'Água c/ Gás', desc: '500ml bem gelada', base: 4.00, comboAdd: null, img: 'imgs/img4.png', tag: null, featured: 0, active: 1 },
        { cat: 'bebidas', name: 'H2OH! Limoneto', desc: 'Refrescante e leve sabor limão', base: 8.00, comboAdd: null, img: 'imgs/img4.png', tag: null, featured: 0, active: 1 },

        { cat: 'sobremesa', name: 'Pudimzinho Artesanal', desc: 'Doce tradicional cremoso e delicioso', base: 9.00, comboAdd: null, img: 'imgs/img6.png', tag: '🍮 SOBREMESA', featured: 0, active: 1 },

        { cat: 'adicional', name: 'Adicional: Maionese de Alho', desc: 'Receita caseira cremosa', base: 3.00, comboAdd: null, img: 'imgs/img1.png', tag: null, featured: 0, active: 1 },
        { cat: 'adicional', name: 'Adicional: Barbecue', desc: 'Molho defumado gourmet', base: 4.00, comboAdd: null, img: 'imgs/img3.png', tag: null, featured: 0, active: 1 },
        { cat: 'adicional', name: 'Adicional: Onion Rings (2un)', desc: 'Anéis de cebola crocantes', base: 6.00, comboAdd: null, img: 'imgs/img1.png', tag: null, featured: 0, active: 1 },
        { cat: 'adicional', name: 'Adicional: Bacon (2un)', desc: 'Fatias crocantes de bacon', base: 7.00, comboAdd: null, img: 'imgs/img3.png', tag: null, featured: 0, active: 1 },
        { cat: 'adicional', name: 'Adicional: Coalho (1un)', desc: 'Queijo coalho grelhado no maçarico', base: 9.00, comboAdd: null, img: 'imgs/img7.png', tag: null, featured: 0, active: 1 },
        { cat: 'adicional', name: 'Adicional: Costela', desc: 'Costela desfiada temperada', base: 9.00, comboAdd: null, img: 'imgs/img8.png', tag: null, featured: 0, active: 1 },
        { cat: 'adicional', name: 'Adicional: Hambúrguer extra', desc: 'Blend bovino 150g adicional', base: 12.00, comboAdd: null, img: 'imgs/img1.png', tag: null, featured: 0, active: 1 },
        { cat: 'adicional', name: 'Adicional: Batata 150gr', desc: 'Porção individual extra', base: 9.00, comboAdd: null, img: 'imgs/img4.png', tag: null, featured: 0, active: 1 },
        { cat: 'adicional', name: 'Adicional: Cheddar (2 fatias)', desc: 'Cheddar derretido especial', base: 8.00, comboAdd: null, img: 'imgs/img5.png', tag: null, featured: 0, active: 1 },
        { cat: 'adicional', name: 'Adicional: Catupiry/Molho Cheddar', desc: 'Porção extra cremosa', base: 6.00, comboAdd: null, img: 'imgs/img5.png', tag: null, featured: 0, active: 1 }
      ];

      const stmt = db.prepare(`INSERT INTO products (cat, name, desc, base, comboAdd, img, tag, featured, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      products.forEach(p => {
        stmt.run([p.cat, p.name, p.desc, p.base, p.comboAdd, p.img, p.tag, p.featured, p.active]);
      });
      stmt.finalize();
      console.log(`🍔 ${products.length} produtos cadastrados com preços do cardápio oficial.`);
    }
  });
}

// ===== MIDDLEWARE AUTH =====
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido ou expirado' });
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) return res.status(403).json({ error: 'Acesso restrito ao administrador' });
  next();
};

// ===== ROTAS DE CONFIGURAÇÕES =====
app.get('/api/settings', (req, res) => {
  db.all('SELECT * FROM settings', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao consultar configurações' });
    const settings = {};
    rows.forEach(r => settings[r.key] = r.value);
    res.json(settings);
  });
});

app.post('/api/settings', authenticateToken, requireAdmin, (req, res) => {
  const { whatsapp_phone, delivery_fee, min_order_delivery } = req.body;
  const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
  
  if (whatsapp_phone) {
    const cleaned = whatsapp_phone.replace(/\D/g, '');
    stmt.run(['whatsapp_phone', cleaned]);
  }
  if (delivery_fee !== undefined && delivery_fee !== null) {
    stmt.run(['delivery_fee', String(parseFloat(delivery_fee) || 0)]);
  }
  if (min_order_delivery !== undefined && min_order_delivery !== null) {
    stmt.run(['min_order_delivery', String(parseFloat(min_order_delivery) || 0)]);
  }
  
  stmt.finalize(err => {
    if (err) return res.status(500).json({ error: 'Erro ao salvar configurações' });
    res.json({ success: true });
  });
});

// ===== ROTAS AUTH =====
app.post('/api/signup', signupLimiter, async (req, res) => {
  const { name, email, tel, address, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  if (password.length < 6) return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return res.status(400).json({ error: 'Formato de e-mail inválido' });

  try {
    const hash = await bcrypt.hash(password, 12);
    db.run(`INSERT INTO users (name, email, tel, address, password, isAdmin) VALUES (?, ?, ?, ?, ?, 0)`,
      [name.trim(), email.toLowerCase().trim(), tel ? tel.trim() : '', address ? address.trim() : '', hash],
      function(err) {
        if (err) return res.status(400).json({ error: 'E-mail já cadastrado' });
        const token = jwt.sign({ id: this.lastID, name: name.trim(), email: email.toLowerCase().trim(), isAdmin: 0, tel, address }, SECRET_KEY, { expiresIn: '7d' });
        res.json({ token, user: { id: this.lastID, name: name.trim(), email: email.trim(), tel, address, isAdmin: 0 } });
      });
  } catch (e) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

app.post('/api/login', loginLimiter, (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Credenciais inválidas' });

  db.get(`SELECT * FROM users WHERE email = ?`, [email.toLowerCase().trim()], async (err, user) => {
    if (err || !user) return res.status(400).json({ error: 'E-mail ou senha incorretos' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'E-mail ou senha incorretos' });

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin, tel: user.tel, address: user.address }, SECRET_KEY, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, tel: user.tel, address: user.address, isAdmin: user.isAdmin } });
  });
});

app.put('/api/user/password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Informe a senha atual e a nova senha' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres' });

  db.get(`SELECT * FROM users WHERE id = ?`, [req.user.id], async (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'Usuário não encontrado' });
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ error: 'Senha atual incorreta' });

    const newHash = await bcrypt.hash(newPassword, 12);
    db.run(`UPDATE users SET password = ? WHERE id = ?`, [newHash, req.user.id], function(err) {
      if (err) return res.status(500).json({ error: 'Erro ao atualizar senha' });
      res.json({ success: true, message: 'Senha alterada com sucesso' });
    });
  });
});

// ===== ROTAS PRODUTOS =====
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

app.post('/api/products', authenticateToken, requireAdmin, (req, res) => {
  const { cat, name, desc, base, comboAdd, img, tag, featured, active } = req.body;
  if (!name || !cat || base === undefined || base === null) {
    return res.status(400).json({ error: 'Nome, categoria e preço base são obrigatórios' });
  }

  db.run(`INSERT INTO products (cat, name, desc, base, comboAdd, img, tag, featured, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [cat, name.trim(), desc ? desc.trim() : '', parseFloat(base), comboAdd ? parseFloat(comboAdd) : null, img || 'imgs/img1.png', tag || null, featured ? 1 : 0, active ? 1 : 0],
    function(err) {
      if (err) return res.status(500).json({ error: 'Erro ao cadastrar produto' });
      res.json({ id: this.lastID, success: true });
    });
});

app.put('/api/products/:id', authenticateToken, requireAdmin, (req, res) => {
  const { cat, name, desc, base, comboAdd, featured, active, img, tag } = req.body;

  db.get("SELECT * FROM products WHERE id = ?", [req.params.id], (err, current) => {
    if (err || !current) return res.status(404).json({ error: 'Produto não encontrado' });

    const newCat = cat !== undefined ? cat : current.cat;
    const newName = name !== undefined ? name.trim() : current.name;
    const newDesc = desc !== undefined ? desc.trim() : current.desc;
    const newBase = base !== undefined ? parseFloat(base) : current.base;
    const newComboAdd = comboAdd !== undefined ? (comboAdd !== null ? parseFloat(comboAdd) : null) : current.comboAdd;
    const newFeatured = featured !== undefined ? (featured ? 1 : 0) : current.featured;
    const newActive = active !== undefined ? (active ? 1 : 0) : current.active;
    const newImg = img !== undefined ? img : current.img;
    const newTag = tag !== undefined ? tag : current.tag;

    db.run(
      `UPDATE products SET cat = ?, name = ?, desc = ?, base = ?, comboAdd = ?, featured = ?, active = ?, img = ?, tag = ? WHERE id = ?`,
      [newCat, newName, newDesc, newBase, newComboAdd, newFeatured, newActive, newImg, newTag, req.params.id],
      function(err) {
        if (err) return res.status(500).json({ error: 'Erro ao atualizar produto' });
        res.json({ success: true });
      }
    );
  });
});

app.delete('/api/products/:id', authenticateToken, requireAdmin, (req, res) => {
  db.run(`DELETE FROM products WHERE id = ?`, [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Erro ao excluir produto' });
    res.json({ success: true });
  });
});

// ===== UPLOAD DE IMAGEM =====
app.post('/api/upload', authenticateToken, requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada' });
  res.json({ url: `/uploads/${req.file.filename}`, success: true });
});

// ===== ROTAS PEDIDOS =====
app.post('/api/orders', authenticateToken, (req, res) => {
  const { total, items, type, address, payment, obs } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'O pedido precisa conter pelo menos um item.' });
  }
  if (!total || total <= 0) {
    return res.status(400).json({ error: 'Valor total do pedido inválido.' });
  }

  db.run(`INSERT INTO orders (userId, userName, total, items, type, address, payment, obs) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.user.id, req.user.name, parseFloat(total), JSON.stringify(items), type, address, payment, obs],
    function(err) {
      if (err) return res.status(500).json({ error: 'Erro ao salvar pedido' });
      res.json({ id: this.lastID, success: true });
    });
});

app.get('/api/orders', authenticateToken, (req, res) => {
  const query = req.user.isAdmin ? `SELECT * FROM orders ORDER BY id DESC LIMIT 50` : `SELECT * FROM orders WHERE userId = ? ORDER BY id DESC`;
  const params = req.user.isAdmin ? [] : [req.user.id];
  
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao consultar pedidos' });
    res.json(rows.map(r => ({ ...r, items: JSON.parse(r.items) })));
  });
});

// ===== FALLBACK: Servir index.html para qualquer rota não-API =====
app.use((req, res, next) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  } else {
    next();
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Villa Burguer Backend rodando em http://localhost:${PORT}`);
  console.log(`🌐 Frontend disponível em http://localhost:${PORT}`);
  console.log(`🔐 Segurança: Helmet + Rate Limiting + JWT + Bcrypt(12)\n`);
});

