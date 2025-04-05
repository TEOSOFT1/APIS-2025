const express = require("express");
const router = express.Router();
const citaServicioController = require("../Controllers/CitaServicioController");

// Rutas sin autenticación
router.get("/", citaServicioController.getAllCitaServicios);
router.get("/:id", citaServicioController.getCitaServicioById);
router.get("/cita/:citaId", citaServicioController.getServiciosByCita);
router.post("/", citaServicioController.createCitaServicio);
router.delete("/:id", citaServicioController.deleteCitaServicio);

module.exports = router;