module.exports = (sequelize, DataTypes) => {
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
      },
      IdVenta: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      IdMascota: {
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
    },
    {
      tableName: "DetalleVentasServicios",
      timestamps: false,
    }
  );

  return DetalleVentaServicio;
};