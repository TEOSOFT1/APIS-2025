module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define(
    "Usuario",
    {
      IdUsuario: {
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
      Documento: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      Correo: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      Contraseña: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      Nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      Apellido: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      Telefono: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      Direccion: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      Foto: {
        type: DataTypes.STRING(255),
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
      tableName: "Usuarios",
      timestamps: true,
      createdAt: "FechaCreacion",
      updatedAt: "FechaActualizacion",
    }
  );

  return Usuario;
};
