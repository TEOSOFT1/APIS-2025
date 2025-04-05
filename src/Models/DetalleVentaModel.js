module.exports = (sequelize, DataTypes) => {
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
      },
      IdProducto: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
  DetalleVenta.associate = function(models) {
    DetalleVenta.belongsTo(models.Venta, { foreignKey: 'IdVenta' });
    DetalleVenta.belongsTo(models.Producto, { as: 'Producto', foreignKey: 'IdProducto' });
  };

  return DetalleVenta;
};