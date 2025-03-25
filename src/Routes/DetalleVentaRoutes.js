const express = require("express");
const router = express.Router();
const detalleVentaServicioController = require("../Controllers/DetalleVentaServicioController");

router.get("/", detalleVentaServicioController.getAllDetallesVentaServicio);
router.get("/venta/:id", detalleVentaServicioController.getDetallesVentaServicioByVenta);
router.get("/:id", detalleVentaServicioController.getDetalleVentaServicioById);
router.post("/", detalleVentaServicioController.addServicioToVenta);
router.put("/:id", detalleVentaServicioController.updateDetalleVentaServicio);
router.delete("/:id", detalleVentaServicioController.removeServicioFromVenta);

module.exports = router;
