const express = require("express");
const router = express.Router();
const citaController = require("../Controllers/AgendamientoCitaController");

router.get("/", citaController.getAllCitas);
router.get("/:id", citaController.getCitaById);
router.post("/", citaController.createCita);
router.put("/:id", citaController.updateCita);
router.delete("/:id", citaController.deleteCita);

module.exports = router;