module.exports = (sequelize, DataTypes) => {
  const DetalleCompra = sequelize.define(
    "DetalleCompra",
    {
      IdDetalleCompra: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      IdProducto: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Productos",
          key: "IdProducto",
        },
      },
      IdCompra: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Compras",
          key: "IdCompra",
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
      IvaUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      SubtotalConIva: {
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
