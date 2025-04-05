// src/Controllers/AuthController.js
const db = require("../Config/db");
const bcrypt = require("bcrypt");
const { generateToken } = require("../Utils/jwt");
const { handleError } = require("../Utils/errorHandler");

exports.login = async (req, res) => {
  try {
    console.log('🔑 Intento de login con:', req.body);
    
    const { usuario, contraseña } = req.body;

    if (!usuario || !contraseña) {
      console.log('❌ Faltan campos obligatorios');
      return res.status(400).json({
        success: false,
        message: "Usuario y contraseña son obligatorios"
      });
    }

    // Buscar usuario por correo o documento
    console.log('🔍 Buscando usuario:', usuario);
    const user = await db.Usuario.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { Correo: usuario },
          { Documento: usuario }
        ]
      },
      include: [{
        model: db.Rol,
        attributes: ['IdRol', 'NombreRol']
      }]
    });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas"
      });
    }

    console.log('✅ Usuario encontrado:', {
      id: user.IdUsuario,
      correo: user.Correo,
      rol: user.Rol ? user.Rol.NombreRol : 'Sin rol'
    });
    
    // Verificar si la contraseña está encriptada correctamente
    if (!user.Contraseña || !user.Contraseña.startsWith('$2')) {
      console.log('⚠️ La contraseña no está encriptada correctamente');
      
      // Encriptar la contraseña si no lo está
      if (contraseña === user.Contraseña) {
        console.log('✅ Contraseña en texto plano coincide, encriptando...');
        const contraseñaHash = await bcrypt.hash(contraseña, 10);
        await user.update({ Contraseña: contraseñaHash });
        
        // Continuar con el proceso de login
      } else {
        console.log('❌ Contraseña en texto plano no coincide');
        return res.status(401).json({
          success: false,
          message: "Credenciales inválidas"
        });
      }
    } else {
      // Verificar contraseña encriptada
      console.log('🔐 Verificando contraseña encriptada...');
      const contraseñaValida = await bcrypt.compare(contraseña, user.Contraseña);
      
      if (!contraseñaValida) {
        console.log('❌ Contraseña incorrecta');
        return res.status(401).json({
          success: false,
          message: "Credenciales inválidas"
        });
      }
      
      console.log('✅ Contraseña correcta');
    }

    // Generar token
    console.log('🔑 Generando token...');
    const token = generateToken({
      id: user.IdUsuario,
      rol: user.IdRol,
      correo: user.Correo
    });

    console.log('✅ Login exitoso');
    res.status(200).json({
      success: true,
      message: "Inicio de sesión exitoso",
      token,
      usuario: {
        id: user.IdUsuario,
        nombre: user.Nombre,
        apellido: user.Apellido,
        correo: user.Correo,
        rol: user.Rol ? user.Rol.NombreRol : 'Sin rol'
      }
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    handleError(error, req, res, "Error en login de usuario");
  }
};

exports.register = async (req, res) => {
  try {
    const { idRol, documento, correo, contraseña, nombre, apellido, telefono, direccion } = req.body;

    // Validar contraseña fuerte
    if (contraseña.length < 8) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener al menos 8 caracteres"
      });
    }
    
    if (!/[a-zA-Z]/.test(contraseña)) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe contener al menos una letra"
      });
    }
    
    if (!/[0-9]/.test(contraseña)) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe contener al menos un número"
      });
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(contraseña)) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe contener al menos un carácter especial"
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await db.Usuario.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { Correo: correo },
          { Documento: documento }
        ]
      }
    });

    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: "El correo o documento ya está registrado"
      });
    }

    // Crear el usuario
    const nuevoUsuario = await db.Usuario.create({
      IdRol: idRol,
      Documento: documento,
      Correo: correo,
      Contraseña: contraseña, // Se encriptará automáticamente por el hook
      Nombre: nombre,
      Apellido: apellido,
      Telefono: telefono,
      Direccion: direccion,
      Estado: true
    });

    res.status(201).json({
      success: true,
      message: "Usuario registrado correctamente",
      usuario: {
        id: nuevoUsuario.IdUsuario,
        nombre: nuevoUsuario.Nombre,
        apellido: nuevoUsuario.Apellido,
        correo: nuevoUsuario.Correo
      }
    });
  } catch (error) {
    handleError(error, req, res, "Error al registrar usuario");
  }
};