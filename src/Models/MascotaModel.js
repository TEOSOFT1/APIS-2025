module.exports = (sequelize, DataTypes) => {
  const Mascota = sequelize.define(
    "Mascota",
    {
      IdMascota: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      Nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      Foto: {
        type: DataTypes.STRING(255),
        allowNull: true,
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
        type: DataTypes.ENUM('Pequeño', 'Grande'),
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