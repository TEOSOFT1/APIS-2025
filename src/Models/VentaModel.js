const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
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
        references: { model: "Clientes", key: "IdCliente" },
      },
      IdUsuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Usuarios", key: "IdUsuario" },
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
      Estado: {
        type: DataTypes.ENUM("Efectiva", "Pendiente", "Cancelada", "Devuelta"),
        allowNull: false,
        defaultValue: "Efectiva",
      },
    },
    {
      tableName: "Ventas",
      timestamps: false,
    }
  );

  // Definir relaciones
  Venta.associate = (models) => {
    Venta.hasMany(models.DetalleVenta, {
      foreignKey: "IdVenta",
      as: "DetallesVenta", // Verifica que el alias coincide en las consultas
    });
    Venta.belongsTo(models.Cliente, {
      foreignKey: "IdCliente",
      as: "Cliente",
    });
    Venta.belongsTo(models.Usuario, {
      foreignKey: "IdUsuario",
      as: "Usuario",
    });
  };

  return Venta;
};
