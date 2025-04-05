const express = require('express');
const router = express.Router();
const agendamientoCitaController = require('../Controllers/AgendamientoCitaController');

// Rutas para agendamiento de citas
router.get('/', agendamientoCitaController.getAllCitas);
router.get('/:id', agendamientoCitaController.getCitaById);
router.get('/cliente/:clienteId', agendamientoCitaController.getCitasByCliente);
router.get('/mascota/:mascotaId', agendamientoCitaController.getCitasByMascota);
router.get('/por-fecha/:fecha', agendamientoCitaController.getCitasByFecha); // Nueva ruta para búsqueda por fecha
router.post('/', agendamientoCitaController.createCita);
router.put('/:id', agendamientoCitaController.updateCita);
router.patch('/:id/estado', agendamientoCitaController.updateCitaStatus);
router.delete('/:id', agendamientoCitaController.deleteCita);

module.exports = router;