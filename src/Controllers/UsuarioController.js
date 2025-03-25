const db = require("../Config/db")
const Usuario = db.Usuario
const Rol = db.Rol
const jwt = require("jsonwebtoken")
const { Op } = db.Sequelize
const { handleError, createError } = require("../Utils/errorHandler")
const { validateRequiredFields, isValidEmail } = require("../Utils/ValidationUtils")
const { formatFullName } = require("../Utils/FormatUtils")
const { generateToken } = require("../Utils/jwtUtils")

// Generar token JWT
const generarToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.IdUsuario,
      rol: usuario.IdRol,
      correo: usuario.Correo,
    },
    process.env.JWT_SECRET || "secreto",
    { expiresIn: "24h" },
  )
}

// Obtener perfil del usuario actual
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("ID de usuario desde token:", userId);

    const usuario = await Usuario.findByPk(userId, {
      include: [
        {
          model: Rol,
          attributes: ["IdRol", "NombreRol"],
        },
      ],
      attributes: { exclude: ["Contraseña"] },
    });

    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    res.status(200).json(usuario);
  } catch (error) {
    console.error("Error en getProfile:", error);
    handleError(error, req, res, "Error al obtener el perfil del usuario");
  }
};
// Iniciar sesión
exports.login = async (req, res) => {
  try {
    const { usuario, contraseña } = req.body

    // Validar campos obligatorios
    if (!usuario || !contraseña) {
      return res.status(400).json({
        message: "Usuario y contraseña son obligatorios",
      })
    }

    // Buscar usuario por correo o documento
    const usuarioEncontrado = await Usuario.findOne({
      where: {
        [Op.or]: [{ Correo: usuario }, { Documento: usuario }],
      },
      include: [
        {
          model: Rol,
          attributes: ["IdRol", "NombreRol"],
        },
      ],
    })

    if (!usuarioEncontrado) {
      return res.status(401).json({
        message: "Credenciales inválidas",
      })
    }

    if (!usuarioEncontrado.Estado) {
      return res.status(401).json({
        message: "Usuario desactivado. Contacte al administrador",
      })
    }

    // Si tienes un método comparePassword implementado, úsalo
    // De lo contrario, compara directamente
    let contraseñaValida = false;
    if (typeof usuarioEncontrado.comparePassword === 'function') {
      contraseñaValida = await usuarioEncontrado.comparePassword(contraseña);
    } else {
      contraseñaValida = usuarioEncontrado.Contraseña === contraseña;
    }

    if (!contraseñaValida) {
      return res.status(401).json({
        message: "Credenciales inválidas",
      })
    }

    const token = generarToken(usuarioEncontrado)

    res.status(200).json({
      message: "Inicio de sesión exitoso",
      token,
      usuario: {
        id: usuarioEncontrado.IdUsuario,
        nombre: usuarioEncontrado.Nombre,
        apellido: usuarioEncontrado.Apellido,
        correo: usuarioEncontrado.Correo,
        documento: usuarioEncontrado.Documento,
        rol: usuarioEncontrado.Rol ? usuarioEncontrado.Rol.NombreRol : null,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: "Error al iniciar sesión",
      error: error.message,
    })
  }
}

// Obtener todos los usuarios
exports.getAllUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      include: [
        {
          model: Rol,
          attributes: ["IdRol", "NombreRol"],
        },
      ],
      attributes: { exclude: ["Contraseña"] },
    })
    res.status(200).json(usuarios)
  } catch (error) {
    handleError(error, req, res, "Error al obtener los usuarios")
  }
}

// Obtener perfil del usuario actual
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id

    const usuario = await Usuario.findByPk(userId, {
      include: [
        {
          model: Rol,
          attributes: ["IdRol", "NombreRol"],
        },
      ],
      attributes: { exclude: ["Contraseña"] },
    })

    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      })
    }

    res.status(200).json(usuario)
  } catch (error) {
    handleError(error, req, res, "Error al obtener el perfil del usuario")
  }
}

// Buscar usuarios
exports.searchUsuarios = async (req, res) => {
  try {
    const { query } = req.query

    if (!query) {
      return res.status(400).json({
        message: "Se requiere un término de búsqueda",
      })
    }

    const usuarios = await Usuario.findAll({
      where: {
        [Op.or]: [
          { Nombre: { [Op.like]: `%${query}%` } },
          { Apellido: { [Op.like]: `%${query}%` } },
          { Correo: { [Op.like]: `%${query}%` } },
          { Documento: { [Op.like]: `%${query}%` } },
        ],
      },
      include: [
        {
          model: Rol,
          attributes: ["IdRol", "NombreRol"],
        },
      ],
      attributes: { exclude: ["Contraseña"] },
    })

    res.status(200).json(usuarios)
  } catch (error) {
    handleError(error, req, res, "Error al buscar usuarios")
  }
}

// Obtener usuario por ID
exports.getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params

    const usuario = await Usuario.findByPk(id, {
      include: [
        {
          model: Rol,
          attributes: ["IdRol", "NombreRol"],
        },
      ],
      attributes: { exclude: ["Contraseña"] },
    })

    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      })
    }

    res.status(200).json(usuario)
  } catch (error) {
    handleError(error, req, res, "Error al obtener el usuario")
  }
}

// Crear un nuevo usuario
exports.createUsuario = async (req, res) => {
  try {
    const { IdRol, Nombre, Apellido, Correo, Telefono, Direccion, Documento, Contraseña, Estado } = req.body

    // Validar campos requeridos
    const requiredFields = ["IdRol", "Nombre", "Apellido", "Correo", "Telefono", "Direccion", "Documento", "Contraseña"]
    const validation = validateRequiredFields(req.body, requiredFields)

    if (!validation.valid) {
      return res.status(400).json({
        message: "Campos requeridos faltantes",
        fields: validation.missingFields,
      })
    }

    // Validar correo electrónico
    if (!isValidEmail(Correo)) {
      return res.status(400).json({
        message: "El formato del correo electrónico no es válido",
      })
    }

    const rolExiste = await Rol.findByPk(IdRol)
    if (!rolExiste) {
      return res.status(404).json({
        message: "El rol especificado no existe",
      })
    }

    const usuarioExistente = await Usuario.findOne({
      where: {
        [Op.or]: [{ Correo }, { Documento }],
      },
    })

    if (usuarioExistente) {
      return res.status(400).json({
        message: "Ya existe un usuario con el mismo correo o documento",
      })
    }

    const nuevoUsuario = await Usuario.create({
      IdRol,
      Nombre,
      Apellido,
      Correo,
      Telefono,
      Direccion,
      Documento,
      Contraseña,
      Estado: Estado !== undefined ? Estado : true,
    })

    const usuarioCreado = await Usuario.findByPk(nuevoUsuario.IdUsuario, {
      attributes: { exclude: ["Contraseña"] },
      include: [
        {
          model: Rol,
          attributes: ["IdRol", "NombreRol"],
        },
      ],
    })

    res.status(201).json({
      message: "Usuario creado exitosamente",
      data: usuarioCreado,
    })
  } catch (error) {
    handleError(error, req, res, "Error al crear el usuario")
  }
}

// Actualizar un usuario
exports.updateUsuario = async (req, res) => {
  try {
    const { id } = req.params
    const { IdRol, Nombre, Apellido, Correo, Telefono, Direccion, Documento, Estado } = req.body

    const usuario = await Usuario.findByPk(id)

    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      })
    }

    if (IdRol) {
      const rolExiste = await Rol.findByPk(IdRol)
      if (!rolExiste) {
        return res.status(404).json({
          message: "El rol especificado no existe",
        })
      }
    }

    if (Correo || Documento) {
      const usuarioExistente = await Usuario.findOne({
        where: {
          [Op.or]: [Correo ? { Correo } : null, Documento ? { Documento } : null].filter(Boolean),
          IdUsuario: { [Op.ne]: id },
        },
      })

      if (usuarioExistente) {
        return res.status(400).json({
          message: "Ya existe otro usuario con el mismo correo o documento",
        })
      }
    }

    await usuario.update({
      IdRol: IdRol || usuario.IdRol,
      Nombre: Nombre || usuario.Nombre,
      Apellido: Apellido || usuario.Apellido,
      Correo: Correo || usuario.Correo,
      Telefono: Telefono || usuario.Telefono,
      Direccion: Direccion || usuario.Direccion,
      Documento: Documento || usuario.Documento,
      Estado: Estado !== undefined ? Estado : usuario.Estado,
    })

    res.status(200).json({
      message: "Usuario actualizado exitosamente",
    })
  } catch (error) {
    handleError(error, req, res, "Error al actualizar el usuario")
  }
}

// Cambiar estado del usuario (activar/desactivar)
exports.toggleUsuarioStatus = async (req, res) => {
  try {
    const { id } = req.params
    const usuario = await Usuario.findByPk(id)

    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      })
    }

    await usuario.update({
      Estado: !usuario.Estado,
    })

    res.status(200).json({
      message: `Usuario ${usuario.Estado ? "activado" : "desactivado"} exitosamente`,
      estado: usuario.Estado,
    })
  } catch (error) {
    handleError(error, req, res, "Error al cambiar el estado del usuario")
  }
}

// Cambiar contraseña
exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params
    const { contraseñaActual, nuevaContraseña } = req.body

    // Validar que se proporcionaron ambas contraseñas
    if (!contraseñaActual || !nuevaContraseña) {
      return res.status(400).json({
        message: "La contraseña actual y la nueva contraseña son requeridas",
      })
    }

    const usuario = await Usuario.findByPk(id)

    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      })
    }

    // Verificar que el usuario que hace la solicitud sea el mismo usuario o un administrador
    if (req.user.id !== Number.parseInt(id) && req.user.rol !== 1) {
      return res.status(403).json({
        message: "No tienes permiso para cambiar la contraseña de este usuario",
      })
    }

    // Verificar la contraseña actual
    let contraseñaValida = false;
    if (typeof usuario.comparePassword === 'function') {
      contraseñaValida = await usuario.comparePassword(contraseñaActual);
    } else {
      contraseñaValida = usuario.Contraseña === contraseñaActual;
    }
    
    if (!contraseñaValida) {
      return res.status(401).json({
        message: "La contraseña actual es incorrecta",
      })
    }

    // Actualizar la contraseña
    await usuario.update({
      Contraseña: nuevaContraseña,
    })

    res.status(200).json({
      message: "Contraseña actualizada exitosamente",
    })
  } catch (error) {
    handleError(error, req, res, "Error al cambiar la contraseña")
  }
}

// Eliminar un usuario
exports.deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params
    const usuario = await Usuario.findByPk(id)

    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      })
    }

    await usuario.destroy()
    res.status(200).json({
      message: "Usuario eliminado exitosamente",
    })
  } catch (error) {
    handleError(error, req, res, "Error al eliminar el usuario")
  }
}

// Cerrar sesión
exports.logout = (req, res) => {
  try {
    // En el caso de JWT, no es necesario hacer nada para cerrar sesión en el backend,
    // solo eliminar el token del cliente.
    res.status(200).json({
      message: "Sesión cerrada exitosamente",
    })
  } catch (error) {
    handleError(error, req, res, "Error al cerrar sesión")
  }
}

// Recuperar contraseña (Enviar correo con nueva contraseña temporal)
exports.recoverPassword = async (req, res) => {
  try {
    const { correo } = req.body

    if (!correo) {
      return res.status(400).json({
        message: "El correo es obligatorio",
      })
    }

    const usuario = await Usuario.findOne({ where: { Correo: correo } })
    if (!usuario) {
      return res.status(404).json({
        message: "No se encontró un usuario con ese correo",
      })
    }

    // Generar nueva contraseña temporal
    const nuevaContraseña = Math.random().toString(36).slice(-8) // Generar una contraseña aleatoria de 8 caracteres

    // Actualizar la contraseña del usuario
    await usuario.update({ Contraseña: nuevaContraseña })

    // Enviar correo con la nueva contraseña (suponiendo que tienes configurado un sistema de correos)
    // Aquí puedes integrar tu servicio de envío de correos

    res.status(200).json({
      message: "Nueva contraseña generada y enviada por correo",
      nuevaContraseña,
    })
  } catch (error) {
    handleError(error, req, res, "Error al recuperar la contraseña")
  }
}

// Olvidar contraseña (Por ejemplo, recibir un enlace para restablecer la contraseña)
exports.forgotPassword = async (req, res) => {
  try {
    const { correo } = req.body

    if (!correo) {
      return res.status(400).json({
        message: "El correo es obligatorio",
      })
    }

    const usuario = await Usuario.findOne({ where: { Correo: correo } })
    if (!usuario) {
      return res.status(404).json({
        message: "No se encontró un usuario con ese correo",
      })
    }

    // Enviar enlace de recuperación de contraseña por correo (implementarlo según tu lógica)
    // Aquí puedes enviar un enlace único para que el usuario restablezca su contraseña.

    res.status(200).json({
      message: "Enlace de recuperación de contraseña enviado por correo",
    })
  } catch (error) {
    handleError(error, req, res, "Error al enviar el enlace de recuperación")
  }
}