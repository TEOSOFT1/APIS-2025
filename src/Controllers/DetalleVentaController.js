const db = require("../Config/db");
const DetalleVenta = db.DetalleVenta;
const Venta = db.Venta;
const Producto = db.Producto;

// Obtener todos los detalles de venta
exports.getAllDetallesVenta = async (req, res) => {
  try {
    const detalles = await DetalleVenta.findAll({
      include: [{ model: Producto, as: "Producto", attributes: ["NombreProducto", "Precio"] }],
    });

    res.json(detalles);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo detalles de venta", error: error.message });
  }
};

// Obtener detalles de una venta por ID de Venta
exports.getDetallesVentaByVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const detalles = await DetalleVenta.findAll({
      where: { IdVenta: id },
      include: [{ model: Producto, as: "Producto", attributes: ["NombreProducto", "Precio"] }],
    });

    if (detalles.length === 0) {
      return res.status(404).json({ message: "No hay detalles para esta venta" });
    }

    res.json(detalles);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo detalles de la venta", error: error.message });
  }
};

// Obtener un solo detalle de venta por ID
exports.getDetalleVentaById = async (req, res) => {
  try {
    const { id } = req.params;
    const detalle = await DetalleVenta.findByPk(id, {
      include: [{ model: Producto, as: "Producto", attributes: ["NombreProducto", "Precio"] }],
    });

    if (!detalle) {
      return res.status(404).json({ message: "Detalle de venta no encontrado" });
    }

    res.json(detalle);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo el detalle de venta", error: error.message });
  }
};

// Agregar un producto a una venta
exports.addProductoToVenta = async (req, res) => {
  try {
    const { IdVenta, IdProducto, Cantidad, PrecioUnitario } = req.body;

    if (!IdVenta || !IdProducto || !Cantidad || !PrecioUnitario) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // ✅ Calcular valores requeridos
    const Subtotal = Cantidad * PrecioUnitario;
    const IvaUnitario = Subtotal * 0.18; // Suponiendo 18% de IVA
    const SubtotalConIva = Subtotal + IvaUnitario;

    // ✅ Crear el detalle de venta
    const nuevoDetalle = await DetalleVenta.create({
      IdVenta,
      IdProducto,
      Cantidad,
      PrecioUnitario,
      Subtotal,
      IvaUnitario,
      SubtotalConIva
    });

    // ✅ Actualizar stock del producto
    await Producto.decrement("Stock", { by: Cantidad, where: { IdProducto } });

    res.status(201).json({ message: "Producto agregado a la venta exitosamente", detalle: nuevoDetalle });
  } catch (error) {
    res.status(500).json({ message: "Error agregando producto a la venta", error: error.message });
  }
};
//Actualizar un Detalle de Venta 

exports.updateDetalleVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const { Cantidad, PrecioUnitario } = req.body;

    const detalle = await DetalleVenta.findByPk(id);
    if (!detalle) {
      return res.status(404).json({ message: "Detalle de venta no encontrado" });
    }

    // Calcular nuevos valores
    const Subtotal = Cantidad * PrecioUnitario;
    const IvaUnitario = Subtotal * 0.18;
    const SubtotalConIva = Subtotal + IvaUnitario;

    await detalle.update({ Cantidad, PrecioUnitario, Subtotal, IvaUnitario, SubtotalConIva });

    res.json({ message: "Detalle de venta actualizado exitosamente", detalle });
  } catch (error) {
    res.status(500).json({ message: "Error actualizando detalle de venta", error: error.message });
  }
};


// Eliminar un producto de una venta
exports.removeProductoFromVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const detalle = await DetalleVenta.findByPk(id);

    if (!detalle) {
      return res.status(404).json({ message: "Detalle de venta no encontrado" });
    }

    // Revertir stock del producto
    await Producto.increment("Stock", { by: detalle.Cantidad, where: { IdProducto: detalle.IdProducto } });

    await detalle.destroy();
    res.json({ message: "Producto eliminado de la venta exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error eliminando producto de la venta", error: error.message });
  }
};
