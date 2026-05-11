const service = require("../services/pedidos.service");

async function create(req, res, next) {
  try {
    const data = await service.createPedido(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const data = await service.listPedidos(req.query.userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const data = await service.getPedidoById(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const data = await service.updatePedido(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const data = await service.removePedido(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, getById, update, remove };
