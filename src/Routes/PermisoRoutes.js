const express = require("express");
const router = express.Router();
const permisoController = require("../Controllers/PermisoController");

// Rutas sin autenticación
router.get("/", permisoController.getAllPermisos);
router.get("/:id", permisoController.getPermisoById);
router.post("/", permisoController.createPermiso);
router.put("/:id", permisoController.updatePermiso);
router.delete("/:id", permisoController.deletePermiso);

module.exports = router;
