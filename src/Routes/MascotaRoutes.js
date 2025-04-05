const express = require("express");
const router = express.Router();
const mascotaController = require("../Controllers/MascotaController");

// Rutas sin autenticación
router.get("/", mascotaController.getAllMascotas);
router.get("/search", mascotaController.searchMascotas);
router.get("/:id", mascotaController.getMascotaById);
router.post("/", mascotaController.createMascota);
router.put("/:id", mascotaController.updateMascota);
router.delete("/:id", mascotaController.deleteMascota);

module.exports = router;