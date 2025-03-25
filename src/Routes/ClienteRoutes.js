const express = require("express");
const router = express.Router();
const clienteController = require("../Controllers/ClienteController");

// Rutas para clientes
router.get("/", clienteController.getAllClientes); // Obtener todos los clientes
router.get("/:id", clienteController.getClienteById); // Obtener un cliente por ID
router.post("/", clienteController.createCliente); // Crear un nuevo cliente
router.put("/:id", clienteController.updateCliente); // Actualizar un cliente existente
router.delete("/:id", clienteController.deleteCliente); // Eliminar un cliente

module.exports = router;