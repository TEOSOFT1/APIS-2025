module.exports = (sequelize, DataTypes) => {
  const DetalleCompra = sequelize.define(
    "DetalleCompra",
    {
      IdDetalleCompras: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      IdProducto: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      IdCompra: {
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
      SubtotalConIva: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      IvaUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      tableName: "DetalleCompras",
      timestamps: false,
    }
  );

  return DetalleCompra;
};