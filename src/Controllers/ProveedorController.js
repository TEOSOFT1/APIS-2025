const db = require("../Config/db");
const Proveedor = db.Proveedor;
const { Op } = db.Sequelize;

// Obtener todos los proveedores
exports.getAllProveedores = async (req, res) => {
  try {
    const proveedores = await Proveedor.findAll();
    res.status(200).json(proveedores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los proveedores", error: error.message });
  }
};

// Obtener un proveedor por ID
exports.getProveedorById = async (req, res) => {
  try {
    const { id } = req.params;
    const proveedor = await Proveedor.findByPk(id);

    if (!proveedor) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }

    res.status(200).json(proveedor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el proveedor", error: error.message });
  }
};

// Buscar proveedores por nombre, documento o correo
// Corrección en ProveedorController.js
exports.searchProveedores = async (req, res) => {
  try {
    const { q } = req.query;
    
    // Verifica si q existe y no está vacío
    if (!q || q.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: "Se requiere un término de búsqueda" 
      });
    }

    const proveedores = await Proveedor.findAll({
      where: {
        [Op.or]: [
          { Nombre: { [Op.like]: `%${q}%` } },
          { PersonaDeContacto: { [Op.like]: `%${q}%` } },
          { Documento: { [Op.like]: `%${q}%` } }
        ]
      }
    });

    res.status(200).json({ 
      success: true, 
      data: proveedores 
    });
  } catch (error) {
    console.error("Error en searchProveedores:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error al buscar proveedores", 
      error: error.message 
    });
  }
};

// Crear un nuevo proveedor
exports.createProveedor = async (req, res) => {
  try {
    const { Nombre, Direccion, Documento, Telefono, Correo, PersonaDeContacto, Estado } = req.body;

    // Validar campos requeridos
    if (!Nombre || !Direccion || !Documento || !Telefono || !Correo || !PersonaDeContacto) {
      return res.status(400).json({ message: "Nombre, Direccion, Documento, Telefono, Correo y PersonaDeContacto son obligatorios" });
    }

    // Verificar si ya existe un proveedor con el mismo documento o correo
    const proveedorExistente = await Proveedor.findOne({
      where: {
        [Op.or]: [
          { Documento },
          { Correo },
        ],
      },
    });

    if (proveedorExistente) {
      return res.status(400).json({ message: "Ya existe un proveedor con el mismo documento o correo" });
    }

    const nuevoProveedor = await Proveedor.create({
      Nombre,
      Direccion,
      Documento,
      Telefono,
      Correo,
      PersonaDeContacto,
      Estado: Estado !== undefined ? Estado : true,
    });

    res.status(201).json({ message: "Proveedor creado exitosamente", data: nuevoProveedor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el proveedor", error: error.message });
  }
};

// Actualizar un proveedor
exports.updateProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const { Nombre, Direccion, Documento, Telefono, Correo, PersonaDeContacto, Estado } = req.body;

    const proveedor = await Proveedor.findByPk(id);

    if (!proveedor) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }

    // Verificar si ya existe otro proveedor con el mismo documento o correo
    if (Documento || Correo) {
      const proveedorExistente = await Proveedor.findOne({
        where: {
          [Op.and]: [
            { IdProveedor: { [Op.ne]: id } },
            {
              [Op.or]: [
                Documento ? { Documento } : null,
                Correo ? { Correo } : null,
              ].filter(Boolean),
            },
          ],
        },
      });

      if (proveedorExistente) {
        return res.status(400).json({ message: "Ya existe otro proveedor con el mismo documento o correo" });
      }
    }

    await proveedor.update({
      Nombre: Nombre || proveedor.Nombre,
      Direccion: Direccion || proveedor.Direccion,
      Documento: Documento || proveedor.Documento,
      Telefono: Telefono || proveedor.Telefono,
      Correo: Correo || proveedor.Correo,
      PersonaDeContacto: PersonaDeContacto || proveedor.PersonaDeContacto,
      Estado: Estado !== undefined ? Estado : proveedor.Estado,
    });

    res.status(200).json({ message: "Proveedor actualizado exitosamente", data: proveedor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el proveedor", error: error.message });
  }
};

// Cambiar el estado de un proveedor
exports.toggleProveedorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const proveedor = await Proveedor.findByPk(id);

    if (!proveedor) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }

    await proveedor.update({
      Estado: !proveedor.Estado,
    });

    res.status(200).json({ message: "Estado del proveedor actualizado exitosamente", data: proveedor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el estado del proveedor", error: error.message });
  }
};

// Eliminar un proveedor
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
    console.error(error);
    res.status(500).json({ message: "Error al eliminar el proveedor", error: error.message });
  }
};