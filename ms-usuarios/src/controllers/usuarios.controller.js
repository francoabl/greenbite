const service = require("../services/usuarios.service");

async function register(req, res, next) {
  try {
    const data = await service.registerUser(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const data = await service.loginUser(req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const data = await service.listUsers();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const data = await service.getUserById(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const data = await service.updateUser(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const data = await service.removeUser(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, list, getById, update, remove };
