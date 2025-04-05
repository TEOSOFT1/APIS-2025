const express = require("express");
const router = express.Router();
const proveedorController = require("../Controllers/ProveedorController");

// Rutas sin autenticación
router.get("/", proveedorController.getAllProveedores);
router.get("/search", proveedorController.searchProveedores);
router.get("/:id", proveedorController.getProveedorById);
router.post("/", proveedorController.createProveedor);
router.put("/:id", proveedorController.updateProveedor);
router.patch("/:id/status", proveedorController.toggleProveedorStatus);
router.delete("/:id", proveedorController.deleteProveedor);

module.exports = router;