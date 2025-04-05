module.exports = (sequelize, DataTypes) => {
  const Permiso = sequelize.define(
    "Permiso",
    {
      IdPermiso: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      NombrePermiso: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      Descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      Estado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      FechaCreacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      FechaActualizacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "Permisos",
      timestamps: false,
    }
  );

  return Permiso;
};