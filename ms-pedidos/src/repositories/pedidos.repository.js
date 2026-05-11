const { getPool } = require("../database/db");
const { mapPedido } = require("../models/pedido.model");

async function createPedido({ id, userId, plan, status, total }) {
  const pool = getPool();
  const result = await pool.query(
    "INSERT INTO pedidos (id, user_id, plan, status, total) VALUES ($1, $2, $3, $4, $5) RETURNING id, user_id, plan, status, total, created_at",
    [id, userId, plan, status, total]
  );
  return mapPedido(result.rows[0]);
}

async function listPedidos() {
  const pool = getPool();
  const result = await pool.query(
    "SELECT id, user_id, plan, status, total, created_at FROM pedidos ORDER BY created_at DESC"
  );
  return result.rows.map(mapPedido);
}

async function findById(id) {
  const pool = getPool();
  const result = await pool.query(
    "SELECT id, user_id, plan, status, total, created_at FROM pedidos WHERE id = $1",
    [id]
  );
  return result.rows[0] ? mapPedido(result.rows[0]) : null;
}

async function updatePedido(id, updates) {
  const fields = [];
  const values = [];
  let idx = 1;

  if (updates.status) {
    fields.push(`status = $${idx++}`);
    values.push(updates.status);
  }
  if (updates.plan) {
    fields.push(`plan = $${idx++}`);
    values.push(updates.plan);
  }
  if (updates.total) {
    fields.push(`total = $${idx++}`);
    values.push(updates.total);
  }

  if (fields.length === 0) {
    return findById(id);
  }

  values.push(id);
  const result = await getPool().query(
    `UPDATE pedidos SET ${fields.join(", ")} WHERE id = $${idx} RETURNING id, user_id, plan, status, total, created_at`,
    values
  );

  return result.rows[0] ? mapPedido(result.rows[0]) : null;
}

async function deletePedido(id) {
  const pool = getPool();
  const result = await pool.query("DELETE FROM pedidos WHERE id = $1", [id]);
  return result.rowCount > 0;
}

module.exports = {
  createPedido,
  listPedidos,
  findById,
  updatePedido,
  deletePedido
};
