const db = require("../Config/db");
const Compra = db.Compra;
const Proveedor = db.Proveedor;
const DetalleCompra = db.DetalleCompra;
const Producto = db.Producto;
const { Op } = db.Sequelize;

// Obtener todas las compras
exports.getAllCompras = async (req, res) => {
  try {
    const compras = await Compra.findAll({
      include: [
        { model: Proveedor },
        {
          model: DetalleCompra,
          include: [{ model: Producto }],
        },
      ],
    });
    res.status(200).json(compras);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las compras", error: error.message });
  }
};

// Obtener una compra por ID
exports.getCompraById = async (req, res) => {
  try {
    const { id } = req.params;
    const compra = await Compra.findByPk(id, {
      include: [
        { model: Proveedor },
        {
          model: DetalleCompra,
          include: [{ model: Producto }],
        },
      ],
    });

    if (!compra) {
      return res.status(404).json({ message: "Compra no encontrada" });
    }

    res.status(200).json(compra);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener la compra", error: error.message });
  }
};

// Obtener compras por proveedor
exports.getComprasByProveedor = async (req, res) => {
  try {
    const { proveedorId } = req.params;
    
    // Verificar que el proveedor existe
    const proveedorExiste = await Proveedor.findByPk(proveedorId);
    if (!proveedorExiste) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }
    
    const compras = await Compra.findAll({
      where: { IdProveedor: proveedorId },
      include: [
        { model: Proveedor },
        {
          model: DetalleCompra,
          include: [{ model: Producto }],
        },
      ],
    });

    res.status(200).json(compras);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las compras del proveedor", error: error.message });
  }
};

// Obtener compras por fecha
// Corrección en CompraController.js
exports.getComprasByFecha = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    
    if (!desde || !hasta) {
      return res.status(400).json({
        success: false,
        message: "Se requieren las fechas 'desde' y 'hasta'"
      });
    }

    const fechaDesde = new Date(desde);
    const fechaHasta = new Date(hasta);
    
    // Ajustar fechaHasta para incluir todo el día
    fechaHasta.setHours(23, 59, 59, 999);

    if (isNaN(fechaDesde.getTime()) || isNaN(fechaHasta.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Formato de fecha inválido"
      });
    }

    const compras = await Compra.findAll({
      where: {
        FechaCompra: {
          [Op.between]: [fechaDesde, fechaHasta]
        }
      },
      include: [
        { model: Proveedor },
        { 
          model: DetalleCompra,
          include: [{ model: Producto }]
        }
      ]
    });

    if (compras.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No se encontraron compras en el rango de fechas especificado"
      });
    }

    res.status(200).json({
      success: true,
      data: compras
    });
  } catch (error) {
    console.error("Error en getComprasByFecha:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener compras por fecha",
      error: error.message
    });
  }
};

// Crear una nueva compra
exports.createCompra = async (req, res) => {
  try {
    const { IdProveedor, FechaCompra, detalles } = req.body;

    // Validar campos requeridos
    if (!IdProveedor || !FechaCompra || !detalles || !detalles.length) {
      return res.status(400).json({ message: "IdProveedor, FechaCompra y al menos un detalle son obligatorios" });
    }

    // Verificar que el proveedor existe
    const proveedorExiste = await Proveedor.findByPk(IdProveedor);
    if (!proveedorExiste) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }

    // Validar formato de fecha
    const fechaCompra = new Date(FechaCompra);
    if (isNaN(fechaCompra.getTime())) {
      return res.status(400).json({ message: "La fecha de compra no es válida" });
    }

    // Validar detalles
    for (const detalle of detalles) {
      if (!detalle.IdProducto || !detalle.Cantidad || !detalle.PrecioUnitario) {
        return res.status(400).json({ message: "Cada detalle debe tener IdProducto, Cantidad y PrecioUnitario" });
      }

      // Verificar que el producto existe
      const productoExiste = await Producto.findByPk(detalle.IdProducto);
      if (!productoExiste) {
        return res.status(404).json({ message: `Producto con ID ${detalle.IdProducto} no encontrado` });
      }

      // Validar que la cantidad sea positiva
      if (detalle.Cantidad <= 0) {
        return res.status(400).json({ message: "La cantidad debe ser mayor que 0" });
      }

      // Validar que el precio unitario sea positivo
      if (detalle.PrecioUnitario < 0) {
        return res.status(400).json({ message: "El precio unitario no puede ser negativo" });
      }
    }

    // Calcular totales iniciales
    let totalMonto = 0;
    let totalIva = 0;
    let totalMontoConIva = 0;

    // Crear la compra
    const nuevaCompra = await Compra.create({
      IdProveedor,
      FechaCompra: fechaCompra,
      TotalMonto: totalMonto,
      TotalIva: totalIva,
      TotalMontoConIva: totalMontoConIva,
      Estado: 'Efectiva',
    });

    // Crear detalles de compra
    for (const detalle of detalles) {
      const producto = await Producto.findByPk(detalle.IdProducto);
      
      // Calcular subtotal
      const subtotal = detalle.Cantidad * detalle.PrecioUnitario;
      
      // Calcular IVA unitario
      const ivaUnitario = producto.AplicaIVA ? (detalle.PrecioUnitario * producto.PorcentajeIVA / 100) : 0;
      
      // Calcular subtotal con IVA
      const subtotalConIva = subtotal + (subtotal * (producto.AplicaIVA ? producto.PorcentajeIVA / 100 : 0));
      
      await DetalleCompra.create({
        IdCompra: nuevaCompra.IdCompra,
        IdProducto: detalle.IdProducto,
        Cantidad: detalle.Cantidad,
        PrecioUnitario: detalle.PrecioUnitario,
        Subtotal: subtotal,
        IvaUnitario: ivaUnitario,
        SubtotalConIva: subtotalConIva,
      });
      
      // Actualizar stock del producto
      await producto.update({
        Stock: producto.Stock + detalle.Cantidad,
      });
      
      // Actualizar totales
      totalMonto += subtotal;
      totalIva += (subtotal * (producto.AplicaIVA ? producto.PorcentajeIVA / 100 : 0));
      totalMontoConIva += subtotalConIva;
    }

    // Actualizar totales en la compra
    await nuevaCompra.update({
      TotalMonto: totalMonto,
      TotalIva: totalIva,
      TotalMontoConIva: totalMontoConIva,
    });

    // Obtener la compra creada con sus relaciones
    const compraCreada = await Compra.findByPk(nuevaCompra.IdCompra, {
      include: [
        { model: Proveedor },
        {
          model: DetalleCompra,
          include: [{ model: Producto }],
        },
      ],
    });

    res.status(201).json({ message: "Compra creada exitosamente", data: compraCreada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear la compra", error: error.message });
  }
};

// Actualizar el estado de una compra
exports.updateCompraEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { Estado } = req.body;

    // Validar que el estado sea válido
    if (!['Efectiva', 'Cancelada'].includes(Estado)) {
      return res.status(400).json({ message: "El estado debe ser 'Efectiva' o 'Cancelada'" });
    }

    const compra = await Compra.findByPk(id, {
      include: [{ model: DetalleCompra }],
    });

    if (!compra) {
      return res.status(404).json({ message: "Compra no encontrada" });
    }

    // Si se está cancelando una compra efectiva, revertir el stock
    if (compra.Estado === 'Efectiva' && Estado === 'Cancelada') {
      for (const detalle of compra.DetalleCompras) {
        const producto = await Producto.findByPk(detalle.IdProducto);
        
        // Revertir el stock
        await producto.update({
          Stock: Math.max(0, producto.Stock - detalle.Cantidad),
        });
      }
    }
    // Si se está reactivando una compra cancelada, aumentar el stock
    else if (compra.Estado === 'Cancelada' && Estado === 'Efectiva') {
      for (const detalle of compra.DetalleCompras) {
        const producto = await Producto.findByPk(detalle.IdProducto);
        
        // Aumentar el stock
        await producto.update({
          Stock: producto.Stock + detalle.Cantidad,
        });
      }
    }

    await compra.update({ Estado });

    const compraActualizada = await Compra.findByPk(id, {
      include: [
        { model: Proveedor },
        {
          model: DetalleCompra,
          include: [{ model: Producto }],
        },
      ],
    });

    res.status(200).json({ message: "Estado de compra actualizado exitosamente", data: compraActualizada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el estado de la compra", error: error.message });
  }
};

// Eliminar una compra
exports.deleteCompra = async (req, res) => {
  try {
    const { id } = req.params;
    const compra = await Compra.findByPk(id, {
      include: [{ model: DetalleCompra }],
    });

    if (!compra) {
      return res.status(404).json({ message: "Compra no encontrada" });
    }

    // Si la compra es efectiva, revertir el stock
    if (compra.Estado === 'Efectiva') {
      for (const detalle of compra.DetalleCompras) {
        const producto = await Producto.findByPk(detalle.IdProducto);
        
        // Revertir el stock
        await producto.update({
          Stock: Math.max(0, producto.Stock - detalle.Cantidad),
        });
      }
    }

    // Eliminar los detalles de compra
    await DetalleCompra.destroy({
      where: { IdCompra: id },
    });

    // Eliminar la compra
    await compra.destroy();

    res.status(200).json({ message: "Compra eliminada exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar la compra", error: error.message });
  }
};