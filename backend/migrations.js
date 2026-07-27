/**
 * Sistema de Migrações do Banco de Dados SQLite (Villa Burguer v2)
 * Garante alteração de schema segura, idempotente e retrocompatível.
 */
function runMigrations(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      console.log('🔄 Executando migrações de banco de dados...');

      // 1. Tabela users - Adicionar coluna role se não existir
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        tel TEXT,
        address TEXT,
        password TEXT NOT NULL,
        isAdmin BOOLEAN DEFAULT 0,
        role TEXT DEFAULT 'cliente',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) console.error('Erro na tabela users:', err);
      });

      // Tentar adicionar coluna role em bancos existentes
      db.run(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'cliente'`, () => {});

      // Synchronizar isAdmin com role
      db.run(`UPDATE users SET role = 'admin' WHERE isAdmin = 1 AND (role IS NULL OR role = 'cliente')`, () => {});

      // 2. Tabela products
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

      // 3. Tabela orders
      db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        userName TEXT,
        total REAL NOT NULL,
        items TEXT NOT NULL,
        type TEXT,
        address TEXT,
        payment TEXT,
        obs TEXT,
        orderCode TEXT UNIQUE,
        trackingToken TEXT UNIQUE,
        guestToken TEXT,
        status TEXT DEFAULT 'pendente',
        cancelReason TEXT,
        clientName TEXT,
        clientPhone TEXT,
        clientAddress TEXT,
        estimatedTime INTEGER DEFAULT 40,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // ALTER TABLE para colunas novas em ordens legadas
      const orderColumns = [
        `ALTER TABLE orders ADD COLUMN orderCode TEXT`,
        `ALTER TABLE orders ADD COLUMN trackingToken TEXT`,
        `ALTER TABLE orders ADD COLUMN guestToken TEXT`,
        `ALTER TABLE orders ADD COLUMN status TEXT DEFAULT 'pendente'`,
        `ALTER TABLE orders ADD COLUMN cancelReason TEXT`,
        `ALTER TABLE orders ADD COLUMN clientName TEXT`,
        `ALTER TABLE orders ADD COLUMN clientPhone TEXT`,
        `ALTER TABLE orders ADD COLUMN clientAddress TEXT`,
        `ALTER TABLE orders ADD COLUMN estimatedTime INTEGER DEFAULT 40`,
        `ALTER TABLE orders ADD COLUMN updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP`
      ];

      orderColumns.forEach(query => db.run(query, () => {}));

      // 4. Tabela payments
      db.run(`CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderId INTEGER NOT NULL,
        method TEXT NOT NULL,              -- 'pix' | 'credit' | 'debit' | 'entrega'
        status TEXT DEFAULT 'pendente',    -- 'pendente' | 'aprovado' | 'recusado' | 'estornado'
        gatewayTransactionId TEXT UNIQUE,
        amount INTEGER NOT NULL,           -- valor em centavos (inteiro)
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        paidAt DATETIME,
        FOREIGN KEY (orderId) REFERENCES orders(id)
      )`);

      // 5. Tabela audit_log
      db.run(`CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        performed_by INTEGER,
        performed_by_name TEXT,
        target TEXT,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // 6. Criar Índices de Alta Performance
      db.run(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_orders_code ON orders(orderCode)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_orders_tracking ON orders(trackingToken)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(orderId)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_payments_gateway ON payments(gatewayTransactionId)`);

      // 7. Tabela settings
      db.run(`CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )`, (err) => {
        if (err) return reject(err);
        console.log('✅ Migrações concluídas com sucesso.');
        resolve();
      });
    });
  });
}

module.exports = { runMigrations };
