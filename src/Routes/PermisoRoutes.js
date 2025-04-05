const express = require("express");
const router = express.Router();
const permisoController = require("../Controllers/PermisoController");
const { verifyToken, checkRole } = require("../Middlewares/AuthMiddleware");

// Rutas protegidas
router.get("/", verifyToken, checkRole([1]), permisoController.getAllPermisos);
router.get("/:id", verifyToken, checkRole([1]), permisoController.getPermisoById);
router.post("/", verifyToken, checkRole([1]), permisoController.createPermiso);
router.put("/:id", verifyToken, checkRole([1]), permisoController.updatePermiso);
router.delete("/:id", verifyToken, checkRole([1]), permisoController.deletePermiso);

module.exports = router;
