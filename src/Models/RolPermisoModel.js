module.exports = (sequelize, DataTypes) => {
  const RolPermiso = sequelize.define(
    "RolPermiso",
    {
      IdRolPermiso: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      IdRol: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      IdPermiso: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      tableName: "Rol_Permiso",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["IdRol", "IdPermiso"],
        },
      ],
    }
  );

  return RolPermiso;
};