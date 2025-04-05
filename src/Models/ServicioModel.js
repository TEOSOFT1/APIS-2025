module.exports = (sequelize, DataTypes) => {
  const Servicio = sequelize.define(
    "Servicio",
    {
      IdServicio: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      IdTipoServicio: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      Foto: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      Descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      Beneficios: {
        type: DataTypes.STRING(300),
        allowNull: false,
        defaultValue: '',
      },
      Que_incluye: {
        type: DataTypes.STRING(300),
        allowNull: false,
        defaultValue: '',
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
    },
    {
      tableName: "Servicios",
      timestamps: false,
    }
  );

  return Servicio;
};