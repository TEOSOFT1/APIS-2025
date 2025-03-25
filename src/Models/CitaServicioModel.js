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
        references: {
          model: "AgendamientoDeCitas",
          key: "IdCita",
        },
      },
      IdServicio: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Servicios",
          key: "IdServicio",
        },
      },
    },
    {
      tableName: "Cita_Servicio",
      timestamps: false,
    }
  );

  CitaServicio.associate = (models) => {
    CitaServicio.belongsTo(models.AgendamientoCita, { foreignKey: "IdCita" });
    CitaServicio.belongsTo(models.Servicio, { foreignKey: "IdServicio" });
  };

  return CitaServicio;
};
