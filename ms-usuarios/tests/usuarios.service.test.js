const bcrypt = require("bcryptjs");
const service = require("../src/services/usuarios.service");
const repository = require("../src/repositories/usuarios.repository");

jest.mock("../src/repositories/usuarios.repository");

describe("usuarios.service", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "test_secret";
  });

  it("registerUser crea usuario y token", async () => {
    repository.findByEmail.mockResolvedValue(null);
    repository.createUser.mockResolvedValue({
      id: "u1",
      nombre: "Ana",
      email: "ana@test.com"
    });

    const result = await service.registerUser({
      nombre: "Ana",
      email: "ana@test.com",
      password: "123456"
    });

    expect(result.user.email).toBe("ana@test.com");
    expect(result.token).toBeDefined();
  });

  it("loginUser rechaza credenciales invalidas", async () => {
    const passwordHash = await bcrypt.hash("123456", 10);
    repository.findByEmail.mockResolvedValue({
      id: "u1",
      nombre: "Ana",
      email: "ana@test.com",
      passwordHash
    });

    await expect(
      service.loginUser({ email: "ana@test.com", password: "wrong" })
    ).rejects.toBeDefined();
  });
});
