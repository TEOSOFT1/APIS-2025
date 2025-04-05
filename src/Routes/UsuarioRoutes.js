// src/Routes/UsuarioRoutes.js
const express = require("express");
const router = express.Router();
const usuarioController = require("../Controllers/UsuarioController");
const { verifyToken, checkRole } = require("../Middlewares/AuthMiddleware");

// Rutas de perfil (para cualquier usuario autenticado)
router.get("/perfil", usuarioController.getProfile);
router.put("/cambiar-contrasena", usuarioController.changePassword);

// Rutas de gestión de usuarios (solo para administradores)
router.get("/", checkRole(['Administrador']), usuarioController.getAllUsuarios);
router.get("/:id", checkRole(['Administrador']), usuarioController.getUsuarioById);
router.post("/", checkRole(['Administrador']), usuarioController.createUsuario);
router.put("/:id", checkRole(['Administrador']), usuarioController.updateUsuario);
router.delete("/:id", checkRole(['Administrador']), usuarioController.deleteUsuario);

module.exports = router;