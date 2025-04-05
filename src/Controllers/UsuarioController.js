// src/Controllers/UsuarioController.js
const db = require("../Config/db");
const bcrypt = require("bcrypt");
const { handleError, createError } = require("../Utils/errorHandler");
const { generateToken } = require("../Utils/jwt");

// Función para validar que una contraseña cumpla con los requisitos de seguridad
function validarContraseñaSegura(contraseña) {
  // Mínimo 8 caracteres
  if (contraseña.length < 8) {
    return {
      valida: false,
      mensaje: "La contraseña debe tener al menos 8 caracteres"
    };
  }
  
  // Debe contener al menos una letra
  if (!/[a-zA-Z]/.test(contraseña)) {
    return {
      valida: false,
      mensaje: "La contraseña debe contener al menos una letra"
    };
  }
  
  // Debe contener al menos un número
  if (!/[0-9]/.test(contraseña)) {
    return {
      valida: false,
      mensaje: "La contraseña debe contener al menos un número"
    };
  }
  
  // Debe contener al menos un carácter especial
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(contraseña)) {
    return {
      valida: false,
      mensaje: "La contraseña debe contener al menos un carácter especial"
    };
  }
  
  return { valida: true };
}

// Login de usuario
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

// Crear usuario
exports.createUsuario = async (req, res) => {
  try {
    const { IdRol, Documento, Correo, Contraseña, Nombre, Apellido, Telefono, Direccion } = req.body;

    // Validar campos requeridos
    if (!IdRol || !Documento || !Correo || !Contraseña || !Nombre || !Apellido) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos excepto Telefono y Direccion"
      });
    }

    // Validar que la contraseña sea segura
    const validacionContraseña = validarContraseñaSegura(Contraseña);
    if (!validacionContraseña.valida) {
      return res.status(400).json({
        success: false,
        message: validacionContraseña.mensaje
      });
    }

    // Verificar si ya existe un usuario con ese documento o correo
    const usuarioExistente = await db.Usuario.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { Documento: Documento },
          { Correo: Correo }
        ]
      }
    });

    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: "Ya existe un usuario con ese documento o correo electrónico"
      });
    }

    // Verificar si el rol existe
    const rol = await db.Rol.findByPk(IdRol);
    if (!rol) {
      return res.status(400).json({
        success: false,
        message: "El rol especificado no existe"
      });
    }

    // Encriptar contraseña
    const contraseñaHash = await bcrypt.hash(Contraseña, 10);

    // Crear usuario
    const usuario = await db.Usuario.create({
      IdRol,
      Documento,
      Correo,
      Contraseña: contraseñaHash,
      Nombre,
      Apellido,
      Telefono: Telefono || null,
      Direccion: Direccion || null,
      Estado: true
    });

    // Excluir la contraseña de la respuesta
    const usuarioResponse = {
      IdUsuario: usuario.IdUsuario,
      IdRol: usuario.IdRol,
      Documento: usuario.Documento,
      Correo: usuario.Correo,
      Nombre: usuario.Nombre,
      Apellido: usuario.Apellido,
      Telefono: usuario.Telefono,
      Direccion: usuario.Direccion,
      Estado: usuario.Estado
    };

    res.status(201).json({
      success: true,
      message: "Usuario creado exitosamente",
      data: usuarioResponse
    });
  } catch (error) {
    handleError(error, req, res, "Error al crear usuario");
  }
};

// Obtener todos los usuarios
exports.getAllUsuarios = async (req, res) => {
  try {
    const usuarios = await db.Usuario.findAll({
      attributes: { exclude: ['Contraseña'] },
      include: [{
        model: db.Rol,
        attributes: ['NombreRol']
      }]
    });

    res.status(200).json({
      success: true,
      data: usuarios
    });
  } catch (error) {
    handleError(error, req, res, "Error al obtener usuarios");
  }
};

// Obtener usuario por ID
exports.getUsuarioById = async (req, res) => {
  try {
    const usuario = await db.Usuario.findByPk(req.params.id, {
      attributes: { exclude: ['Contraseña'] },
      include: [{
        model: db.Rol,
        attributes: ['IdRol', 'NombreRol']
      }]
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    res.status(200).json({
      success: true,
      data: usuario
    });
  } catch (error) {
    handleError(error, req, res, "Error al obtener usuario");
  }
};

// Actualizar usuario
exports.updateUsuario = async (req, res) => {
  try {
    const { IdRol, Nombre, Apellido, Telefono, Direccion, Estado } = req.body;

    // Buscar el usuario
    const usuario = await db.Usuario.findByPk(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    // Si se proporciona un nuevo rol, verificar que exista
    if (IdRol) {
      const rol = await db.Rol.findByPk(IdRol);
      if (!rol) {
        return res.status(400).json({
          success: false,
          message: "El rol especificado no existe"
        });
      }
    }

    // Actualizar campos
    await usuario.update({
      IdRol: IdRol || usuario.IdRol,
      Nombre: Nombre || usuario.Nombre,
      Apellido: Apellido || usuario.Apellido,
      Telefono: Telefono !== undefined ? Telefono : usuario.Telefono,
      Direccion: Direccion !== undefined ? Direccion : usuario.Direccion,
      Estado: Estado !== undefined ? Estado : usuario.Estado
    });

    // Excluir la contraseña de la respuesta
    const usuarioResponse = {
      IdUsuario: usuario.IdUsuario,
      IdRol: usuario.IdRol,
      Documento: usuario.Documento,
      Correo: usuario.Correo,
      Nombre: usuario.Nombre,
      Apellido: usuario.Apellido,
      Telefono: usuario.Telefono,
      Direccion: usuario.Direccion,
      Estado: usuario.Estado
    };

    res.status(200).json({
      success: true,
      message: "Usuario actualizado exitosamente",
      data: usuarioResponse
    });
  } catch (error) {
    handleError(error, req, res, "Error al actualizar usuario");
  }
};

// Cambiar contraseña
exports.changePassword = async (req, res) => {
  try {
    const { contraseñaActual, nuevaContraseña } = req.body;
    
    if (!contraseñaActual || !nuevaContraseña) {
      return res.status(400).json({
        success: false,
        message: "Contraseña actual y nueva son requeridas"
      });
    }
    
    // Validar que la nueva contraseña sea segura
    const validacionContraseña = validarContraseñaSegura(nuevaContraseña);
    if (!validacionContraseña.valida) {
      return res.status(400).json({
        success: false,
        message: validacionContraseña.mensaje
      });
    }
    
    // Buscar usuario por ID
    const usuario = await db.Usuario.findByPk(req.user.id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    // Verificar contraseña actual
    const contraseñaValida = await bcrypt.compare(contraseñaActual, usuario.Contraseña);
    if (!contraseñaValida) {
      return res.status(401).json({
        success: false,
        message: "Contraseña actual incorrecta"
      });
    }

    // Encriptar nueva contraseña
    const contraseñaHash = await bcrypt.hash(nuevaContraseña, 10);

    // Actualizar contraseña
    await usuario.update({ Contraseña: contraseñaHash });

    res.status(200).json({
      success: true,
      message: "Contraseña actualizada correctamente"
    });
  } catch (error) {
    handleError(error, req, res, "Error al cambiar contraseña");
  }
};

// Eliminar usuario
exports.deleteUsuario = async (req, res) => {
  try {
    const usuario = await db.Usuario.findByPk(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }
    
    await usuario.destroy();

    res.status(200).json({
      success: true,
      message: "Usuario eliminado exitosamente"
    });
  } catch (error) {
    handleError(error, req, res, "Error al eliminar usuario");
  }
};

// Recuperar contraseña
exports.recoverPassword = async (req, res) => {
  try {
    const { correo } = req.body;

    if (!correo) {
      return res.status(400).json({
        success: false,
        message: "El correo es obligatorio"
      });
    }

    // Buscar usuario por correo
    const usuario = await db.Usuario.findOne({
      where: { Correo: correo }
    });

    if (!usuario) {
      // Por seguridad, no informamos si el correo existe o no
      return res.status(200).json({
        success: true,
        message: "Si el correo existe, se han enviado instrucciones para recuperar la contraseña"
      });
    }

    // Generar nueva contraseña temporal que cumpla con los requisitos
    const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const caracteresEspeciales = "!@#$%^&*(),.?\":{}|<>";
    
    let nuevaContraseña = "";
    
    // Asegurar al menos una letra mayúscula
    nuevaContraseña += caracteres.charAt(Math.floor(Math.random() * 26));
    
    // Asegurar al menos una letra minúscula
    nuevaContraseña += caracteres.charAt(26 + Math.floor(Math.random() * 26));
    
    // Asegurar al menos un número
    nuevaContraseña += caracteres.charAt(52 + Math.floor(Math.random() * 10));
    
    // Asegurar al menos un carácter especial
    nuevaContraseña += caracteresEspeciales.charAt(Math.floor(Math.random() * caracteresEspeciales.length));
    
    // Completar hasta 8 caracteres
    for (let i = nuevaContraseña.length; i < 8; i++) {
      nuevaContraseña += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    
    // Mezclar los caracteres
    nuevaContraseña = nuevaContraseña.split('').sort(() => 0.5 - Math.random()).join('');

    // Encriptar nueva contraseña
    const contraseñaHash = await bcrypt.hash(nuevaContraseña, 10);

    // Actualizar la contraseña del usuario
    await usuario.update({ Contraseña: contraseñaHash });

    // En producción, aquí enviarías el correo con la nueva contraseña
    // mailer.sendPasswordReset(correo, nuevaContraseña);

    res.status(200).json({
      success: true,
      message: "Se ha enviado una nueva contraseña a tu correo",
      // En desarrollo puedes mostrar la contraseña, en producción eliminar esta línea
      nuevaContraseña: process.env.NODE_ENV === 'development' ? nuevaContraseña : undefined
    });
  } catch (error) {
    handleError(error, req, res, "Error al recuperar contraseña");
  }
};

// Obtener perfil del usuario autenticado
exports.getProfile = async (req, res) => {
  try {
    const usuario = await db.Usuario.findByPk(req.user.id, {
      attributes: { exclude: ['Contraseña'] },
      include: [{
        model: db.Rol,
        attributes: ['IdRol', 'NombreRol']
      }]
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    res.status(200).json({
      success: true,
      data: usuario
    });
  } catch (error) {
    handleError(error, req, res, "Error al obtener perfil de usuario");
  }
};

// Esta función es similar a recoverPassword pero puede tener lógica diferente
exports.forgotPassword = async (req, res) => {
  try {
    const { correo } = req.body;

    if (!correo) {
      return res.status(400).json({
        success: false,
        message: "El correo es obligatorio"
      });
    }

    // Buscar usuario por correo
    const usuario = await db.Usuario.findOne({
      where: { Correo: correo }
    });

    if (!usuario) {
      // Por seguridad, no informamos si el correo existe o no
      return res.status(200).json({
        success: true,
        message: "Si el correo existe, se han enviado instrucciones para recuperar la contraseña"
      });
    }

    // Generar nueva contraseña temporal que cumpla con los requisitos
    const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const caracteresEspeciales = "!@#$%^&*(),.?\":{}|<>";
    
    let nuevaContraseña = "";
    
    // Asegurar al menos una letra mayúscula
    nuevaContraseña += caracteres.charAt(Math.floor(Math.random() * 26));
    
    // Asegurar al menos una letra minúscula
    nuevaContraseña += caracteres.charAt(26 + Math.floor(Math.random() * 26));
    
    // Asegurar al menos un número
    nuevaContraseña += caracteres.charAt(52 + Math.floor(Math.random() * 10));
    
    // Asegurar al menos un carácter especial
    nuevaContraseña += caracteresEspeciales.charAt(Math.floor(Math.random() * caracteresEspeciales.length));
    
    // Completar hasta 8 caracteres
    for (let i = nuevaContraseña.length; i < 8; i++) {
      nuevaContraseña += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    
    // Mezclar los caracteres
    nuevaContraseña = nuevaContraseña.split('').sort(() => 0.5 - Math.random()).join('');

    // Encriptar nueva contraseña
    const contraseñaHash = await bcrypt.hash(nuevaContraseña, 10);

    // Actualizar la contraseña del usuario
    await usuario.update({ Contraseña: contraseñaHash });

    // En producción, aquí enviarías el correo con la nueva contraseña
    // mailer.sendPasswordReset(correo, nuevaContraseña);

    res.status(200).json({
      success: true,
      message: "Se ha enviado una nueva contraseña a tu correo",
      // En desarrollo puedes mostrar la contraseña, en producción eliminar esta línea
      nuevaContraseña: process.env.NODE_ENV === 'development' ? nuevaContraseña : undefined
    });
  } catch (error) {
    handleError(error, req, res, "Error al recuperar contraseña");
  }
};