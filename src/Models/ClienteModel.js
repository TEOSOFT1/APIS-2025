module.exports = (sequelize, DataTypes) => {
  const Cliente = sequelize.define(
    "Cliente",
    {
      IdCliente: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      IdMascota: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      Documento: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      Nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      Apellido: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      Correo: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      Telefono: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      Direccion: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      Estado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "Clientes",
      timestamps: false,
    }
  );

  return Cliente;
};