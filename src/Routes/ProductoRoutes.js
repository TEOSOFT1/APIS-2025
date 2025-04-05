const express = require("express");
const router = express.Router();
const productoController = require("../Controllers/ProductoController");

// Rutas sin autenticación
router.get("/", productoController.getAllProductos);
router.get("/search", productoController.searchProductos);
router.get("/:id", productoController.getProductoById);
router.post("/", productoController.createProducto);
router.put("/:id", productoController.updateProducto);
router.patch("/:id/status", productoController.toggleProductoStatus);
router.patch("/:id/stock", productoController.updateStock);
router.delete("/:id", productoController.deleteProducto);

module.exports = router;