const express = require("express");
const router = express.Router();
const notificacionProductoController = require("../Controllers/NotificacionProductoController");

// Rutas sin autenticación
router.get("/", notificacionProductoController.getAllNotificaciones);
router.get("/:id", notificacionProductoController.getNotificacionById);
router.post("/", notificacionProductoController.createNotificacion);
router.put("/:id", notificacionProductoController.updateNotificacion);
router.delete("/:id", notificacionProductoController.deleteNotificacion);

module.exports = router;

