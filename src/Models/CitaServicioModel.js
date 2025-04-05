module.exports = (sequelize, DataTypes) => {
  const CitaServicio = sequelize.define(
    "CitaServicio",
    {
      IdCitaServicio: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      IdCita: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      IdServicio: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "Cita_Servicio",
      timestamps: false,
    }
  );

  return CitaServicio;
};