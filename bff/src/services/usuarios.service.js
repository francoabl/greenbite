const { clients } = require("./clientFactory");

async function register(payload) {
  const response = await clients.usuarios.post("/usuarios/register", payload);
  return response.data;
}

async function login(payload) {
  const response = await clients.usuarios.post("/usuarios/login", payload);
  return response.data;
}

async function list() {
  const response = await clients.usuarios.get("/usuarios");
  return response.data;
}

async function getById(id) {
  const response = await clients.usuarios.get(`/usuarios/${id}`);
  return response.data;
}

async function update(id, payload) {
  const response = await clients.usuarios.put(`/usuarios/${id}`, payload);
  return response.data;
}

async function remove(id) {
  const response = await clients.usuarios.delete(`/usuarios/${id}`);
  return response.data;
}

module.exports = { register, login, list, getById, update, remove };
