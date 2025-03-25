// NotificacionProductoController.js - Controlador corregido
const db = require("../Config/db");
const NotificacionProducto = db.NotificacionProducto;
const Producto = db.Producto;

// Obtener todas las notificaciones de productos
exports.getAllNotificaciones = async (req, res) => {
  try {
    const notificaciones = await NotificacionProducto.findAll({
      include: [{ model: Producto, attributes: ["IdProducto", "NombreProducto", "Stock"] }],
      order: [["FechaNotificacion", "DESC"]],
    });
    res.json(notificaciones);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo notificaciones", error: error.message });
  }
};

// Obtener una notificación por ID
exports.getNotificacionById = async (req, res) => {
  try {
    const { id } = req.params;
    const notificacion = await NotificacionProducto.findByPk(id, {
      include: [{ model: Producto, attributes: ["IdProducto", "NombreProducto", "Stock"] }],
    });

    if (!notificacion) {
      return res.status(404).json({ message: "Notificación no encontrada" });
    }

    res.json(notificacion);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo notificación", error: error.message });
  }
};

// Crear una nueva notificación de producto
exports.createNotificacion = async (req, res) => {
  try {
    const { IdProducto, FechaNotificacion, TipoNotificacion, Mensaje, Estado } = req.body;
    const nuevaNotificacion = await NotificacionProducto.create({
      IdProducto,
      FechaNotificacion,
      TipoNotificacion,
      Mensaje,
      Estado
    });
    res.status(201).json({ message: "Notificación creada exitosamente", notificacion: nuevaNotificacion });
  } catch (error) {
    res.status(500).json({ message: "Error creando notificación", error: error.message });
  }
};

// Actualizar una notificación
exports.updateNotificacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { FechaNotificacion, TipoNotificacion, Mensaje, Estado } = req.body;
    const notificacion = await NotificacionProducto.findByPk(id);
    
    if (!notificacion) {
      return res.status(404).json({ message: "Notificación no encontrada" });
    }

    await notificacion.update({ FechaNotificacion, TipoNotificacion, Mensaje, Estado });
    res.json({ message: "Notificación actualizada exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error actualizando notificación", error: error.message });
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
    res.json({ message: "Notificación eliminada exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error eliminando notificación", error: error.message });
  }
};
