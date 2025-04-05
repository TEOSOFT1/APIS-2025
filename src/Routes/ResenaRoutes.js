const express = require("express");
const router = express.Router();
const resenaController = require("../Controllers/ResenaController");

// Rutas para reseñas
router.get("/", resenaController.getAllResenas);
router.get("/cliente/:idCliente", resenaController.getResenasByCliente);
router.get("/:id", resenaController.getResenaById);
router.post("/", resenaController.createResena);
router.put("/:id", resenaController.updateResena);
router.delete("/:id", resenaController.deleteResena);

module.exports = router;