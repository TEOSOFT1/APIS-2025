module.exports = (sequelize, DataTypes) => {
  const TipoServicio = sequelize.define(
    "TipoServicio",
    {
      IdTipoServicio: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      Nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      Descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      Estado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "TipoServicios", // 🔥 Nombre correcto
      timestamps: false,
    }
  );

  return TipoServicio;
};
