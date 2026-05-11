const express = require("express");
const cors = require("cors");
const usuariosRoutes = require("./routes/usuarios.routes");
const pedidosRoutes = require("./routes/pedidos.routes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/usuarios", usuariosRoutes);
app.use("/api/pedidos", pedidosRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
