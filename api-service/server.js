const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err);
});

app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
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
    res.json(result.rows[0]);
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
    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

// Iniciar servidor en puerto 3000
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

function initDatabase() {
  pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      nombre TEXT,
      correo TEXT
    )
  `).then(() => {
    console.log('Tabla users lista');
  }).catch((err) => {
    console.error('Error al crear tabla, reintentando en 2 segundos...', err.message);
    setTimeout(initDatabase, 2000);
  });
}

initDatabase();
