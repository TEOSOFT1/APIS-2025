const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const DetalleVenta = sequelize.define(
    "DetalleVenta",
    {
      IdDetalleVentas: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      IdVenta: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Ventas", key: "IdVenta" },
      },
      IdProducto: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Productos", key: "IdProducto" },
      },
      Cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 },
      },
      PrecioUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 },
      },
      Subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      IvaUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      SubtotalConIva: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      tableName: "DetalleVentas",
      timestamps: false,
    }
  );

  // ✅ Definir relaciones dentro del modelo
  DetalleVenta.associate = (models) => {
    DetalleVenta.belongsTo(models.Venta, { as: "Venta", foreignKey: "IdVenta" });
    DetalleVenta.belongsTo(models.Producto, { as: "Producto", foreignKey: "IdProducto" });
  };

  return DetalleVenta;
};
