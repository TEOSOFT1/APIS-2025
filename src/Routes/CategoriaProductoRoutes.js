const express = require("express");
const router = express.Router();
const categoriaProductoController = require("../Controllers/CategoriaProductoController");

// Rutas para categorías de productos
router.get("/", categoriaProductoController.getAllCategoriasProducto);
router.get("/:id", categoriaProductoController.getCategoriaProductoById);
router.post("/", categoriaProductoController.createCategoriaProducto);
router.put("/:id", categoriaProductoController.updateCategoriaProducto);
router.delete("/:id", categoriaProductoController.deleteCategoriaProducto);

module.exports = router;