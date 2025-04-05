const express = require('express');
const router = express.Router();
const servicioController = require('../Controllers/ServicioController');

// Rutas para servicios
router.get('/', servicioController.getAllServicios);
router.get('/:id', servicioController.getServicioById);
router.get('/cita/:citaId', servicioController.getServiciosByCita); // Ruta para servicios por cita
router.post('/', servicioController.createServicio);
router.put('/:id', servicioController.updateServicio);
router.delete('/:id', servicioController.deleteServicio);

module.exports = router;