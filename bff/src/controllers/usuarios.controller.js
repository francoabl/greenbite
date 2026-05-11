const service = require("../services/usuarios.service");
const { mapServiceError } = require("../utils/mapServiceError");

async function register(req, res, next) {
  try {
    const data = await service.register(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(mapServiceError(err));
  }
}

async function login(req, res, next) {
  try {
    const data = await service.login(req.body);
    res.json(data);
  } catch (err) {
    next(mapServiceError(err));
  }
}

async function list(req, res, next) {
  try {
    const data = await service.list();
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

module.exports = { register, login, list, getById, update, remove };
