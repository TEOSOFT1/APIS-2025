const express = require("express");
const router = express.Router();
const categoriaProductoController = require("../Controllers/CategoriaProductoController");

// Rutas sin autenticación
router.get("/", categoriaProductoController.getAllCategorias);
router.get("/:id", categoriaProductoController.getCategoriaById);
router.post("/", categoriaProductoController.createCategoria);
router.put("/:id", categoriaProductoController.updateCategoria);
router.patch("/:id/status", categoriaProductoController.toggleCategoriaStatus);
router.delete("/:id", categoriaProductoController.deleteCategoria);

module.exports = router;