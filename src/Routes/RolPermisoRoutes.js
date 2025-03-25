const express = require("express");
const router = express.Router();
const rolPermisoController = require("../Controllers/RolPermisoController");

// Rutas para rol-permisos
router.get("/", rolPermisoController.getAllRolPermisos);
router.get("/:id", rolPermisoController.getRolPermisoById);
router.post("/", rolPermisoController.createRolPermiso);
router.put("/:id", rolPermisoController.updateRolPermiso);
router.delete("/:id", rolPermisoController.deleteRolPermiso);

module.exports = router;
