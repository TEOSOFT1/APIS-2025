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
        references: {
          model: "Roles",
          key: "IdRol",
        },
      },
      IdPermiso: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Permisos",
          key: "IdPermiso",
        },
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
      timestamps: true, // Habilita el manejo automático de timestamps
      createdAt: "FechaCreacion", // Asocia el campo createdAt con FechaCreacion
      updatedAt: "FechaActualizacion", // Asocia el campo updatedAt con FechaActualizacion
    }
  );

  return RolPermiso;
};