const express = require("express");
const router = express.Router();
const detalleVentaController = require("../Controllers/DetalleVentaController");

// Rutas sin autenticación
router.get("/", detalleVentaController.getAllDetallesVenta);
router.get("/:id", detalleVentaController.getDetalleVentaById);
router.get("/venta/:ventaId", detalleVentaController.getDetallesByVenta);
router.get("/producto/:productoId", detalleVentaController.getDetallesByProducto);
router.post("/", detalleVentaController.createDetalleVenta);
router.put("/:id", detalleVentaController.updateDetalleVenta);
router.delete("/:id", detalleVentaController.deleteDetalleVenta);

module.exports = router;