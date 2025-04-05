module.exports = (sequelize, DataTypes) => {
  const AgendamientoCita = sequelize.define(
    "AgendamientoCita",
    {
      IdCita: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      IdCliente: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      IdMascota: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Fecha: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      Estado: {
        type: DataTypes.ENUM('Programada', 'Completada', 'Cancelada'),
        allowNull: false,
        defaultValue: 'Programada',
      },
    },
    {
      tableName: "AgendamientoDeCitas",
      timestamps: false,
    }
  );

  return AgendamientoCita;
};