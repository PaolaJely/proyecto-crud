const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Soporte dual: Managed DB (DATABASE_URL con SSL) o variables locales DB_*
const connectionString = process.env.DATABASE_URL;

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.DB_HOST || 'postgres-db',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
      database: process.env.DB_NAME || 'crud_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err);
});

async function waitForDb(retries = 10, delayMs = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('Conectado a la base de datos');
      return;
    } catch (err) {
      console.log(`DB no disponible (intento ${i + 1}/${retries}), reintentando en ${delayMs}ms...`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error('No se pudo conectar a la base de datos después de varios intentos');
}

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      nombre TEXT,
      correo TEXT
    )
  `);
  console.log('Tabla users lista');
}

// Rutas de diagnóstico
app.get('/', (req, res) => {
  res.status(200).type('text').send('api-service vivo. Use /api/users para la API.');
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ database: 'ok' });
  } catch (err) {
    console.error('Health check DB error:', err.message || err);
    res.status(500).json({ database: 'error', message: err.message });
  }
});

// Endpoints CRUD
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    res.json(result.rows[0] || {});
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { nombre, correo } = req.body;
    if (!nombre || !correo) {
      return res.status(400).json({ error: 'Nombre y correo son requeridos' });
    }
    const result = await pool.query(
      'INSERT INTO users (nombre, correo) VALUES ($1, $2) RETURNING *',
      [nombre, correo]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { nombre, correo } = req.body;
    if (!nombre || !correo) {
      return res.status(400).json({ error: 'Nombre y correo son requeridos' });
    }
    const result = await pool.query(
      'UPDATE users SET nombre = $1, correo = $2 WHERE id = $3 RETURNING *',
      [nombre, correo, req.params.id]
    );
    res.json(result.rows[0] || {});
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

async function start() {
  try {
    await waitForDb();
    await initDatabase();
  } catch (err) {
    console.error('Fallo al inicializar DB:', err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
}

start();
