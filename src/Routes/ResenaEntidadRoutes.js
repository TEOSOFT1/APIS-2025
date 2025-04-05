const express = require('express');
const router = express.Router();
const resenaEntidadController = require('../Controllers/ResenaEntidadController');

// Rutas para entidades de reseñas
router.get('/', resenaEntidadController.getAllResenasEntidades);
router.get('/generales', resenaEntidadController.getResenasEntidadesGenerales); // Ruta para reseñas generales
router.get('/resena/:resenaId', resenaEntidadController.getResenaEntidadesByResena);
router.get('/producto/:productoId', resenaEntidadController.getResenaEntidadesByProducto);
router.get('/servicio/:servicioId', resenaEntidadController.getResenaEntidadesByServicio);
router.get('/promedio/producto/:productoId', resenaEntidadController.getPromedioCalificacionProducto);
router.get('/promedio/servicio/:servicioId', resenaEntidadController.getPromedioCalificacionServicio);
router.get('/promedio/general', resenaEntidadController.getPromedioCalificacionGeneral);
router.get('/:id', resenaEntidadController.getResenaEntidadById);
router.post('/', resenaEntidadController.createResenaEntidad);
router.put('/:id', resenaEntidadController.updateResenaEntidad);
router.delete('/:id', resenaEntidadController.deleteResenaEntidad);

module.exports = router;