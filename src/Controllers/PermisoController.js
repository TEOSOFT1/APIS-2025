const db = require("../../src/Config/db");
const Permiso = db.Permiso;
const { Op } = db.Sequelize;

// Obtener todos los permisos
exports.getAllPermisos = async (req, res) => {
  try {
    const permisos = await Permiso.findAll();
    res.status(200).json(permisos);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener los permisos",
      error: error.message,
    });
  }
};

// Obtener un permiso por ID
exports.getPermisoById = async (req, res) => {
  try {
    const { id } = req.params;
    const permiso = await Permiso.findByPk(id);

    if (!permiso) {
      return res.status(404).json({
        message: "Permiso no encontrado",
      });
    }

    res.status(200).json(permiso);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener el permiso",
      error: error.message,
    });
  }
};

// Crear un nuevo permiso
exports.createPermiso = async (req, res) => {
  try {
    const { NombrePermiso, Descripcion } = req.body;

    // Validar campos obligatorios
    if (!NombrePermiso) {
      return res.status(400).json({
        message: "El nombre del permiso es obligatorio",
      });
    }

    // Verificar si ya existe un permiso con el mismo nombre
    const permisoExistente = await Permiso.findOne({
      where: { NombrePermiso },
    });

    if (permisoExistente) {
      return res.status(400).json({
        message: "Ya existe un permiso con el mismo nombre",
      });
    }

    // Crear el permiso
    const nuevoPermiso = await Permiso.create({
      NombrePermiso,
      Descripcion,
    });

    res.status(201).json({
      message: "Permiso creado exitosamente",
      data: nuevoPermiso,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al crear el permiso",
      error: error.message,
    });
  }
};

// Actualizar un permiso
exports.updatePermiso = async (req, res) => {
  try {
    const { id } = req.params;
    const { NombrePermiso, Descripcion } = req.body;

    const permiso = await Permiso.findByPk(id);

    if (!permiso) {
      return res.status(404).json({
        message: "Permiso no encontrado",
      });
    }

    // Verificar si el nuevo nombre ya existe en otro permiso
    if (NombrePermiso && NombrePermiso !== permiso.NombrePermiso) {
      const permisoExistente = await Permiso.findOne({
        where: {
          NombrePermiso,
          IdPermiso: { [Op.ne]: id },
        },
      });

      if (permisoExistente) {
        return res.status(400).json({
          message: "Ya existe otro permiso con el mismo nombre",
        });
      }
    }

    // Actualizar el permiso
    await permiso.update({
      NombrePermiso: NombrePermiso || permiso.NombrePermiso,
      Descripcion: Descripcion !== undefined ? Descripcion : permiso.Descripcion,
    });

    res.status(200).json({
      message: "Permiso actualizado exitosamente",
      data: permiso,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al actualizar el permiso",
      error: error.message,
    });
  }
};

// Eliminar un permiso
exports.deletePermiso = async (req, res) => {
  try {
    const { id } = req.params;
    const permiso = await Permiso.findByPk(id);

    if (!permiso) {
      return res.status(404).json({
        message: "Permiso no encontrado",
      });
    }

    // Verificar si el permiso está asociado a algún rol
    const rolPermisos = await db.RolPermiso.findAll({
      where: { IdPermiso: id },
    });

    if (rolPermisos.length > 0) {
      return res.status(400).json({
        message: "No se puede eliminar el permiso porque está asociado a uno o más roles",
      });
    }

    // Eliminar el permiso
    await permiso.destroy();

    res.status(200).json({
      message: "Permiso eliminado exitosamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al eliminar el permiso",
      error: error.message,
    });
  }
};