function mapUser(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    email: row.email,
    createdAt: row.created_at
  };
}

function mapUserWithPassword(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at
  };
}

module.exports = { mapUser, mapUserWithPassword };
