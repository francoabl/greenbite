const router = require("express").Router();
const controller = require("../controllers/usuarios.controller");

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/", controller.list);
router.get("/:id", controller.getById);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;
