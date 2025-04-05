// src/Routes/ClienteRoutes.js
const express = require("express");
const router = express.Router();
const clienteController = require("../Controllers/ClienteController");
const { checkRole } = require("../Middlewares/AuthMiddleware");

// ===== RUTAS PROTEGIDAS (requieren autenticación) =====
// Ya no necesitas verifyToken aquí porque se aplica en App.js

// Rutas de perfil de cliente
router.get("/perfil", clienteController.getClienteProfile);
router.put("/perfil", clienteController.updateClienteProfile);
router.put("/cambiar-contrasena", clienteController.changeClientePassword);

// ===== RUTAS ADMINISTRATIVAS (requieren rol de administrador o vendedor) =====

// Rutas para gestión de clientes
router.get("/", checkRole(['Administrador', 'Vendedor']), clienteController.getAllClientes);
router.get("/search", checkRole(['Administrador', 'Vendedor']), clienteController.searchClientes);
router.get("/:id", checkRole(['Administrador', 'Vendedor']), clienteController.getClienteById);
router.post("/", checkRole(['Administrador', 'Vendedor']), clienteController.createClienteFisico); // Ruta directa
router.post("/fisico", checkRole(['Administrador', 'Vendedor']), clienteController.createClienteFisico);
router.post("/virtual", checkRole(['Administrador', 'Vendedor']), clienteController.createClienteVirtual);
router.put("/:id", checkRole(['Administrador', 'Vendedor']), clienteController.updateCliente);
router.put("/fisico/:id", checkRole(['Administrador', 'Vendedor']), clienteController.updateClienteFisico);
router.delete("/:id", checkRole(['Administrador', 'Vendedor']), clienteController.deleteCliente);
router.delete("/fisico/:id", checkRole(['Administrador', 'Vendedor']), clienteController.deleteClienteFisico);

module.exports = router;