const express = require("express");
const router = express.Router();
const tipoServicioController = require("../Controllers/TipoServicioController");

router.get("/", tipoServicioController.getAllTiposServicio);
router.get("/:id", tipoServicioController.getTipoServicioById);
router.post("/", tipoServicioController.createTipoServicio);
router.put("/:id", tipoServicioController.updateTipoServicio);
router.delete("/:id", tipoServicioController.deleteTipoServicio);

module.exports = router;

