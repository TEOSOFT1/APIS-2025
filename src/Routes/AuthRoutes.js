// src/Routes/AuthRoutes.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../Controllers/UsuarioController');
const clienteController = require('../Controllers/ClienteController');

// Rutas de autenticación para usuarios (empleados)
router.post('/usuarios/login', usuarioController.login);
router.post('/usuarios/recover-password', usuarioController.recoverPassword);
// Eliminamos la ruta forgotPassword ya que la función no está definida

// Rutas de autenticación para clientes
router.post('/clientes/login', clienteController.loginCliente);
router.post('/clientes/registro', clienteController.registrarCliente);
router.post('/clientes/recuperar-contrasena', clienteController.recoverPassword);

module.exports = router;