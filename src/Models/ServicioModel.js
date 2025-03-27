const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Servicio = sequelize.define("Servicio", {
    IdServicio: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    IdTipoServicio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "TipoServicios",
        key: "IdTipoServicio",
      },
    },
    Nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    Descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "Sin descripción",
    },
    PrecioPequeño: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    PrecioGrande: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    Duracion: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    Foto: {
      type: DataTypes.STRING, // Se almacena la URL de la imagen
      allowNull: true,
    },
  }, {
    tableName: "Servicios",
    timestamps: false,
  });

  return Servicio;
};
