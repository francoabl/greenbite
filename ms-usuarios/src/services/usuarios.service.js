const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const repository = require("../repositories/usuarios.repository");
const { badRequest, conflict, notFound, unauthorized } = require("../utils/httpErrors");

function validateRegister({ nombre, email, password }) {
  if (!nombre || !email || !password) {
    throw badRequest("nombre, email y password son obligatorios");
  }
}

function validateLogin({ email, password }) {
  if (!email || !password) {
    throw badRequest("email y password son obligatorios");
  }
}

function signToken(user) {
  const secret = process.env.JWT_SECRET || "dev_secret";
  return jwt.sign({ sub: user.id, email: user.email }, secret, { expiresIn: "2h" });
}

async function registerUser(payload) {
  validateRegister(payload);

  const existing = await repository.findByEmail(payload.email);
  if (existing) {
    throw conflict("Email ya registrado");
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);
  const user = await repository.createUser({
    id: uuidv4(),
    nombre: payload.nombre,
    email: payload.email,
    passwordHash
  });

  return { user, token: signToken(user) };
}

async function loginUser(payload) {
  validateLogin(payload);
  const userRecord = await repository.findByEmail(payload.email);
  if (!userRecord) {
    throw unauthorized("Credenciales invalidas");
  }

  const matches = await bcrypt.compare(payload.password, userRecord.passwordHash);
  if (!matches) {
    throw unauthorized("Credenciales invalidas");
  }

  const { passwordHash, ...safeUser } = userRecord;
  return { user: safeUser, token: signToken(safeUser) };
}

async function listUsers() {
  const users = await repository.listUsers();
  return { items: users };
}

async function getUserById(id) {
  const user = await repository.findById(id);
  if (!user) {
    throw notFound("Usuario no encontrado");
  }
  return user;
}

async function updateUser(id, payload) {
  const updates = {
    nombre: payload.nombre,
    email: payload.email
  };

  if (payload.password) {
    updates.passwordHash = await bcrypt.hash(payload.password, 10);
  }

  const user = await repository.updateUser(id, updates);
  if (!user) {
    throw notFound("Usuario no encontrado");
  }
  return user;
}

async function removeUser(id) {
  const deleted = await repository.deleteUser(id);
  if (!deleted) {
    throw notFound("Usuario no encontrado");
  }
  return { ok: true };
}

module.exports = {
  registerUser,
  loginUser,
  listUsers,
  getUserById,
  updateUser,
  removeUser
};
