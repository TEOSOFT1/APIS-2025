const db = require("../Config/db");
const DetalleVenta = db.DetalleVenta;
const Venta = db.Venta;
const Producto = db.Producto;

// Obtener todos los detalles de venta
exports.getAllDetallesVenta = async (req, res) => {
  try {
    const detallesVenta = await DetalleVenta.findAll({
      include: [
        { model: Venta },
        { model: Producto, as: "Producto" },
      ],
    });
    res.status(200).json(detallesVenta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los detalles de venta", error: error.message });
  }
};

// Obtener un detalle de venta por ID
exports.getDetalleVentaById = async (req, res) => {
  try {
    const { id } = req.params;
    const detalleVenta = await DetalleVenta.findByPk(id, {
      include: [
        { model: Venta },
        { model: Producto, as: "Producto" },
      ],
    });

    if (!detalleVenta) {
      return res.status(404).json({ message: "Detalle de venta no encontrado" });
    }

    res.status(200).json(detalleVenta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el detalle de venta", error: error.message });
  }
};

// Obtener detalles de venta por venta
exports.getDetallesByVenta = async (req, res) => {
  try {
    const { ventaId } = req.params;
    
    // Verificar que la venta existe
    const ventaExiste = await Venta.findByPk(ventaId);
    if (!ventaExiste) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }
    
    const detallesVenta = await DetalleVenta.findAll({
      where: { IdVenta: ventaId },
      include: [{ model: Producto, as: "Producto" }],
    });

    res.status(200).json(detallesVenta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los detalles de la venta", error: error.message });
  }
};

// Obtener detalles de venta por producto
exports.getDetallesByProducto = async (req, res) => {
  try {
    const { productoId } = req.params;
    
    // Verificar que el producto existe
    const productoExiste = await Producto.findByPk(productoId);
    if (!productoExiste) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    
    const detallesVenta = await DetalleVenta.findAll({
      where: { IdProducto: productoId },
      include: [{ model: Venta }],
    });

    res.status(200).json(detallesVenta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los detalles de venta del producto", error: error.message });
  }
};

// Crear un nuevo detalle de venta
exports.createDetalleVenta = async (req, res) => {
  try {
    const { IdVenta, IdProducto, Cantidad, PrecioUnitario } = req.body;

    // Validar campos requeridos
    if (!IdVenta || !IdProducto || !Cantidad || !PrecioUnitario) {
      return res.status(400).json({ message: "IdVenta, IdProducto, Cantidad y PrecioUnitario son obligatorios" });
    }

    // Verificar que la venta existe
    const venta = await Venta.findByPk(IdVenta);
    if (!venta) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }

    // Verificar que el producto existe
    const producto = await Producto.findByPk(IdProducto);
    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Validar que la cantidad sea positiva
    if (Cantidad <= 0) {
      return res.status(400).json({ message: "La cantidad debe ser mayor que 0" });
    }

    // Validar que el precio unitario sea positivo
    if (PrecioUnitario < 0) {
      return res.status(400).json({ message: "El precio unitario no puede ser negativo" });
    }

    // Si es una venta, verificar stock
    if (venta.Tipo === 'Venta' && venta.Estado === 'Efectiva' && producto.Stock < Cantidad) {
      return res.status(400).json({ message: `Stock insuficiente para el producto ${producto.NombreProducto}. Disponible: ${producto.Stock}` });
    }

    // Calcular subtotal
    const subtotal = Cantidad * PrecioUnitario;
    
    // Calcular IVA unitario
    const ivaUnitario = producto.AplicaIVA ? (PrecioUnitario * producto.PorcentajeIVA / 100) : 0;
    
    // Calcular subtotal con IVA
    const subtotalConIva = subtotal + (subtotal * (producto.AplicaIVA ? producto.PorcentajeIVA / 100 : 0));

    const nuevoDetalleVenta = await DetalleVenta.create({
      IdVenta,
      IdProducto,
      Cantidad,
      PrecioUnitario,
      Subtotal: subtotal,
      IvaUnitario: ivaUnitario,
      SubtotalConIva: subtotalConIva,
    });

    // Actualizar stock del producto si la venta es efectiva
    if (venta.Estado === 'Efectiva') {
      if (venta.Tipo === 'Venta') {
        await producto.update({
          Stock: producto.Stock - Cantidad,
        });
      } else if (venta.Tipo === 'Devolucion') {
        await producto.update({
          Stock: producto.Stock + Cantidad,
        });
      }
    }

    // Actualizar totales de la venta
    const detallesVenta = await DetalleVenta.findAll({
      where: { IdVenta },
    });

    let subtotalVenta = 0;
    let totalIva = 0;
    let totalMonto = 0;

    for (const detalle of detallesVenta) {
      subtotalVenta += detalle.Subtotal;
      totalIva += (detalle.Subtotal * (producto.AplicaIVA ? producto.PorcentajeIVA / 100 : 0));
      totalMonto += detalle.SubtotalConIva;
    }

    await venta.update({
      Subtotal: subtotalVenta,
      TotalIva: totalIva,
      TotalMonto: totalMonto,
    });

    const detalleVentaCreado = await DetalleVenta.findByPk(nuevoDetalleVenta.IdDetalleVentas, {
      include: [
        { model: Venta },
        { model: Producto, as: "Producto" },
      ],
    });

    res.status(201).json({ message: "Detalle de venta creado exitosamente", data: detalleVentaCreado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el detalle de venta", error: error.message });
  }
};

// Actualizar un detalle de venta
exports.updateDetalleVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const { Cantidad, PrecioUnitario } = req.body;

    const detalleVenta = await DetalleVenta.findByPk(id);

    if (!detalleVenta) {
      return res.status(404).json({ message: "Detalle de venta no encontrado" });
    }

    // Obtener la cantidad anterior para ajustar el stock
    const cantidadAnterior = detalleVenta.Cantidad;

    // Validar que la cantidad sea positiva
    if (Cantidad && Cantidad <= 0) {
      return res.status(400).json({ message: "La cantidad debe ser mayor que 0" });
    }

    // Validar que el precio unitario sea positivo
    if (PrecioUnitario && PrecioUnitario < 0) {
      return res.status(400).json({ message: "El precio unitario no puede ser negativo" });
    }

    // Obtener la venta y el producto
    const venta = await Venta.findByPk(detalleVenta.IdVenta);
    const producto = await Producto.findByPk(detalleVenta.IdProducto);

    // Si es una venta efectiva y se aumenta la cantidad, verificar stock
    const nuevaCantidad = Cantidad || detalleVenta.Cantidad;
    if (venta.Estado === 'Efectiva' && venta.Tipo === 'Venta' && nuevaCantidad > cantidadAnterior) {
      const cantidadAdicional = nuevaCantidad - cantidadAnterior;
      if (producto.Stock < cantidadAdicional) {
        return res.status(400).json({ message: `Stock insuficiente para el producto ${producto.NombreProducto}. Disponible: ${producto.Stock}` });
      }
    }

    // Calcular nuevos valores
    const nuevoPrecioUnitario = PrecioUnitario || detalleVenta.PrecioUnitario;
    const nuevoSubtotal = nuevaCantidad * nuevoPrecioUnitario;
    const nuevoIvaUnitario = producto.AplicaIVA ? (nuevoPrecioUnitario * producto.PorcentajeIVA / 100) : 0;
    const nuevoSubtotalConIva = nuevoSubtotal + (nuevoSubtotal * (producto.AplicaIVA ? producto.PorcentajeIVA / 100 : 0));

    await detalleVenta.update({
      Cantidad: nuevaCantidad,
      PrecioUnitario: nuevoPrecioUnitario,
      Subtotal: nuevoSubtotal,
      IvaUnitario: nuevoIvaUnitario,
      SubtotalConIva: nuevoSubtotalConIva,
    });

    // Actualizar stock del producto si la venta es efectiva
    if (venta.Estado === 'Efectiva') {
      if (venta.Tipo === 'Venta') {
        await producto.update({
          Stock: producto.Stock - (nuevaCantidad - cantidadAnterior),
        });
      } else if (venta.Tipo === 'Devolucion') {
        await producto.update({
          Stock: producto.Stock + (nuevaCantidad - cantidadAnterior),
        });
      }
    }

    // Actualizar totales de la venta
    const detallesVenta = await DetalleVenta.findAll({
      where: { IdVenta: detalleVenta.IdVenta },
    });

    let subtotalVenta = 0;
    let totalIva = 0;
    let totalMonto = 0;

    for (const detalle of detallesVenta) {
      const prod = await Producto.findByPk(detalle.IdProducto);
      subtotalVenta += detalle.Subtotal;
      totalIva += (detalle.Subtotal * (prod.AplicaIVA ? prod.PorcentajeIVA / 100 : 0));
      totalMonto += detalle.SubtotalConIva;
    }

    await venta.update({
      Subtotal: subtotalVenta,
      TotalIva: totalIva,
      TotalMonto: totalMonto,
    });

    const detalleVentaActualizado = await DetalleVenta.findByPk(id, {
      include: [
        { model: Venta },
        { model: Producto, as: "Producto" },
      ],
    });

    res.status(200).json({ message: "Detalle de venta actualizado exitosamente", data: detalleVentaActualizado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el detalle de venta", error: error.message });
  }
};

// Eliminar un detalle de venta
exports.deleteDetalleVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const detalleVenta = await DetalleVenta.findByPk(id);

    if (!detalleVenta) {
      return res.status(404).json({ message: "Detalle de venta no encontrado" });
    }

    // Obtener la venta y el producto
    const venta = await Venta.findByPk(detalleVenta.IdVenta);
    const producto = await Producto.findByPk(detalleVenta.IdProducto);

    // Revertir el stock si la venta es efectiva
    if (venta.Estado === 'Efectiva') {
      if (venta.Tipo === 'Venta') {
        await producto.update({
          Stock: producto.Stock + detalleVenta.Cantidad,
        });
      } else if (venta.Tipo === 'Devolucion') {
        await producto.update({
          Stock: Math.max(0, producto.Stock - detalleVenta.Cantidad),
        });
      }
    }

    await detalleVenta.destroy();

    // Actualizar totales de la venta
    const detallesVenta = await DetalleVenta.findAll({
      where: { IdVenta: detalleVenta.IdVenta },
    });

    let subtotalVenta = 0;
    let totalIva = 0;
    let totalMonto = 0;

    for (const detalle of detallesVenta) {
      const prod = await Producto.findByPk(detalle.IdProducto);
      subtotalVenta += detalle.Subtotal;
      totalIva += (detalle.Subtotal * (prod.AplicaIVA ? prod.PorcentajeIVA / 100 : 0));
      totalMonto += detalle.SubtotalConIva;
    }

    await venta.update({
      Subtotal: subtotalVenta,
      TotalIva: totalIva,
      TotalMonto: totalMonto,
    });

    res.status(200).json({ message: "Detalle de venta eliminado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar el detalle de venta", error: error.message });
  }
};