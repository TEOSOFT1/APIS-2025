const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const DetalleVentaServicio = sequelize.define(
    "DetalleVentaServicio",
    {
      IdDetalleVentasServicios: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      IdServicio: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Servicios",
          key: "IdServicio",
        },
      },
      IdVenta: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Ventas",
          key: "IdVenta",
        },
      },
      IdMascota: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Mascotas",
          key: "IdMascota",
        },
      },
      Cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      PrecioUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      Subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      tableName: "DetalleVentasServicios",
      timestamps: false,
    },
  );

  return DetalleVentaServicio;
};
