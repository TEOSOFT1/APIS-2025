const db = require("../Config/db");
const TipoServicio = db.TipoServicio;

// Obtener todos los tipos de servicio
exports.getAllTiposServicio = async (req, res) => {
  try {
    const tiposServicio = await TipoServicio.findAll();
    res.status(200).json(tiposServicio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los tipos de servicio", error: error.message });
  }
};


// Obtener un tipo de servicio por ID
exports.getTipoServicioById = async (req, res) => {
  try {
    const { id } = req.params;
    const tipoServicio = await TipoServicio.findByPk(id);

    if (!tipoServicio) {
      return res.status(404).json({ message: "Tipo de servicio no encontrado" });
    }

    res.status(200).json(tipoServicio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el tipo de servicio", error: error.message });
  }
};

// Crear un nuevo tipo de servicio
exports.createTipoServicio = async (req, res) => {
  try {
    const { Nombre } = req.body;

    if (!Nombre) {
      return res.status(400).json({ message: "El nombre del tipo de servicio es obligatorio" });
    }

    const nuevoTipoServicio = await TipoServicio.create({ Nombre });
    res.status(201).json({ message: "Tipo de servicio creado exitosamente", data: nuevoTipoServicio });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el tipo de servicio", error: error.message });
  }
};

// Actualizar un tipo de servicio
exports.updateTipoServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { Nombre } = req.body;

    const tipoServicio = await TipoServicio.findByPk(id);

    if (!tipoServicio) {
      return res.status(404).json({ message: "Tipo de servicio no encontrado" });
    }

    await tipoServicio.update({ Nombre });
    res.status(200).json({ message: "Tipo de servicio actualizado exitosamente", data: tipoServicio });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el tipo de servicio", error: error.message });
  }
};

// Eliminar un tipo de servicio
exports.deleteTipoServicio = async (req, res) => {
  try {
    const { id } = req.params;

    const tipoServicio = await TipoServicio.findByPk(id);

    if (!tipoServicio) {
      return res.status(404).json({ message: "Tipo de servicio no encontrado" });
    }

    await tipoServicio.destroy();
    res.status(200).json({ message: "Tipo de servicio eliminado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar el tipo de servicio", error: error.message });
  }
};