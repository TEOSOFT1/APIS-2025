// src/Models/UsuarioModel.js
const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define("Usuario", {
    IdUsuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    IdRol: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Documento: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    Correo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    Contraseña: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        // Esta validación solo aplica para contraseñas no encriptadas
        isStrongPassword(value) {
          // Si ya está encriptada (comienza con $2), no validar
          if (value.startsWith('$2')) return;
          
          // Validar que tenga al menos 8 caracteres
          if (value.length < 8) {
            throw new Error('La contraseña debe tener al menos 8 caracteres');
          }
          
          // Validar que tenga al menos una letra
          if (!/[a-zA-Z]/.test(value)) {
            throw new Error('La contraseña debe contener al menos una letra');
          }
          
          // Validar que tenga al menos un número
          if (!/[0-9]/.test(value)) {
            throw new Error('La contraseña debe contener al menos un número');
          }
          
          // Validar que tenga al menos un carácter especial
          if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
            throw new Error('La contraseña debe contener al menos un carácter especial');
          }
        }
      }
    },
    Nombre: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    Apellido: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    Telefono: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    Direccion: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    Estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: "Usuarios",
    timestamps: false,
    hooks: {
      beforeCreate: async (usuario) => {
        if (usuario.Contraseña && !usuario.Contraseña.startsWith('$2')) {
          usuario.Contraseña = await bcrypt.hash(usuario.Contraseña, 10);
        }
      },
      beforeUpdate: async (usuario) => {
        if (usuario.changed('Contraseña') && usuario.Contraseña && !usuario.Contraseña.startsWith('$2')) {
          usuario.Contraseña = await bcrypt.hash(usuario.Contraseña, 10);
        }
      }
    }
  });

  // Método para validar contraseña
  Usuario.prototype.validarContraseña = async function(contraseñaIngresada) {
    return await bcrypt.compare(contraseñaIngresada, this.Contraseña);
  };

  return Usuario;
};