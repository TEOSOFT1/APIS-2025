const express = require("express");
const router = express.Router();
const notificacionProductoController = require("../Controllers/NotificacionProductoController");

// Rutas sin autenticación
router.get("/", notificacionProductoController.getAllNotificaciones);
router.get("/:id", notificacionProductoController.getNotificacionById);
router.get("/producto/:productoId", notificacionProductoController.getNotificacionesByProducto);
router.get("/tipo/:tipo", notificacionProductoController.getNotificacionesByTipo);
router.get("/estado/:estado", notificacionProductoController.getNotificacionesByEstado);
router.post("/", notificacionProductoController.createNotificacion);
router.patch("/:id/estado", notificacionProductoController.updateNotificacionEstado);
router.delete("/:id", notificacionProductoController.deleteNotificacion);

module.exports = router;