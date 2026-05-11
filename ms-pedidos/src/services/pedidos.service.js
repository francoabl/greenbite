const { v4: uuidv4 } = require("uuid");
const repository = require("../repositories/pedidos.repository");
const { badRequest, notFound } = require("../utils/httpErrors");

const PLAN_PRICES = {
  1: 18990,
  2: 32990,
  4: 59990
};

function getTotal(plan) {
  const total = PLAN_PRICES[plan];
  if (!total) {
    throw badRequest("Plan invalido");
  }
  return total;
}

function validateCreate({ userId, plan }) {
  if (!userId || !plan) {
    throw badRequest("userId y plan son obligatorios");
  }
}

async function createPedido(payload) {
  validateCreate(payload);
  const total = getTotal(Number(payload.plan));
  const pedido = await repository.createPedido({
    id: uuidv4(),
    userId: payload.userId,
    plan: Number(payload.plan),
    status: "PENDIENTE",
    total
  });
  return pedido;
}

async function listPedidos() {
  const pedidos = await repository.listPedidos();
  return { items: pedidos };
}

async function getPedidoById(id) {
  const pedido = await repository.findById(id);
  if (!pedido) {
    throw notFound("Pedido no encontrado");
  }
  return pedido;
}

async function updatePedido(id, payload) {
  const updates = {
    status: payload.status,
    plan: payload.plan ? Number(payload.plan) : undefined
  };

  if (updates.plan) {
    updates.total = getTotal(updates.plan);
  }

  const pedido = await repository.updatePedido(id, updates);
  if (!pedido) {
    throw notFound("Pedido no encontrado");
  }
  return pedido;
}

async function removePedido(id) {
  const deleted = await repository.deletePedido(id);
  if (!deleted) {
    throw notFound("Pedido no encontrado");
  }
  return { ok: true };
}

module.exports = {
  createPedido,
  listPedidos,
  getPedidoById,
  updatePedido,
  removePedido
};
