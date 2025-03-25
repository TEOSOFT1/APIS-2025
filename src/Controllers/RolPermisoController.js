const db = require("../Config/db");
const RolPermiso = db.RolPermiso;

// Obtener todas las asociaciones rol-permiso
exports.getAllRolPermisos = async (req, res) => {
  try {
    const rolPermisos = await RolPermiso.findAll();
    res.status(200).json(rolPermisos);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo rol-permisos", error: error.message });
  }
};

// Obtener una asociación rol-permiso por ID
exports.getRolPermisoById = async (req, res) => {
  try {
    const { id } = req.params;
    const rolPermiso = await RolPermiso.findByPk(id);
    if (!rolPermiso) {
      return res.status(404).json({ message: "Rol-Permiso no encontrado" });
    }
    res.status(200).json(rolPermiso);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo rol-permiso", error: error.message });
  }
};

// Crear una nueva asociación rol-permiso
exports.createRolPermiso = async (req, res) => {
  try {
    const { IdRol, IdPermiso } = req.body;

    // Validar que los campos obligatorios estén presentes
    if (!IdRol || !IdPermiso) {
      return res.status(400).json({ message: "IdRol e IdPermiso son obligatorios" });
    }

    // Verificar si ya existe una combinación de IdRol e IdPermiso
    const existeRolPermiso = await RolPermiso.findOne({
      where: { IdRol, IdPermiso },
    });

    if (existeRolPermiso) {
      return res.status(400).json({ message: "La combinación de Rol y Permiso ya existe" });
    }

    // Crear la nueva asociación rol-permiso
    const nuevoRolPermiso = await RolPermiso.create({ IdRol, IdPermiso });
    res.status(201).json({ message: "Rol-Permiso creado exitosamente", data: nuevoRolPermiso });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "La combinación de Rol y Permiso ya existe" });
    }
    res.status(500).json({ message: "Error creando rol-permiso", error: error.message });
  }
};

// Actualizar una asociación rol-permiso
exports.updateRolPermiso = async (req, res) => {
  try {
    const { id } = req.params;
    const { IdRol, IdPermiso } = req.body;

    // Validar que los campos obligatorios estén presentes
    if (!IdRol || !IdPermiso) {
      return res.status(400).json({ message: "IdRol e IdPermiso son obligatorios" });
    }

    // Verificar si ya existe una combinación de IdRol e IdPermiso
    const existeRolPermiso = await RolPermiso.findOne({
      where: { IdRol, IdPermiso },
    });

    if (existeRolPermiso && existeRolPermiso.IdRolPermiso !== parseInt(id)) {
      return res.status(400).json({ message: "La combinación de Rol y Permiso ya existe" });
    }

    // Actualizar la asociación rol-permiso
    const rolPermiso = await RolPermiso.findByPk(id);
    if (!rolPermiso) {
      return res.status(404).json({ message: "Rol-Permiso no encontrado" });
    }

    await rolPermiso.update({ IdRol, IdPermiso });
    res.status(200).json({ message: "Rol-Permiso actualizado exitosamente", data: rolPermiso });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "La combinación de Rol y Permiso ya existe" });
    }
    res.status(500).json({ message: "Error actualizando rol-permiso", error: error.message });
  }
};

// Eliminar una asociación rol-permiso
exports.deleteRolPermiso = async (req, res) => {
  try {
    const { id } = req.params;

    const rolPermiso = await RolPermiso.findByPk(id);
    if (!rolPermiso) {
      return res.status(404).json({ message: "Rol-Permiso no encontrado" });
    }

    await rolPermiso.destroy();
    res.status(200).json({ message: "Rol-Permiso eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error eliminando rol-permiso", error: error.message });
  }
};