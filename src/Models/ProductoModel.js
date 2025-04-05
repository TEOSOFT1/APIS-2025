module.exports = (sequelize, DataTypes) => {
  const Producto = sequelize.define(
    "Producto",
    {
      IdProducto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      IdCategoriaDeProducto: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      NombreProducto: {
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
      Stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      Precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      AplicaIVA: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      PorcentajeIVA: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
      },
      FechaVencimiento: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      CodigoBarras: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true,
      },
      Referencia: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true,
      },
      Estado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "Productos",
      timestamps: false,
    }
  );

  return Producto;
};