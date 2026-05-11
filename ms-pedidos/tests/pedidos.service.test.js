const service = require("../src/services/pedidos.service");
const repository = require("../src/repositories/pedidos.repository");

jest.mock("../src/repositories/pedidos.repository");

describe("pedidos.service", () => {
  it("createPedido calcula total", async () => {
    repository.createPedido.mockResolvedValue({
      id: "p1",
      userId: "u1",
      plan: 2,
      status: "PENDIENTE",
      total: 32990
    });

    const pedido = await service.createPedido({ userId: "u1", plan: 2 });

    expect(pedido.total).toBe(32990);
    expect(repository.createPedido).toHaveBeenCalled();
  });
});
