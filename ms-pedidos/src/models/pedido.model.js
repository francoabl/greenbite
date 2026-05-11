function mapPedido(row) {
  return {
    id: row.id,
    userId: row.user_id,
    plan: row.plan,
    status: row.status,
    total: row.total,
    createdAt: row.created_at
  };
}

module.exports = { mapPedido };
