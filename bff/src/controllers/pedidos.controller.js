const service = require("../services/pedidos.service");
const { mapServiceError } = require("../utils/mapServiceError");

async function create(req, res, next) {
  try {
    const data = await service.create(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(mapServiceError(err));
  }
}

async function list(req, res, next) {
  try {
    const data = await service.list(req.userId);
    res.json(data);
  } catch (err) {
    next(mapServiceError(err));
  }
}

async function getById(req, res, next) {
  try {
    const data = await service.getById(req.params.id);
    res.json(data);
  } catch (err) {
    next(mapServiceError(err));
  }
}

async function update(req, res, next) {
  try {
    const data = await service.update(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(mapServiceError(err));
  }
}

async function remove(req, res, next) {
  try {
    const data = await service.remove(req.params.id);
    res.json(data);
  } catch (err) {
    next(mapServiceError(err));
  }
}

module.exports = { create, list, getById, update, remove };
