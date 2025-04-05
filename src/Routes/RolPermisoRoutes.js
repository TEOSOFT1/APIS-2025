const express = require("express");
const router = express.Router();
const rolPermisoController = require("../Controllers/RolPermisoController");
const { verifyToken, checkRole } = require("../Middlewares/AuthMiddleware");

// Rutas protegidas
router.get("/", verifyToken, checkRole([1]), rolPermisoController.getAllRolPermisos);
router.get("/:id", verifyToken, checkRole([1]), rolPermisoController.getRolPermisoById);
router.post("/", verifyToken, checkRole([1]), rolPermisoController.createRolPermiso);
router.put("/:id", verifyToken, checkRole([1]), rolPermisoController.updateRolPermiso);
router.delete("/:id", verifyToken, checkRole([1]), rolPermisoController.deleteRolPermiso);

module.exports = router;
