const express = require("express");
const router = express.Router();
const usuarioController = require("../Controllers/UsuarioController");
const { verifyToken, checkRole } = require("../Middlewares/AuthMiddleware");

// Rutas públicas
router.post("/login", usuarioController.login);
router.post("/recover-password", usuarioController.recoverPassword);
router.post("/forgot-password", usuarioController.forgotPassword);

// Rutas protegidas
router.get("/", verifyToken, checkRole([1]), usuarioController.getAllUsuarios);
router.get("/profile", verifyToken, usuarioController.getProfile);
router.get("/search", verifyToken, usuarioController.searchUsuarios);
router.get("/:id", verifyToken, usuarioController.getUsuarioById);
router.post("/", verifyToken, checkRole([1]), usuarioController.createUsuario);
router.put("/:id", verifyToken, checkRole([1]), usuarioController.updateUsuario);
router.patch("/:id/status", verifyToken, checkRole([1]), usuarioController.toggleUsuarioStatus);
router.patch("/:id/password", verifyToken, usuarioController.changePassword);
router.delete("/:id", verifyToken, checkRole([1]), usuarioController.deleteUsuario);
router.post("/logout", verifyToken, usuarioController.logout);

module.exports = router;