module.exports = (sequelize, DataTypes) => {
  const Cliente = sequelize.define("Cliente", {
    IdCliente: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    Correo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    }
  }, {
    tableName: "Clientes",
    timestamps: false,
  });

  Cliente.associate = (models) => {
    Cliente.hasMany(models.AgendamientoCita, { foreignKey: "IdCliente" });
  };

  return Cliente;
};