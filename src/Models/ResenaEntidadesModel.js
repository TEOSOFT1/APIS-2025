module.exports = (sequelize, DataTypes) => {
    const ResenaEntidad = sequelize.define(
      "ResenaEntidad",
      {
        IdReseñaEntidad: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        IdReseña: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        IdProducto: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        IdServicio: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        TipoReseña: {
          type: DataTypes.ENUM('producto', 'servicio', 'general'),
          allowNull: false,
        },
      },
      {
        tableName: "Reseñas_Entidades",
        timestamps: false,
      }
    );
  
    // Definir las asociaciones cuando se inicialice el modelo
    ResenaEntidad.associate = (models) => {
      // Relación con Reseña
      ResenaEntidad.belongsTo(models.Resena, {
        foreignKey: "IdReseña",
        onDelete: "CASCADE",
      });
  
      // Relación con Producto (opcional)
      ResenaEntidad.belongsTo(models.Producto, {
        foreignKey: "IdProducto",
        onDelete: "CASCADE",
      });
  
      // Relación con Servicio (opcional)
      ResenaEntidad.belongsTo(models.Servicio, {
        foreignKey: "IdServicio",
        onDelete: "CASCADE",
      });
    };
  
    return ResenaEntidad;
  };