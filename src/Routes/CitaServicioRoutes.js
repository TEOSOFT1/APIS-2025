const express = require("express");
const router = express.Router();
const citaServicioController = require("../Controllers/CitaServicioController");

// Verifica que todas las funciones están definidas antes de usarlas
if (
  !citaServicioController ||
  !citaServicioController.getAllCitaServicios ||
  !citaServicioController.getServiciosByCita ||
  !citaServicioController.getCitasByServicio ||
  !citaServicioController.addServicioToCita ||
  !citaServicioController.removeServicioFromCita
) {
  throw new Error("Error: No se encontraron todas las funciones en CitaServicioController");
}

// Rutas
router.get("/", citaServicioController.getAllCitaServicios);
router.get("/cita/:idCita", citaServicioController.getServiciosByCita);
router.get("/servicio/:idServicio", citaServicioController.getCitasByServicio);
router.post("/", citaServicioController.addServicioToCita);
router.delete("/:id", citaServicioController.removeServicioFromCita);

module.exports = router;
