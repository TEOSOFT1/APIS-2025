module.exports = (sequelize, DataTypes) => {
  const Compra = sequelize.define(
    "Compra",
    {
      IdCompra: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      IdProveedor: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      FechaCompra: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      TotalMonto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      TotalIva: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      TotalMontoConIva: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      Estado: {
        type: DataTypes.ENUM('Efectiva', 'Cancelada'),
        allowNull: false,
        defaultValue: 'Efectiva',
      },
    },
    {
      tableName: "Compras",
      timestamps: false,
    }
  );

  return Compra;
};