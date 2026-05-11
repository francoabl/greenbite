const { clients } = require("./clientFactory");

async function create(payload) {
  const response = await clients.pedidos.post("/pedidos", payload);
  return response.data;
}

async function list(userId) {
  const response = await clients.pedidos.get("/pedidos", {
    params: { userId }
  });
  return response.data;
}

async function getById(id) {
  const response = await clients.pedidos.get(`/pedidos/${id}`);
  return response.data;
}

async function update(id, payload) {
  const response = await clients.pedidos.put(`/pedidos/${id}`, payload);
  return response.data;
}

async function remove(id) {
  const response = await clients.pedidos.delete(`/pedidos/${id}`);
  return response.data;
}

module.exports = { create, list, getById, update, remove };
