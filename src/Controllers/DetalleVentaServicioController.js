const db = require("../Config/db");
const DetalleVentaServicio = db.DetalleVentaServicio;
const Venta = db.Venta;
const Servicio = db.Servicio;
const Mascota = db.Mascota;

// Obtener todos los detalles de venta de servicios
exports.getAllDetallesVentaServicio = async (req, res) => {
  try {
    const detallesVentaServicio = await DetalleVentaServicio.findAll({
      include: [
        { model: Venta },
        { model: Servicio, as: "Servicio" },
        { model: Mascota },
      ],
    });
    res.status(200).json(detallesVentaServicio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los detalles de venta de servicios", error: error.message });
  }
};

// Obtener un detalle de venta de servicio por ID
exports.getDetalleVentaServicioById = async (req, res) => {
  try {
    const { id } = req.params;
    const detalleVentaServicio = await DetalleVentaServicio.findByPk(id, {
      include: [
        { model: Venta },
        { model: Servicio, as: "Servicio" },
        { model: Mascota },
      ],
    });

    if (!detalleVentaServicio) {
      return res.status(404).json({ message: "Detalle de venta de servicio no encontrado" });
    }

    res.status(200).json(detalleVentaServicio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el detalle de venta de servicio", error: error.message });
  }
};

// Obtener detalles de venta de servicios por venta
exports.getDetallesByVenta = async (req, res) => {
  try {
    const { ventaId } = req.params;
    
    // Verificar que la venta existe
    const ventaExiste = await Venta.findByPk(ventaId);
    if (!ventaExiste) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }
    
    const detallesVentaServicio = await DetalleVentaServicio.findAll({
      where: { IdVenta: ventaId },
      include: [
        { model: Servicio, as: "Servicio" },
        { model: Mascota },
      ],
    });

    res.status(200).json(detallesVentaServicio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los detalles de venta de servicios de la venta", error: error.message });
  }
};

// Obtener detalles de venta de servicios por servicio
exports.getDetallesByServicio = async (req, res) => {
  try {
    const { servicioId } = req.params;
    
    // Verificar que el servicio existe
    const servicioExiste = await Servicio.findByPk(servicioId);
    if (!servicioExiste) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }
    
    const detallesVentaServicio = await DetalleVentaServicio.findAll({
      where: { IdServicio: servicioId },
      include: [
        { model: Venta },
        { model: Mascota },
      ],
    });

    res.status(200).json(detallesVentaServicio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los detalles de venta del servicio", error: error.message });
  }
};

// Obtener detalles de venta de servicios por mascota
exports.getDetallesByMascota = async (req, res) => {
  try {
    const { mascotaId } = req.params;
    
    // Verificar que la mascota existe
    const mascotaExiste = await Mascota.findByPk(mascotaId);
    if (!mascotaExiste) {
      return res.status(404).json({ message: "Mascota no encontrada" });
    }
    
    const detallesVentaServicio = await DetalleVentaServicio.findAll({
      where: { IdMascota: mascotaId },
      include: [
        { model: Venta },
        { model: Servicio, as: "Servicio" },
      ],
    });

    res.status(200).json(detallesVentaServicio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los detalles de venta de servicios de la mascota", error: error.message });
  }
};

// Crear un nuevo detalle de venta de servicio
exports.createDetalleVentaServicio = async (req, res) => {
  try {
    const { IdVenta, IdServicio, IdMascota, Cantidad, PrecioUnitario } = req.body;

    // Validar campos requeridos
    if (!IdVenta || !IdServicio || !IdMascota || !Cantidad || !PrecioUnitario) {
      return res.status(400).json({ message: "IdVenta, IdServicio, IdMascota, Cantidad y PrecioUnitario son obligatorios" });
    }

    // Verificar que la venta existe
    const venta = await Venta.findByPk(IdVenta);
    if (!venta) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }

    // Verificar que el servicio existe
    const servicio = await Servicio.findByPk(IdServicio);
    if (!servicio) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    // Verificar que la mascota existe
    const mascota = await Mascota.findByPk(IdMascota);
    if (!mascota) {
      return res.status(404).json({ message: "Mascota no encontrada" });
    }

    // Validar que la cantidad sea positiva
    if (Cantidad <= 0) {
      return res.status(400).json({ message: "La cantidad debe ser mayor que 0" });
    }

    // Validar que el precio unitario sea positivo
    if (PrecioUnitario < 0) {
      return res.status(400).json({ message: "El precio unitario no puede ser negativo" });
    }

    // Calcular subtotal
    const subtotal = Cantidad * PrecioUnitario;

    const nuevoDetalleVentaServicio = await DetalleVentaServicio.create({
      IdVenta,
      IdServicio,
      IdMascota,
      Cantidad,
      PrecioUnitario,
      Subtotal: subtotal,
    });

    // Actualizar totales de la venta
    const detallesVenta = await DetalleVentaServicio.findAll({
      where: { IdVenta },
    });

    let subtotalVenta = 0;

    for (const detalle of detallesVenta) {
      subtotalVenta += detalle.Subtotal;
    }

    await venta.update({
      TotalMonto: venta.TotalMonto + subtotal,
    });

    const detalleVentaServicioCreado = await DetalleVentaServicio.findByPk(nuevoDetalleVentaServicio.IdDetalleVentasServicios, {
      include: [
        { model: Venta },
        { model: Servicio, as: "Servicio" },
        { model: Mascota },
      ],
    });

    res.status(201).json({ message: "Detalle de venta de servicio creado exitosamente", data: detalleVentaServicioCreado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el detalle de venta de servicio", error: error.message });
  }
};

// Actualizar un detalle de venta de servicio
exports.updateDetalleVentaServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { Cantidad, PrecioUnitario } = req.body;

    const detalleVentaServicio = await DetalleVentaServicio.findByPk(id);

    if (!detalleVentaServicio) {
      return res.status(404).json({ message: "Detalle de venta de servicio no encontrado" });
    }

    // Validar que la cantidad sea positiva
    if (Cantidad && Cantidad <= 0) {
      return res.status(400).json({ message: "La cantidad debe ser mayor que 0" });
    }

    // Validar que el precio unitario sea positivo
    if (PrecioUnitario && PrecioUnitario < 0) {
      return res.status(400).json({ message: "El precio unitario no puede ser negativo" });
    }

    // Obtener la venta
    const venta = await Venta.findByPk(detalleVentaServicio.IdVenta);

    // Calcular nuevos valores
    const nuevaCantidad = Cantidad || detalleVentaServicio.Cantidad;
    const nuevoPrecioUnitario = PrecioUnitario || detalleVentaServicio.PrecioUnitario;
    const nuevoSubtotal = nuevaCantidad * nuevoPrecioUnitario;
    const subtotalAnterior = detalleVentaServicio.Subtotal;

    await detalleVentaServicio.update({
      Cantidad: nuevaCantidad,
      PrecioUnitario: nuevoPrecioUnitario,
      Subtotal: nuevoSubtotal,
    });

    // Actualizar totales de la venta
    await venta.update({
      TotalMonto: venta.TotalMonto - subtotalAnterior + nuevoSubtotal,
    });

    const detalleVentaServicioActualizado = await DetalleVentaServicio.findByPk(id, {
      include: [
        { model: Venta },
        { model: Servicio, as: "Servicio" },
        { model: Mascota },
      ],
    });

    res.status(200).json({ message: "Detalle de venta de servicio actualizado exitosamente", data: detalleVentaServicioActualizado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el detalle de venta de servicio", error: error.message });
  }
};

// Eliminar un detalle de venta de servicio
exports.deleteDetalleVentaServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const detalleVentaServicio = await DetalleVentaServicio.findByPk(id);

    if (!detalleVentaServicio) {
      return res.status(404).json({ message: "Detalle de venta de servicio no encontrado" });
    }

    // Obtener la venta
    const venta = await Venta.findByPk(detalleVentaServicio.IdVenta);

    // Actualizar totales de la venta
    await venta.update({
      TotalMonto: venta.TotalMonto - detalleVentaServicio.Subtotal,
    });

    await detalleVentaServicio.destroy();

    res.status(200).json({ message: "Detalle de venta de servicio eliminado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar el detalle de venta de servicio", error: error.message });
  }
};