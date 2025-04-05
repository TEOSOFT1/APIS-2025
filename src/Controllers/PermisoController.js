const db = require("../Config/db");
const Permiso = db.Permiso;

// Obtener todos los permisos
exports.getAllPermisos = async (req, res) => {
  try {
    const permisos = await Permiso.findAll();
    res.status(200).json(permisos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los permisos", error: error.message });
  }
};

// Obtener un permiso por ID
exports.getPermisoById = async (req, res) => {
  try {
    const { id } = req.params;
    const permiso = await Permiso.findByPk(id);

    if (!permiso) {
      return res.status(404).json({ message: "Permiso no encontrado" });
    }

    res.status(200).json(permiso);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el permiso", error: error.message });
  }
};

// Crear un nuevo permiso
exports.createPermiso = async (req, res) => {
  try {
    const { NombrePermiso, Descripcion } = req.body;

    if (!NombrePermiso) {
      return res.status(400).json({ message: "El nombre del permiso es obligatorio" });
    }

    const nuevoPermiso = await Permiso.create({ NombrePermiso, Descripcion });
    res.status(201).json({ message: "Permiso creado exitosamente", data: nuevoPermiso });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el permiso", error: error.message });
  }
};

// Actualizar un permiso
exports.updatePermiso = async (req, res) => {
  try {
    const { id } = req.params;
    const { NombrePermiso, Descripcion, Estado } = req.body;

    const permiso = await Permiso.findByPk(id);

    if (!permiso) {
      return res.status(404).json({ message: "Permiso no encontrado" });
    }

    await permiso.update({
      NombrePermiso: NombrePermiso || permiso.NombrePermiso,
      Descripcion: Descripcion !== undefined ? Descripcion : permiso.Descripcion,
      Estado: Estado !== undefined ? Estado : permiso.Estado,
    });

    res.status(200).json({ message: "Permiso actualizado exitosamente", data: permiso });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el permiso", error: error.message });
  }
};

// Eliminar un permiso
exports.deletePermiso = async (req, res) => {
  try {
    const { id } = req.params;

    const permiso = await Permiso.findByPk(id);

    if (!permiso) {
      return res.status(404).json({ message: "Permiso no encontrado" });
    }

    await permiso.destroy();
    res.status(200).json({ message: "Permiso eliminado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar el permiso", error: error.message });
  }
};