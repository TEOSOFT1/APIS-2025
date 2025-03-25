const express = require("express");
const router = express.Router();
const compraController = require("../Controllers/CompraController");

// ✅ Rutas de compras
router.get("/", compraController.getAllCompras);
router.get("/proveedor/:idProveedor", compraController.getComprasByProveedor);
router.get("/:id", compraController.getCompraById);
router.get("/:id/detalles", compraController.getDetallesCompra);
router.post("/", compraController.createCompra);
router.put("/:id", compraController.updateCompra);  // 🔹 Verifica que esta línea esté presente
router.patch("/:id/estado", compraController.updateEstadoCompra);

module.exports = router;

