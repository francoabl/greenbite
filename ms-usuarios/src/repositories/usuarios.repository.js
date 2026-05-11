const { getPool } = require("../database/db");
const { mapUser, mapUserWithPassword } = require("../models/usuario.model");

async function createUser({ id, nombre, email, passwordHash }) {
  const pool = getPool();
  const result = await pool.query(
    "INSERT INTO usuarios (id, nombre, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, created_at",
    [id, nombre, email, passwordHash]
  );
  return mapUser(result.rows[0]);
}

async function findByEmail(email) {
  const pool = getPool();
  const result = await pool.query(
    "SELECT id, nombre, email, password_hash, created_at FROM usuarios WHERE email = $1",
    [email]
  );
  if (!result.rows[0]) {
    return null;
  }
  return mapUserWithPassword(result.rows[0]);
}

async function findById(id) {
  const pool = getPool();
  const result = await pool.query(
    "SELECT id, nombre, email, created_at FROM usuarios WHERE id = $1",
    [id]
  );
  return result.rows[0] ? mapUser(result.rows[0]) : null;
}

async function listUsers() {
  const pool = getPool();
  const result = await pool.query(
    "SELECT id, nombre, email, created_at FROM usuarios ORDER BY created_at DESC"
  );
  return result.rows.map(mapUser);
}

async function updateUser(id, updates) {
  const fields = [];
  const values = [];
  let idx = 1;

  if (updates.nombre) {
    fields.push(`nombre = $${idx++}`);
    values.push(updates.nombre);
  }
  if (updates.email) {
    fields.push(`email = $${idx++}`);
    values.push(updates.email);
  }
  if (updates.passwordHash) {
    fields.push(`password_hash = $${idx++}`);
    values.push(updates.passwordHash);
  }

  if (fields.length === 0) {
    return findById(id);
  }

  values.push(id);
  const result = await getPool().query(
    `UPDATE usuarios SET ${fields.join(", ")} WHERE id = $${idx} RETURNING id, nombre, email, created_at`,
    values
  );

  return result.rows[0] ? mapUser(result.rows[0]) : null;
}

async function deleteUser(id) {
  const pool = getPool();
  const result = await pool.query("DELETE FROM usuarios WHERE id = $1", [id]);
  return result.rowCount > 0;
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  listUsers,
  updateUser,
  deleteUser
};
