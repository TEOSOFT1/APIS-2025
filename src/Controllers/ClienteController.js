const db = require("../Config/db");
const Cliente = db.Cliente;

// Obtener todos los clientes
exports.getAllClientes = async (req, res) => {
  try {
    const clientes = await Cliente.findAll();
    res.status(200).json(clientes);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo clientes", error: error.message });
  }
};

// Obtener un cliente por ID
exports.getClienteById = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    res.status(200).json(cliente);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo cliente", error: error.message });
  }
};

// Crear un nuevo cliente
exports.createCliente = async (req, res) => {
  try {
    const { Documento, Nombre, Apellido, Correo, Telefono, Direccion } = req.body;

    // Validar que los campos obligatorios estén presentes
    if (!Documento || !Nombre || !Apellido || !Correo || !Telefono || !Direccion) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Crear el nuevo cliente
    const nuevoCliente = await Cliente.create({ Documento, Nombre, Apellido, Correo, Telefono, Direccion });
    res.status(201).json({ message: "Cliente creado exitosamente", data: nuevoCliente });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "El documento o correo ya está registrado" });
    }
    res.status(500).json({ message: "Error creando cliente", error: error.message });
  }
};

// Actualizar un cliente existente
exports.updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { Documento, Nombre, Apellido, Correo, Telefono, Direccion, Estado } = req.body;

    // Validar que los campos obligatorios estén presentes
    if (!Documento || !Nombre || !Apellido || !Correo || !Telefono || !Direccion) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Buscar el cliente por ID
    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    // Actualizar el cliente
    await cliente.update({ Documento, Nombre, Apellido, Correo, Telefono, Direccion, Estado });
    res.status(200).json({ message: "Cliente actualizado exitosamente", data: cliente });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "El documento o correo ya está registrado" });
    }
    res.status(500).json({ message: "Error actualizando cliente", error: error.message });
  }
};

// Eliminar un cliente
exports.deleteCliente = async (req, res) => {
  try {
    const { id } = req.params;

    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    await cliente.destroy();
    res.status(200).json({ message: "Cliente eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error eliminando cliente", error: error.message });
  }
};