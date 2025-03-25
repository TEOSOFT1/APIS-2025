const db = require("../Config/db");
const Rol = db.Rol;
const Permiso = db.Permiso;
const RolPermiso = db.RolPermiso;

// Obtener todos los roles
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Rol.findAll();
    res.status(200).json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los roles", error: error.message });
  }
};

// Obtener un rol por ID
exports.getRolById = async (req, res) => {
  try {
    const { id } = req.params;
    const rol = await Rol.findByPk(id, {
      include: [{ model: Permiso, through: { attributes: [] } }], // Incluir permisos asociados
    });

    if (!rol) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }

    res.status(200).json(rol);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el rol", error: error.message });
  }
};

// Crear un nuevo rol y asociar permisos
exports.createRol = async (req, res) => {
  try {
    const { NombreRol, permisos } = req.body;

    if (!NombreRol) {
      return res.status(400).json({ message: "El nombre del rol es obligatorio" });
    }

    // Crear el rol
    const nuevoRol = await Rol.create({ NombreRol });

    // Validar que los permisos existen
    if (permisos && permisos.length > 0) {
      // Verificar que los permisos existen en la tabla Permiso
      const permisosExistentes = await Permiso.findAll({
        where: { IdPermiso: permisos },
      });

      // Si no se encuentran permisos, lanzar error
      if (permisosExistentes.length !== permisos.length) {
        return res.status(400).json({ message: "Algunos permisos no existen" });
      }

      // Crear las asociaciones en la tabla Rol_Permiso
      const rolPermisos = permisosExistentes.map((permiso) => ({
        IdRol: nuevoRol.IdRol, // El ID del rol recién creado
        IdPermiso: permiso.IdPermiso, // El ID del permiso que viene en el array
      }));

      // Crear las relaciones en la tabla Rol_Permiso
      await RolPermiso.bulkCreate(rolPermisos);
    }

    res.status(201).json({ message: "Rol creado exitosamente", data: nuevoRol });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el rol", error: error.message });
  }
};

// Actualizar un rol
exports.updateRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { NombreRol, permisos } = req.body;

    const rol = await Rol.findByPk(id);

    if (!rol) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }

    // Actualizar el nombre del rol
    await rol.update({ NombreRol });

    // Si se proporcionan permisos, actualizar las asociaciones
    if (permisos && permisos.length > 0) {
      // Verificar que los permisos existen en la tabla Permiso
      const permisosExistentes = await Permiso.findAll({
        where: { IdPermiso: permisos },
      });

      // Si no se encuentran permisos, lanzar error
      if (permisosExistentes.length !== permisos.length) {
        return res.status(400).json({ message: "Algunos permisos no existen" });
      }

      // Eliminar las asociaciones existentes
      await RolPermiso.destroy({ where: { IdRol: rol.IdRol } });

      // Crear las nuevas asociaciones en la tabla Rol_Permiso
      const rolPermisos = permisosExistentes.map((permiso) => ({
        IdRol: rol.IdRol,
        IdPermiso: permiso.IdPermiso,
      }));

      await RolPermiso.bulkCreate(rolPermisos);
    }

    res.status(200).json({ message: "Rol actualizado exitosamente", data: rol });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el rol", error: error.message });
  }
};

// Eliminar un rol
exports.deleteRol = async (req, res) => {
  try {
    const { id } = req.params;

    const rol = await Rol.findByPk(id);

    if (!rol) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }

    // Eliminar el rol (las asociaciones en Rol_Permiso se eliminarán en cascada)
    await rol.destroy();
    res.status(200).json({ message: "Rol eliminado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar el rol", error: error.message });
  }
};