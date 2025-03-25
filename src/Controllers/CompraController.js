const db = require("../Config/db");
const Compra = db.Compra;
const DetalleCompra = db.DetalleCompra;
const Proveedor = db.Proveedor;
const Producto = db.Producto;
const { Op } = require("sequelize");

// ✅ Obtener todas las compras
exports.getAllCompras = async (req, res) => {
  try {
    const compras = await Compra.findAll({
      include: [{ model: Proveedor, attributes: ["Nombre", "Telefono"] }],
      order: [["FechaCompra", "DESC"]],
    });
    res.json(compras);
  } catch (error) {
    console.error("❌ Error en getAllCompras:", error);
    res.status(500).json({ message: "Error obteniendo compras", error: error.message });
  }
};

// ✅ Obtener compras por proveedor
exports.getComprasByProveedor = async (req, res) => {
  try {
    const { idProveedor } = req.params;
    const compras = await Compra.findAll({
      where: { IdProveedor: idProveedor },
      include: [{ model: Proveedor, attributes: ["Nombre", "Telefono"] }],
    });

    if (!compras.length) {
      return res.status(404).json({ message: "No hay compras para este proveedor" });
    }
    res.json(compras);
  } catch (error) {
    console.error("❌ Error en getComprasByProveedor:", error);
    res.status(500).json({ message: "Error obteniendo compras del proveedor", error: error.message });
  }
};

// ✅ Obtener compra por ID
exports.getCompraById = async (req, res) => {
  try {
    const { id } = req.params;
    const compra = await Compra.findByPk(id, {
      include: [{ model: Proveedor, attributes: ["Nombre", "Telefono"] }],
    });

    if (!compra) {
      return res.status(404).json({ message: "Compra no encontrada" });
    }
    res.json(compra);
  } catch (error) {
    console.error("❌ Error en getCompraById:", error);
    res.status(500).json({ message: "Error obteniendo compra", error: error.message });
  }
};

// ✅ Obtener detalles de una compra
exports.getDetallesCompra = async (req, res) => {
  try {
    const { id } = req.params;
    const detalles = await DetalleCompra.findAll({
      where: { IdCompra: id },
      include: [{ model: Producto, attributes: ["Nombre", "Precio"] }],
    });

    if (!detalles.length) {
      return res.status(404).json({ message: "No hay detalles para esta compra" });
    }
    res.json(detalles);
  } catch (error) {
    console.error("❌ Error en getDetallesCompra:", error);
    res.status(500).json({ message: "Error obteniendo detalles de la compra", error: error.message });
  }
};

// ✅ Crear una nueva compra con transacción
exports.createCompra = async (req, res) => {
  const t = await db.sequelize.transaction();

  try {
    const { IdProveedor, FechaCompra, Detalles } = req.body;

    if (!IdProveedor || !FechaCompra || !Detalles || !Array.isArray(Detalles) || Detalles.length === 0) {
      return res.status(400).json({ message: "Datos incompletos para la compra" });
    }

    const nuevaCompra = await Compra.create(
      {
        IdProveedor,
        FechaCompra,
        TotalMonto: 0,
        TotalIva: 0,
        TotalMontoConIva: 0,
        Estado: "Efectiva",
      },
      { transaction: t }
    );

    let totalMonto = 0;
    let totalIva = 0;

    await Promise.all(
      Detalles.map(async (detalle) => {
        const subtotal = detalle.Cantidad * detalle.PrecioUnitario;
        const iva = subtotal * 0.19;
        const subtotalConIva = subtotal + iva;

        await DetalleCompra.create(
          {
            IdCompra: nuevaCompra.IdCompra,
            IdProducto: detalle.IdProducto,
            Cantidad: detalle.Cantidad,
            PrecioUnitario: detalle.PrecioUnitario,
            Subtotal: subtotal,
            IvaUnitario: iva,
            SubtotalConIva: subtotalConIva,
          },
          { transaction: t }
        );

        await Producto.increment(
          { Stock: detalle.Cantidad },
          { where: { IdProducto: detalle.IdProducto }, transaction: t }
        );

        totalMonto += subtotal;
        totalIva += iva;
      })
    );

    await nuevaCompra.update(
      {
        TotalMonto: totalMonto,
        TotalIva: totalIva,
        TotalMontoConIva: totalMonto + totalIva,
      },
      { transaction: t }
    );

    await t.commit();

    res.status(201).json({
      message: "Compra creada exitosamente",
      compraId: nuevaCompra.IdCompra,
    });

  } catch (error) {
    await t.rollback();
    console.error("❌ Error en createCompra:", error.message);
    res.status(500).json({ message: "Error creando compra", error: error.message });
  }
};

// ✅ Cambiar estado de una compra (ANULAR)
exports.updateEstadoCompra = async (req, res) => {
  try {
    const { id } = req.params;
    const { Estado } = req.body;

    const compra = await Compra.findByPk(id);
    if (!compra) {
      return res.status(404).json({ message: "Compra no encontrada" });
    }

    if (Estado === "Cancelada" && compra.Estado === "Efectiva") {
      const detalles = await DetalleCompra.findAll({ where: { IdCompra: id } });

      await Promise.all(
        detalles.map(async (detalle) => {
          await Producto.decrement("Stock", {
            by: detalle.Cantidad,
            where: { IdProducto: detalle.IdProducto },
          });
        })
      );
    }

    await compra.update({ Estado });

    res.json({ message: `Estado de la compra actualizado a '${Estado}' exitosamente` });

  } catch (error) {
    console.error("❌ Error en updateEstadoCompra:", error.message);
    res.status(500).json({ message: "Error actualizando estado de la compra", error: error.message });
  }
};

// ✅ Actualizar una compra
exports.updateCompra = async (req, res) => {
  const t = await db.sequelize.transaction();

  try {
    const { id } = req.params;
    const { IdProveedor, FechaCompra, Detalles } = req.body;

    const compra = await Compra.findByPk(id);
    if (!compra) {
      return res.status(404).json({ message: "Compra no encontrada" });
    }

    await compra.update({ IdProveedor, FechaCompra }, { transaction: t });

    if (Detalles && Array.isArray(Detalles)) {
      await DetalleCompra.destroy({ where: { IdCompra: id }, transaction: t });

      let totalMonto = 0;
      let totalIva = 0;

      await Promise.all(
        Detalles.map(async (detalle) => {
          const subtotal = detalle.Cantidad * detalle.PrecioUnitario;
          const iva = subtotal * 0.19;
          const subtotalConIva = subtotal + iva;

          await DetalleCompra.create(
            {
              IdCompra: id,
              IdProducto: detalle.IdProducto,
              Cantidad: detalle.Cantidad,
              PrecioUnitario: detalle.PrecioUnitario,
              Subtotal: subtotal,
              IvaUnitario: iva,
              SubtotalConIva: subtotalConIva,
            },
            { transaction: t }
          );

          totalMonto += subtotal;
          totalIva += iva;
        })
      );

      await compra.update(
        {
          TotalMonto: totalMonto,
          TotalIva: totalIva,
          TotalMontoConIva: totalMonto + totalIva,
        },
        { transaction: t }
      );
    }

    await t.commit();
    res.json({ message: "Compra actualizada exitosamente" });

  } catch (error) {
    await t.rollback();
    console.error("❌ Error en updateCompra:", error.message);
    res.status(500).json({ message: "Error actualizando compra", error: error.message });
  }
};
