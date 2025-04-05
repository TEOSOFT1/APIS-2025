const express = require('express');
const router = express.Router();
const ventaController = require('../Controllers/VentaController');

// Rutas para ventas
router.get('/', ventaController.getAllVentas);
router.get('/por-fecha', ventaController.getVentasByFecha);
router.get('/cliente/:clienteId', ventaController.getVentasByCliente);
router.get('/usuario/:usuarioId', ventaController.getVentasByUsuario);
router.get('/:id', ventaController.getVentaById);
router.post('/', ventaController.createVenta);
router.post('/:id/devolver', ventaController.devolverVenta); // Asegúrate de que sea POST, no GET
router.patch('/:id/anular', ventaController.anularVenta);
router.patch('/:id/estado', ventaController.updateVentaEstado);
router.delete('/:id', ventaController.deleteVenta);

module.exports = router;