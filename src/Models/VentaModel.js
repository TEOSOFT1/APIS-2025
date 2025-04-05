module.exports = (sequelize, DataTypes) => {
  const Venta = sequelize.define(
    "Venta",
    {
      IdVenta: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      IdCliente: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      IdUsuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      FechaVenta: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      Subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      TotalIva: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      TotalMonto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      NotasAdicionales: {
        type: DataTypes.STRING(300),
        allowNull: false,
        defaultValue: "",
      },
      ComprobantePago: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "",
      },
      Estado: {
        type: DataTypes.ENUM("Efectiva", "Pendiente", "Cancelada", "Devuelta"),
        allowNull: false,
        defaultValue: "Efectiva",
      },
      Tipo: {
        type: DataTypes.ENUM("Venta", "Devolucion"),
        allowNull: false,
        defaultValue: "Venta",
      },
      IdVentaOriginal: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "Ventas",
      timestamps: false,
    },
  )

  Venta.associate = (models) => {
    Venta.belongsTo(models.Cliente, { foreignKey: "IdCliente" })
    Venta.belongsTo(models.Usuario, { foreignKey: "IdUsuario" })
    Venta.hasMany(models.DetalleVenta, { as: "DetallesVenta", foreignKey: "IdVenta" })
    Venta.hasMany(models.DetalleVentaServicio, { as: "DetallesVentaServicio", foreignKey: "IdVenta" })
  }
  return Venta
}

