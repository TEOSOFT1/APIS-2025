const db = require("../Config/db");
const Servicio = db.Servicio;
const TipoServicio = db.TipoServicio;
const CitaServicio = db.CitaServicio;
const AgendamientoCita = db.AgendamientoCita;

// Obtener todos los servicios
exports.getAllServicios = async (req, res) => {
  try {
    const servicios = await Servicio.findAll({
      include: [{ model: TipoServicio, attributes: ["Nombre"] }]
    });
    res.status(200).json({
      success: true,
      data: servicios
    });
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener los servicios", 
      error: error.message 
    });
  }
};

// Obtener un servicio por ID
exports.getServicioById = async (req, res) => {
  try {
    const { id } = req.params;
    const servicio = await Servicio.findByPk(id, {
      include: [{ model: TipoServicio, attributes: ["Nombre"] }]
    });

    if (!servicio) {
      return res.status(404).json({
        success: false,
        message: "Servicio no encontrado"
      });
    }

    res.status(200).json({
      success: true,
      data: servicio
    });
  } catch (error) {
    console.error("Error al obtener servicio:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener el servicio", 
      error: error.message 
    });
  }
};

// Obtener servicios por cita
exports.getServiciosByCita = async (req, res) => {
  try {
    const { citaId } = req.params;
    
    // Verificar que la cita existe
    const cita = await AgendamientoCita.findByPk(citaId);
    if (!cita) {
      return res.status(404).json({
        success: false,
        message: "Cita no encontrada"
      });
    }

    // Obtener los servicios asociados a la cita a través de la tabla de unión
    const serviciosIds = await CitaServicio.findAll({
      where: { IdCita: citaId },
      attributes: ['IdServicio']
    });

    if (serviciosIds.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No se encontraron servicios para esta cita"
      });
    }

    // Extraer los IDs de servicios
    const ids = serviciosIds.map(item => item.IdServicio);

    // Buscar los servicios por sus IDs
    const servicios = await Servicio.findAll({
      where: { IdServicio: ids },
      include: [{ model: TipoServicio, attributes: ["Nombre"] }]
    });

    res.status(200).json({
      success: true,
      data: servicios
    });
  } catch (error) {
    console.error("Error en getServiciosByCita:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener servicios por cita",
      error: error.message
    });
  }
};

// Crear un nuevo servicio
exports.createServicio = async (req, res) => {
  try {
    const { 
      IdTipoServicio, 
      Nombre, 
      Foto, 
      Descripcion, 
      Beneficios, 
      Que_incluye, 
      PrecioPequeño, 
      PrecioGrande, 
      Duracion, 
      Estado 
    } = req.body;

    if (!IdTipoServicio || !Nombre || !PrecioPequeño || !PrecioGrande || !Duracion) {
      return res.status(400).json({ 
        success: false,
        message: "Los campos IdTipoServicio, Nombre, PrecioPequeño, PrecioGrande y Duracion son obligatorios" 
      });
    }

    // Verificar que el tipo de servicio existe
    const tipoServicio = await TipoServicio.findByPk(IdTipoServicio);
    if (!tipoServicio) {
      return res.status(404).json({
        success: false,
        message: "Tipo de servicio no encontrado"
      });
    }

    const nuevoServicio = await Servicio.create({ 
      IdTipoServicio,
      Nombre, 
      Foto,
      Descripcion,
      Beneficios: Beneficios || '',
      Que_incluye: Que_incluye || '',
      PrecioPequeño,
      PrecioGrande,
      Duracion,
      Estado: Estado !== undefined ? Estado : true
    });
    
    res.status(201).json({ 
      success: true,
      message: "Servicio creado exitosamente", 
      data: nuevoServicio 
    });
  } catch (error) {
    console.error("Error al crear servicio:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al crear el servicio", 
      error: error.message 
    });
  }
};

// Actualizar un servicio
exports.updateServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      IdTipoServicio, 
      Nombre, 
      Foto, 
      Descripcion, 
      Beneficios, 
      Que_incluye, 
      PrecioPequeño, 
      PrecioGrande, 
      Duracion, 
      Estado 
    } = req.body;

    const servicio = await Servicio.findByPk(id);
    if (!servicio) {
      return res.status(404).json({
        success: false,
        message: "Servicio no encontrado"
      });
    }

    // Si se proporciona un nuevo tipo de servicio, verificar que existe
    if (IdTipoServicio) {
      const tipoServicio = await TipoServicio.findByPk(IdTipoServicio);
      if (!tipoServicio) {
        return res.status(404).json({
          success: false,
          message: "Tipo de servicio no encontrado"
        });
      }
    }

    await servicio.update({ 
      IdTipoServicio: IdTipoServicio || servicio.IdTipoServicio,
      Nombre: Nombre || servicio.Nombre, 
      Foto: Foto !== undefined ? Foto : servicio.Foto,
      Descripcion: Descripcion !== undefined ? Descripcion : servicio.Descripcion,
      Beneficios: Beneficios !== undefined ? Beneficios : servicio.Beneficios,
      Que_incluye: Que_incluye !== undefined ? Que_incluye : servicio.Que_incluye,
      PrecioPequeño: PrecioPequeño || servicio.PrecioPequeño,
      PrecioGrande: PrecioGrande || servicio.PrecioGrande,
      Duracion: Duracion || servicio.Duracion,
      Estado: Estado !== undefined ? Estado : servicio.Estado
    });
    
    res.status(200).json({ 
      success: true,
      message: "Servicio actualizado exitosamente", 
      data: servicio 
    });
  } catch (error) {
    console.error("Error al actualizar servicio:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al actualizar el servicio", 
      error: error.message 
    });
  }
};

// Eliminar un servicio
exports.deleteServicio = async (req, res) => {
  try {
    const { id } = req.params;

    const servicio = await Servicio.findByPk(id);
    if (!servicio) {
      return res.status(404).json({
        success: false,
        message: "Servicio no encontrado"
      });
    }

    // Verificar si el servicio está siendo utilizado en citas
    const citasConServicio = await CitaServicio.findOne({
      where: { IdServicio: id }
    });

    if (citasConServicio) {
      return res.status(400).json({
        success: false,
        message: "No se puede eliminar el servicio porque está siendo utilizado en citas"
      });
    }

    await servicio.destroy();
    res.status(200).json({
      success: true,
      message: "Servicio eliminado exitosamente"
    });
  } catch (error) {
    console.error("Error al eliminar servicio:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al eliminar el servicio", 
      error: error.message 
    });
  }
};