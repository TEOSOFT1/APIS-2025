const express = require("express");
const router = express.Router();
const mascotaController = require("../Controllers/MascotaController");

// Rutas para mascotas
router.get("/", mascotaController.getAllMascotas); // Obtener todas las mascotas
router.get("/:id", mascotaController.getMascotaById); // Obtener una mascota por ID
router.post("/", mascotaController.createMascota); // Crear una nueva mascota
router.put("/:id", mascotaController.updateMascota); // Actualizar una mascota
router.delete("/:id", mascotaController.deleteMascota); // Eliminar una mascota

module.exports = router;
