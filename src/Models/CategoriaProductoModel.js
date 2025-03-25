const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  const CategoriaProducto = sequelize.define("CategoriaProducto", {
    IdCategoriaDeProductos: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    NombreCategoria: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    Descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "Sin descripción",
    },
    Estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {
    tableName: "CategoriaDeProductos",
    timestamps: false,
  });
  return CategoriaProducto;
};
