const db = require("../Config/db");
const Proveedor = db.Proveedor;

exports.getAllProveedores = async (req, res) => {
  try {
    const proveedores = await Proveedor.findAll();
    res.status(200).json(proveedores);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los proveedores", error: error.message });
  }
};

exports.getProveedorById = async (req, res) => {
  try {
    const { id } = req.params;
    const proveedor = await Proveedor.findByPk(id);
    if (!proveedor) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }
    res.status(200).json(proveedor);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el proveedor", error: error.message });
  }
};

exports.createProveedor = async (req, res) => {
  try {
    const { Nombre, Direccion, Documento, Telefono, Correo, PersonaDeContacto, Estado } = req.body;
    if (!Nombre || !Direccion || !Documento || !Telefono || !Correo || !PersonaDeContacto) {
      return res.status(400).json({ message: "Todos los campos obligatorios deben estar presentes" });
    }
    
    const nuevoProveedor = await Proveedor.create({ Nombre, Direccion, Documento, Telefono, Correo, PersonaDeContacto, Estado });
    res.status(201).json({ message: "Proveedor creado exitosamente", data: nuevoProveedor });
  } catch (error) {
    console.error("Error al crear proveedor:", error);
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ message: "Error de validación", errors: error.errors.map(e => e.message) });
    }
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "El documento o correo ya están registrados" });
    }
    res.status(500).json({ message: "Error al crear el proveedor", error: error.message });
  }
};

exports.updateProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const { Nombre, Direccion, Documento, Telefono, Correo, PersonaDeContacto, Estado } = req.body;
    const proveedor = await Proveedor.findByPk(id);
    if (!proveedor) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }
    await proveedor.update({ Nombre, Direccion, Documento, Telefono, Correo, PersonaDeContacto, Estado });
    res.status(200).json({ message: "Proveedor actualizado exitosamente", data: proveedor });
  } catch (error) {
    console.error("Error al actualizar proveedor:", error);
    res.status(500).json({ message: "Error al actualizar el proveedor", error: error.message });
  }
};

exports.deleteProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const proveedor = await Proveedor.findByPk(id);
    if (!proveedor) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }
    await proveedor.destroy();
    res.status(200).json({ message: "Proveedor eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el proveedor", error: error.message });
  }
};