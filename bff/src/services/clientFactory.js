const axios = require("axios");

function createClient(baseURL) {
  return axios.create({
    baseURL,
    timeout: 8000,
    headers: { "Content-Type": "application/json" }
  });
}

function createClients() {
  return {
    usuarios: createClient(process.env.USUARIOS_SERVICE_URL),
    pedidos: createClient(process.env.PEDIDOS_SERVICE_URL)
  };
}

const clients = createClients();

module.exports = { clients, createClient };
