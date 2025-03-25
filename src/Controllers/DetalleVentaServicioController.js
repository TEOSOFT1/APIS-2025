const db = require("../Config/db");
const DetalleVentaServicio = db.DetalleVentaServicio;
const Venta = db.Venta;
const Servicio = db.Servicio;
const Mascota = db.Mascota;

// ✅ Obtener todos los detalles de venta de servicios
exports.getAllDetallesVentaServicio = async (req, res) => {
  try {
    const detalles = await DetalleVentaServicio.findAll({
      include: [
        { model: Servicio, as: "Servicio", attributes: ["Nombre", "Descripcion", "PrecioPequeño", "PrecioGrande"] },
        { model: Mascota, as: "Mascota", attributes: ["Nombre", "Raza", "Tamaño"] }
      ],
    });

    res.json(detalles);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo detalles de venta de servicios", error: error.message });
  }
};

// ✅ Obtener detalles de venta de servicios por ID de Venta
exports.getDetallesVentaServicioByVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const detalles = await DetalleVentaServicio.findAll({
      where: { IdVenta: id },
      include: [
        { model: Servicio, as: "Servicio", attributes: ["Nombre", "Descripcion", "PrecioPequeño", "PrecioGrande"] },
        { model: Mascota, as: "Mascota", attributes: ["Nombre", "Raza", "Tamaño"] }
      ],
    });

    if (detalles.length === 0) {
      return res.status(404).json({ message: "No hay detalles para esta venta" });
    }

    res.json(detalles);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo detalles de la venta", error: error.message });
  }
};

// ✅ Obtener un solo detalle de venta de servicio por ID
exports.getDetalleVentaServicioById = async (req, res) => {
  try {
    const { id } = req.params;
    const detalle = await DetalleVentaServicio.findByPk(id, {
      include: [
        { model: Servicio, as: "Servicio", attributes: ["Nombre", "Descripcion", "PrecioPequeño", "PrecioGrande"] },
        { model: Mascota, as: "Mascota", attributes: ["Nombre", "Raza", "Tamaño"] }
      ],
    });

    if (!detalle) {
      return res.status(404).json({ message: "Detalle de venta de servicio no encontrado" });
    }

    res.json(detalle);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo el detalle de venta de servicio", error: error.message });
  }
};

// ✅ Agregar un servicio a una venta 
exports.addServicioToVenta = async (req, res) => {
  try {
    const { IdVenta, IdServicio, IdMascota, Cantidad, PrecioUnitario } = req.body;

    if (!IdVenta || !IdServicio || !IdMascota || !Cantidad || !PrecioUnitario) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    const Subtotal = Cantidad * PrecioUnitario;

    const nuevoDetalle = await DetalleVentaServicio.create({
      IdVenta,
      IdServicio,
      IdMascota,
      Cantidad,
      PrecioUnitario,
      Subtotal
    });

    res.status(201).json({ message: "Servicio agregado a la venta exitosamente", detalle: nuevoDetalle });
  } catch (error) {
    res.status(500).json({ message: "Error agregando servicio a la venta", error: error.message });
  }
};

// ✅ Actualizar un detalle de venta de servicio
exports.updateDetalleVentaServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { Cantidad, PrecioUnitario } = req.body;

    const detalle = await DetalleVentaServicio.findByPk(id);
    if (!detalle) {
      return res.status(404).json({ message: "Detalle de venta de servicio no encontrado" });
    }

    const Subtotal = Cantidad * PrecioUnitario;

    await detalle.update({ Cantidad, PrecioUnitario, Subtotal });

    res.json({ message: "Detalle de venta de servicio actualizado exitosamente", detalle });
  } catch (error) {
    res.status(500).json({ message: "Error actualizando el detalle de venta de servicio", error: error.message });
  }
};

// ✅ Eliminar un servicio de una venta
exports.removeServicioFromVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const detalle = await DetalleVentaServicio.findByPk(id);

    if (!detalle) {
      return res.status(404).json({ message: "Detalle de venta de servicio no encontrado" });
    }

    await detalle.destroy();
    res.json({ message: "Servicio eliminado de la venta exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error eliminando servicio de la venta", error: error.message });
  }
};
