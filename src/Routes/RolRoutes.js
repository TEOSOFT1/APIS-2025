const express = require("express");
const router = express.Router();
const rolController = require("../Controllers/RolController");
const { verifyToken, checkRole } = require("../Middlewares/AuthMiddleware");

// Rutas protegidas
router.get("/", verifyToken, checkRole([1]), rolController.getAllRoles);
router.get("/:id", verifyToken, checkRole([1]), rolController.getRolById);
router.post("/", verifyToken, checkRole([1]), rolController.createRol);
router.put("/:id", verifyToken, checkRole([1]), rolController.updateRol);
router.delete("/:id", verifyToken, checkRole([1]), rolController.deleteRol);

module.exports = router;