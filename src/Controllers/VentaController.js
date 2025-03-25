const { Op } = require("sequelize");
const db = require("../Config/db");
const { Venta, DetalleVenta, Cliente, Usuario, Producto } = db;
const sequelize = db.sequelize;

exports.getAllVentas = async (req, res) => {
    try {
        const ventas = await Venta.findAll({
            include: [
                { model: Cliente, attributes: ["Nombre", "Apellido"] },
                { model: Usuario, attributes: ["Nombre", "Apellido"] }
            ],
            order: [["FechaVenta", "DESC"]]
        });
        res.json(ventas);
    } catch (error) {
        res.status(500).json({ message: "Error obteniendo ventas", error: error.message });
    }
};

exports.getVentaById = async (req, res) => {
    try {
        const { id } = req.params;
        const venta = await Venta.findByPk(id, {
            include: [
                { model: Cliente, attributes: ["Nombre", "Apellido"] },
                { model: Usuario, attributes: ["Nombre", "Apellido"] },
                { 
                    model: DetalleVenta, 
                    as: "DetallesVenta",  // 🔹 Alias correcto según db.js
                    include: [{ model: Producto, as: "Producto", attributes: ["NombreProducto"] }]

                }
            ]
        });

        if (!venta) {
            return res.status(404).json({ message: "Venta no encontrada" });
        }

        res.json(venta);
    } catch (error) {
        res.status(500).json({ message: "Error obteniendo venta", error: error.message });
    }
};


exports.createVenta = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { IdCliente, IdUsuario, FechaVenta, Subtotal, TotalIva, TotalMonto, DetallesVenta } = req.body;
        
        const nuevaVenta = await Venta.create(
            { IdCliente, IdUsuario, FechaVenta, Subtotal, TotalIva, TotalMonto, Estado: "Efectiva" },
            { transaction }
        );

        for (let detalle of DetallesVenta) {
            let subtotal = detalle.Cantidad * detalle.PrecioUnitario;
            let subtotalConIva = subtotal + (subtotal * 0.18); // Suponiendo 18% de IVA
        
            await DetalleVenta.create(
                { 
                    IdVenta: nuevaVenta.IdVenta, 
                    IdProducto: detalle.IdProducto, 
                    Cantidad: detalle.Cantidad, 
                    PrecioUnitario: detalle.PrecioUnitario, 
                    Subtotal: subtotal, 
                    IvaUnitario: subtotal * 0.18, 
                    SubtotalConIva: subtotalConIva
                },
                { transaction }
            );
        
            await Producto.decrement("Stock", { 
                by: detalle.Cantidad, 
                where: { IdProducto: detalle.IdProducto }, 
                transaction 
            });
        }
        

        await transaction.commit();
        res.status(201).json(nuevaVenta);
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: "Error creando la venta", error: error.message });
    }
};

exports.updateVenta = async (req, res) => {
    try {
        const { id } = req.params;
        const { IdCliente, IdUsuario, FechaVenta, Subtotal, TotalIva, TotalMonto, Estado } = req.body;
        
        const venta = await Venta.findByPk(id);
        if (!venta) return res.status(404).json({ message: "Venta no encontrada" });

        await venta.update({ IdCliente, IdUsuario, FechaVenta, Subtotal, TotalIva, TotalMonto, Estado });

        res.json({ message: "Venta actualizada exitosamente", venta });
    } catch (error) {
        res.status(500).json({ message: "Error actualizando la venta", error: error.message });
    }
};

exports.devolverVenta = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const venta = await Venta.findByPk(id, {
            include: [{ 
                model: DetalleVenta, 
                as: "DetallesVenta", 
                include: [{ model: Producto, as: "Producto" }] // Alias corregido
            }],
        });

        if (!venta) return res.status(404).json({ message: "Venta no encontrada" });

        await Promise.all(
            venta.DetallesVenta.map(async (detalle) => {
                await Producto.increment("Stock", { 
                    by: detalle.Cantidad, 
                    where: { IdProducto: detalle.IdProducto }, 
                    transaction 
                });
            })
        );

        await venta.update({ Estado: "Devuelta" }, { transaction });
        await transaction.commit();
        res.json({ message: "Venta devuelta exitosamente" });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: "Error en la devolución", error: error.message });
    }
};

exports.anularVenta = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const venta = await Venta.findByPk(id, {
            include: [{ 
                model: DetalleVenta, 
                as: "DetallesVenta", 
                include: [{ model: Producto, as: "Producto" }] // Alias corregido
            }],
        });

        if (!venta) return res.status(404).json({ message: "Venta no encontrada" });

        await Promise.all(
            venta.DetallesVenta.map(async (detalle) => {
                await Producto.increment("Stock", { 
                    by: detalle.Cantidad, 
                    where: { IdProducto: detalle.IdProducto }, 
                    transaction 
                });
            })
        );

        await venta.update({ Estado: "Cancelada" }, { transaction }); // Cambio de "Anulada" a "Cancelada"
        await transaction.commit();
        res.json({ message: "Venta anulada exitosamente" });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: "Error al anular la venta", error: error.message });
    }
};

module.exports = exports;
