const express = require('express');
const router = express.Router();
const compraController = require('../Controllers/CompraController');

// Rutas para compras
router.get('/', compraController.getAllCompras);
router.get('/por-fecha', compraController.getComprasByFecha); // Ruta específica para búsqueda por fecha
router.get('/proveedor/:proveedorId', compraController.getComprasByProveedor);
router.get('/:id', compraController.getCompraById);
router.post('/', compraController.createCompra);
router.patch('/:id/estado', compraController.updateCompraEstado);
router.delete('/:id', compraController.deleteCompra);

module.exports = router;
