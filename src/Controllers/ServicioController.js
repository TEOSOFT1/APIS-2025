const db = require("../Config/db");
const Servicio = db.Servicio;

// Obtener todos los servicios
exports.getAllServicios = async (req, res) => {
  try {
    const servicios = await Servicio.findAll();
    res.status(200).json(servicios);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los servicios", error: error.message });
  }
};

// Obtener un servicio por ID
exports.getServicioById = async (req, res) => {
  try {
    const { id } = req.params;
    const servicio = await Servicio.findByPk(id);
    if (!servicio) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }
    res.status(200).json(servicio);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el servicio", error: error.message });
  }
};

// Crear un nuevo servicio
exports.createServicio = async (req, res) => {
  try {
    const { IdTipoServicio, Nombre, Descripcion = "Sin descripción", PrecioPequeño, PrecioGrande, Duracion, Estado = true, Foto } = req.body;

    if (!IdTipoServicio || !Nombre || !PrecioPequeño || !PrecioGrande || !Duracion) {
      return res.status(400).json({ message: "IdTipoServicio, Nombre, PrecioPequeño, PrecioGrande y Duracion son obligatorios" });
    }

    const nuevoServicio = await Servicio.create({ IdTipoServicio, Nombre, Descripcion, PrecioPequeño, PrecioGrande, Duracion, Estado, Foto });

    res.status(201).json({ message: "Servicio creado exitosamente", data: nuevoServicio });
  } catch (error) {
    console.error("Error al crear servicio:", error);
    res.status(500).json({ message: "Error al crear el servicio", error: error.message });
  }
};

// Actualizar un servicio existente
exports.updateServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { IdTipoServicio, Nombre, Descripcion, PrecioPequeño, PrecioGrande, Duracion, Estado, Foto } = req.body;

    const servicio = await Servicio.findByPk(id);
    if (!servicio) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    await servicio.update({ IdTipoServicio, Nombre, Descripcion, PrecioPequeño, PrecioGrande, Duracion, Estado, Foto });

    res.status(200).json({ message: "Servicio actualizado exitosamente", data: servicio });
  } catch (error) {
    console.error("Error al actualizar servicio:", error);
    res.status(500).json({ message: "Error al actualizar el servicio", error: error.message });
  }
};

// Eliminar un servicio
exports.deleteServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const servicio = await Servicio.findByPk(id);
    if (!servicio) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    await servicio.destroy();
    res.status(200).json({ message: "Servicio eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el servicio", error: error.message });
  }
};
