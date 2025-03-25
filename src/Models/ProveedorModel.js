const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  const Proveedor = sequelize.define("Proveedor", {
    IdProveedor: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    Direccion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    Documento: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    Telefono: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    Correo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    PersonaDeContacto: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    Estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {
    tableName: "Proveedores",
    timestamps: false,
  });
  return Proveedor;
};