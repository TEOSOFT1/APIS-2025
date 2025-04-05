const db = require("../Config/db");
const NotificacionProducto = db.NotificacionProducto;
const Producto = db.Producto;

// Obtener todas las notificaciones
exports.getAllNotificaciones = async (req, res) => {
  try {
    const notificaciones = await NotificacionProducto.findAll({
      include: [{ model: Producto }],
    });
    res.status(200).json(notificaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las notificaciones", error: error.message });
  }
};

// Obtener una notificación por ID
exports.getNotificacionById = async (req, res) => {
  try {
    const { id } = req.params;
    const notificacion = await NotificacionProducto.findByPk(id, {
      include: [{ model: Producto }],
    });

    if (!notificacion) {
      return res.status(404).json({ message: "Notificación no encontrada" });
    }

    res.status(200).json(notificacion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener la notificación", error: error.message });
  }
};

// Obtener notificaciones por producto
exports.getNotificacionesByProducto = async (req, res) => {
  try {
    const { productoId } = req.params;
    
    // Verificar que el producto existe
    const productoExiste = await Producto.findByPk(productoId);
    if (!productoExiste) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    
    const notificaciones = await NotificacionProducto.findAll({
      where: { IdProducto: productoId },
      include: [{ model: Producto }],
    });

    res.status(200).json(notificaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las notificaciones del producto", error: error.message });
  }
};

// Obtener notificaciones por tipo
// Corrección en NotificacionProductoController.js
exports.getNotificacionesByTipo = async (req, res) => {
  try {
    const { tipo } = req.params;
    
    // Validar que el tipo sea válido
    if (!['Vencimiento', 'StockBajo'].includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: "Tipo de notificación inválido. Debe ser 'Vencimiento' o 'StockBajo'"
      });
    }

    const notificaciones = await NotificacionProducto.findAll({
      where: { TipoNotificacion: tipo },
      include: [{ model: Producto }]
    });

    if (notificaciones.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No se encontraron notificaciones de tipo ${tipo}`
      });
    }

    res.status(200).json({
      success: true,
      data: notificaciones
    });
  } catch (error) {
    console.error("Error en getNotificacionesByTipo:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener notificaciones por tipo",
      error: error.message
    });
  }
};

// Obtener notificaciones por estado
exports.getNotificacionesByEstado = async (req, res) => {
  try {
    const { estado } = req.params;
    
    // Validar que el estado sea válido
    if (!['Pendiente', 'Vista', 'Resuelta'].includes(estado)) {
      return res.status(400).json({ message: "El estado debe ser 'Pendiente', 'Vista' o 'Resuelta'" });
    }
    
    const notificaciones = await NotificacionProducto.findAll({
      where: { Estado: estado },
      include: [{ model: Producto }],
    });

    res.status(200).json(notificaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las notificaciones por estado", error: error.message });
  }
};

// Crear una nueva notificación
exports.createNotificacion = async (req, res) => {
  try {
    const { IdProducto, TipoNotificacion, Mensaje } = req.body;

    // Validar campos requeridos
    if (!IdProducto || !TipoNotificacion || !Mensaje) {
      return res.status(400).json({ message: "IdProducto, TipoNotificacion y Mensaje son obligatorios" });
    }

    // Validar que el tipo sea válido
    if (!['Vencimiento', 'StockBajo'].includes(TipoNotificacion)) {
      return res.status(400).json({ message: "El tipo debe ser 'Vencimiento' o 'StockBajo'" });
    }

    // Verificar que el producto existe
    const productoExiste = await Producto.findByPk(IdProducto);
    if (!productoExiste) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const nuevaNotificacion = await NotificacionProducto.create({
      IdProducto,
      TipoNotificacion,
      Mensaje,
      Estado: 'Pendiente',
    });

    const notificacionCreada = await NotificacionProducto.findByPk(nuevaNotificacion.IdNotificacion, {
      include: [{ model: Producto }],
    });

    res.status(201).json({ message: "Notificación creada exitosamente", data: notificacionCreada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear la notificación", error: error.message });
  }
};

// Actualizar el estado de una notificación
exports.updateNotificacionEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { Estado } = req.body;

    // Validar que el estado sea válido
    if (!['Pendiente', 'Vista', 'Resuelta'].includes(Estado)) {
      return res.status(400).json({ message: "El estado debe ser 'Pendiente', 'Vista' o 'Resuelta'" });
    }

    const notificacion = await NotificacionProducto.findByPk(id);

    if (!notificacion) {
      return res.status(404).json({ message: "Notificación no encontrada" });
    }

    await notificacion.update({ Estado });

    const notificacionActualizada = await NotificacionProducto.findByPk(id, {
      include: [{ model: Producto }],
    });

    res.status(200).json({ message: "Estado de notificación actualizado exitosamente", data: notificacionActualizada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el estado de la notificación", error: error.message });
  }
};

// Eliminar una notificación
exports.deleteNotificacion = async (req, res) => {
  try {
    const { id } = req.params;
    const notificacion = await NotificacionProducto.findByPk(id);

    if (!notificacion) {
      return res.status(404).json({ message: "Notificación no encontrada" });
    }

    await notificacion.destroy();
    res.status(200).json({ message: "Notificación eliminada exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar la notificación", error: error.message });
  }
};