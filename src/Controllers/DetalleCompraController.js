const db = require("../Config/db");
const DetalleCompra = db.DetalleCompra;
const Compra = db.Compra;
const Producto = db.Producto;

// Obtener todos los detalles de compra
exports.getAllDetallesCompra = async (req, res) => {
  try {
    const detallesCompra = await DetalleCompra.findAll({
      include: [
        { model: Compra },
        { model: Producto },
      ],
    });
    res.status(200).json({
      success: true,
      data: detallesCompra
    });
  } catch (error) {
    console.error("Error en getAllDetallesCompra:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener los detalles de compra", 
      error: error.message 
    });
  }
};

// Obtener un detalle de compra por ID
exports.getDetalleCompraById = async (req, res) => {
  try {
    const { id } = req.params;
    const detalleCompra = await DetalleCompra.findByPk(id, {
      include: [
        { model: Compra },
        { model: Producto },
      ],
    });

    if (!detalleCompra) {
      return res.status(404).json({ 
        success: false,
        message: "Detalle de compra no encontrado" 
      });
    }

    res.status(200).json({
      success: true,
      data: detalleCompra
    });
  } catch (error) {
    console.error("Error en getDetalleCompraById:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener el detalle de compra", 
      error: error.message 
    });
  }
};

// Obtener detalles de compra por compra
exports.getDetallesByCompra = async (req, res) => {
  try {
    const { compraId } = req.params;
    
    // Verificar que la compra existe
    const compraExiste = await Compra.findByPk(compraId);
    if (!compraExiste) {
      return res.status(404).json({ 
        success: false,
        message: "Compra no encontrada" 
      });
    }
    
    const detallesCompra = await DetalleCompra.findAll({
      where: { IdCompra: compraId },
      include: [{ model: Producto }],
    });

    res.status(200).json({
      success: true,
      data: detallesCompra
    });
  } catch (error) {
    console.error("Error en getDetallesByCompra:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener los detalles de la compra", 
      error: error.message 
    });
  }
};

// Obtener detalles de compra por producto
exports.getDetallesByProducto = async (req, res) => {
  try {
    const { productoId } = req.params;
    
    // Verificar que el producto existe
    const productoExiste = await Producto.findByPk(productoId);
    if (!productoExiste) {
      return res.status(404).json({ 
        success: false,
        message: "Producto no encontrado" 
      });
    }
    
    const detallesCompra = await DetalleCompra.findAll({
      where: { IdProducto: productoId },
      include: [{ model: Compra }],
    });

    res.status(200).json({
      success: true,
      data: detallesCompra
    });
  } catch (error) {
    console.error("Error en getDetallesByProducto:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener los detalles de compra del producto", 
      error: error.message 
    });
  }
};

// Crear un nuevo detalle de compra
exports.createDetalleCompra = async (req, res) => {
  try {
    const { IdCompra, IdProducto, Cantidad, PrecioUnitario } = req.body;

    // Validar campos requeridos
    if (!IdCompra || !IdProducto || !Cantidad || !PrecioUnitario) {
      return res.status(400).json({ 
        success: false,
        message: "IdCompra, IdProducto, Cantidad y PrecioUnitario son obligatorios" 
      });
    }

    // Verificar que la compra existe
    const compra = await Compra.findByPk(IdCompra);
    if (!compra) {
      return res.status(404).json({ 
        success: false,
        message: "Compra no encontrada" 
      });
    }

    // Verificar que el producto existe
    const producto = await Producto.findByPk(IdProducto);
    if (!producto) {
      return res.status(404).json({ 
        success: false,
        message: "Producto no encontrado" 
      });
    }

    // Calcular subtotal - Asegurarse de que sean números
    const cantidadNum = Number(Cantidad);
    const precioUnitarioNum = Number(PrecioUnitario);
    const subtotal = cantidadNum * precioUnitarioNum;
    
    // Calcular IVA unitario
    const porcentajeIVA = producto.AplicaIVA ? Number(producto.PorcentajeIVA) : 0;
    const ivaUnitario = producto.AplicaIVA ? (precioUnitarioNum * porcentajeIVA / 100) : 0;
    
    // Calcular subtotal con IVA
    const subtotalConIva = subtotal + (subtotal * porcentajeIVA / 100);

    // Crear el detalle de compra
    const detalleCompra = await DetalleCompra.create({
      IdCompra,
      IdProducto,
      Cantidad: cantidadNum,
      PrecioUnitario: precioUnitarioNum,
      Subtotal: subtotal,
      IvaUnitario: ivaUnitario,
      SubtotalConIva: subtotalConIva
    });

    // Actualizar totales de la compra
    const detallesCompra = await DetalleCompra.findAll({
      where: { IdCompra },
      include: [{ model: Producto }]
    });

    let totalMonto = 0;
    let totalIva = 0;
    let totalMontoConIva = 0;

    detallesCompra.forEach(detalle => {
      // Asegurarse de que todos los valores sean números
      const subtotalDetalle = Number(detalle.Subtotal);
      const porcentajeIVAProducto = detalle.Producto.AplicaIVA ? Number(detalle.Producto.PorcentajeIVA) : 0;
      const ivaDetalle = subtotalDetalle * porcentajeIVAProducto / 100;
      
      totalMonto += subtotalDetalle;
      totalIva += ivaDetalle;
      totalMontoConIva += (subtotalDetalle + ivaDetalle);
    });

    await compra.update({
      TotalMonto: Number(totalMonto.toFixed(2)),
      TotalIva: Number(totalIva.toFixed(2)),
      TotalMontoConIva: Number(totalMontoConIva.toFixed(2))
    });

    // Actualizar stock del producto si la compra está efectiva
    if (compra.Estado === 'Efectiva') {
      await producto.update({
        Stock: Number(producto.Stock) + cantidadNum
      });
    }

    res.status(201).json({
      success: true,
      message: "Detalle de compra creado exitosamente",
      data: detalleCompra
    });
  } catch (error) {
    console.error("Error en createDetalleCompra:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear detalle de compra",
      error: error.message
    });
  }
};

// Actualizar un detalle de compra
exports.updateDetalleCompra = async (req, res) => {
  try {
    const { id } = req.params;
    const { Cantidad, PrecioUnitario } = req.body;

    // Buscar el detalle de compra
    const detalleCompra = await DetalleCompra.findByPk(id, {
      include: [{ model: Producto }]
    });

    if (!detalleCompra) {
      return res.status(404).json({
        success: false,
        message: "Detalle de compra no encontrado"
      });
    }

    // Obtener la compra asociada
    const compra = await Compra.findByPk(detalleCompra.IdCompra);
    if (!compra) {
      return res.status(404).json({
        success: false,
        message: "Compra asociada no encontrada"
      });
    }

    // Guardar la cantidad anterior para actualizar el stock
    const cantidadAnterior = Number(detalleCompra.Cantidad);
    
    // Actualizar campos si se proporcionan - Asegurarse de que sean números
    const nuevaCantidad = Cantidad !== undefined ? Number(Cantidad) : cantidadAnterior;
    const nuevoPrecioUnitario = PrecioUnitario !== undefined ? Number(PrecioUnitario) : Number(detalleCompra.PrecioUnitario);
    
    // Recalcular subtotales
    const nuevoSubtotal = nuevaCantidad * nuevoPrecioUnitario;
    const porcentajeIVA = detalleCompra.Producto.AplicaIVA ? Number(detalleCompra.Producto.PorcentajeIVA) : 0;
    const nuevoIvaUnitario = detalleCompra.Producto.AplicaIVA ? 
      (nuevoPrecioUnitario * porcentajeIVA / 100) : 0;
    const nuevoSubtotalConIva = nuevoSubtotal + (nuevoSubtotal * porcentajeIVA / 100);

    // Actualizar el detalle de compra
    await detalleCompra.update({
      Cantidad: nuevaCantidad,
      PrecioUnitario: nuevoPrecioUnitario,
      Subtotal: nuevoSubtotal,
      IvaUnitario: nuevoIvaUnitario,
      SubtotalConIva: nuevoSubtotalConIva
    });

    // Actualizar totales de la compra
    const detallesCompra = await DetalleCompra.findAll({
      where: { IdCompra: detalleCompra.IdCompra },
      include: [{ model: Producto }]
    });

    let totalMonto = 0;
    let totalIva = 0;
    let totalMontoConIva = 0;

    detallesCompra.forEach(detalle => {
      // Asegurarse de que todos los valores sean números
      const subtotalDetalle = Number(detalle.Subtotal);
      const porcentajeIVAProducto = detalle.Producto.AplicaIVA ? Number(detalle.Producto.PorcentajeIVA) : 0;
      const ivaDetalle = subtotalDetalle * porcentajeIVAProducto / 100;
      
      totalMonto += subtotalDetalle;
      totalIva += ivaDetalle;
      totalMontoConIva += (subtotalDetalle + ivaDetalle);
    });

    await compra.update({
      TotalMonto: Number(totalMonto.toFixed(2)),
      TotalIva: Number(totalIva.toFixed(2)),
      TotalMontoConIva: Number(totalMontoConIva.toFixed(2))
    });

    // Actualizar stock del producto si la compra está efectiva
    if (compra.Estado === 'Efectiva') {
      const producto = await Producto.findByPk(detalleCompra.IdProducto);
      if (producto) {
        // Restar la cantidad anterior y sumar la nueva
        await producto.update({
          Stock: Number(producto.Stock) - cantidadAnterior + nuevaCantidad
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Detalle de compra actualizado exitosamente",
      data: detalleCompra
    });
  } catch (error) {
    console.error("Error en updateDetalleCompra:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar detalle de compra",
      error: error.message
    });
  }
};

// Eliminar un detalle de compra
exports.deleteDetalleCompra = async (req, res) => {
  try {
    const { id } = req.params;
    const detalleCompra = await DetalleCompra.findByPk(id);

    if (!detalleCompra) {
      return res.status(404).json({
        success: false,
        message: "Detalle de compra no encontrado"
      });
    }

    // Obtener la compra y el producto
    const compra = await Compra.findByPk(detalleCompra.IdCompra);
    const producto = await Producto.findByPk(detalleCompra.IdProducto);

    // Revertir el stock si la compra es efectiva
    if (compra.Estado === 'Efectiva') {
      await producto.update({
        Stock: Math.max(0, Number(producto.Stock) - Number(detalleCompra.Cantidad)),
      });
    }

    await detalleCompra.destroy();

    // Actualizar totales de la compra
    const detallesCompra = await DetalleCompra.findAll({
      where: { IdCompra: detalleCompra.IdCompra },
      include: [{ model: Producto }]
    });

    let totalMonto = 0;
    let totalIva = 0;
    let totalMontoConIva = 0;

    detallesCompra.forEach(detalle => {
      // Asegurarse de que todos los valores sean números
      const subtotalDetalle = Number(detalle.Subtotal);
      const porcentajeIVAProducto = detalle.Producto.AplicaIVA ? Number(detalle.Producto.PorcentajeIVA) : 0;
      const ivaDetalle = subtotalDetalle * porcentajeIVAProducto / 100;
      
      totalMonto += subtotalDetalle;
      totalIva += ivaDetalle;
      totalMontoConIva += (subtotalDetalle + ivaDetalle);
    });

    await compra.update({
      TotalMonto: Number(totalMonto.toFixed(2)),
      TotalIva: Number(totalIva.toFixed(2)),
      TotalMontoConIva: Number(totalMontoConIva.toFixed(2))
    });

    res.status(200).json({
      success: true,
      message: "Detalle de compra eliminado exitosamente"
    });
  } catch (error) {
    console.error("Error en deleteDetalleCompra:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar el detalle de compra",
      error: error.message
    });
  }
};