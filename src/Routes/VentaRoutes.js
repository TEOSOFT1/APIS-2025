const express = require("express");
const router = express.Router();
const ventasController = require("../Controllers/VentaController");

// Definición de rutas
router.get("/", ventasController.getAllVentas);
router.get("/:id", ventasController.getVentaById);
router.post("/", ventasController.createVenta);
router.put("/:id", ventasController.updateVenta);
router.put("/devolver/:id", ventasController.devolverVenta);
router.put("/anular/:id", ventasController.anularVenta);

module.exports = router;
