const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Mascota = sequelize.define(
    "Mascota",
    {
      IdMascota: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      IdCliente: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Clientes",
          key: "IdCliente",
        },
      },
      Nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      Especie: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      Raza: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      Tamaño: {
        type: DataTypes.ENUM("Pequeño", "Grande"),
        allowNull: false,
      },
      FechaNacimiento: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    },
    {
      tableName: "Mascotas",
      timestamps: false,
    }
  );

  return Mascota;
};