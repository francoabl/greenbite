const express = require("express");
const cors = require("cors");
const pedidosRoutes = require("./routes/pedidos.routes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/pedidos", pedidosRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
