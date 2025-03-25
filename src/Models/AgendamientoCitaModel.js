module.exports = (sequelize, DataTypes) => {
  const AgendamientoCita = sequelize.define("AgendamientoCita", {
    IdCita: {
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
    Fecha: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    Estado: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
  }, {
    tableName: "AgendamientoCitas",
    timestamps: false,
  });

  AgendamientoCita.associate = (models) => {
    AgendamientoCita.belongsTo(models.Cliente, { foreignKey: "IdCliente" });
  };

  return AgendamientoCita;
};
