const express = require("express")
const router = express.Router()
const detalleCompraController = require("../Controllers/DetalleCompraController")

// Ruta para verificar la estructura de la tabla
router.get("/estructura", detalleCompraController.verificarEstructura)

// Ruta base para obtener todos los detalles de compras
router.get("/", detalleCompraController.getAllDetalleCompras)

// Obtener un detalle específico por su ID
router.get("/:idDetalle", detalleCompraController.getDetalleById)

// Rutas específicas
router.get("/compra/:idCompra", detalleCompraController.getDetallesByCompra)
router.post("/", detalleCompraController.addDetalleCompra)
router.put("/:idDetalle", detalleCompraController.updateDetalleCompra)
router.delete("/:idDetalle", detalleCompraController.deleteDetalleCompra)

module.exports = router

