const express = require("express");
const router = express.Router();
const detalleVentaServicioController = require("../Controllers/DetalleVentaServicioController");

// Rutas sin autenticación
router.get("/", detalleVentaServicioController.getAllDetallesVentaServicio);
router.get("/:id", detalleVentaServicioController.getDetalleVentaServicioById);
router.get("/venta/:ventaId", detalleVentaServicioController.getDetallesByVenta);
router.get("/servicio/:servicioId", detalleVentaServicioController.getDetallesByServicio);
router.get("/mascota/:mascotaId", detalleVentaServicioController.getDetallesByMascota);
router.post("/", detalleVentaServicioController.createDetalleVentaServicio);
router.put("/:id", detalleVentaServicioController.updateDetalleVentaServicio);
router.delete("/:id", detalleVentaServicioController.deleteDetalleVentaServicio);

module.exports = router;