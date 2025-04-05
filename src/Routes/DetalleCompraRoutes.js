const express = require("express");
const router = express.Router();
const detalleCompraController = require("../Controllers/DetalleCompraController");

// Rutas sin autenticación
router.get("/", detalleCompraController.getAllDetallesCompra);
router.get("/:id", detalleCompraController.getDetalleCompraById);
router.get("/compra/:compraId", detalleCompraController.getDetallesByCompra);
router.get("/producto/:productoId", detalleCompraController.getDetallesByProducto);
router.post("/", detalleCompraController.createDetalleCompra);
router.put("/:id", detalleCompraController.updateDetalleCompra);
router.delete("/:id", detalleCompraController.deleteDetalleCompra);

module.exports = router;