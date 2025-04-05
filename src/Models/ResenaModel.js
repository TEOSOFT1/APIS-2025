module.exports = (sequelize, DataTypes) => {
  const Resena = sequelize.define(
    "Resena",
    {
      IdReseña: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      IdCliente: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Calificacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      Comentario: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      Foto: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      FechaCreacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      Estado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "Reseñas",
      timestamps: false,
    }
  );

  return Resena;
};