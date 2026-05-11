const router = require("express").Router();
const controller = require("../controllers/pedidos.controller");
const { authenticate } = require("../middleware/auth");

router.post("/", controller.create);
router.get("/", authenticate, controller.list);
router.get("/:id", controller.getById);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;
