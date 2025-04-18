module.exports = (sequelize, DataTypes) => {
  const NotificacionProducto = sequelize.define(
    "NotificacionProducto",
    {
      IdNotificacion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      IdProducto: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      FechaNotificacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      TipoNotificacion: {
        type: DataTypes.ENUM('Vencimiento', 'StockBajo'),
        allowNull: false,
      },
      Mensaje: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      Estado: {
        type: DataTypes.ENUM('Pendiente', 'Vista', 'Resuelta'),
        allowNull: false,
        defaultValue: 'Pendiente',
      },
    },
    {
      tableName: "Notificaciones_Productos",
      timestamps: false,
    }
  );

  return NotificacionProducto;
};