// src/Controllers/ClienteController.js
const db = require("../Config/db");
const bcrypt = require("bcrypt");
const { handleError, createError } = require("../Utils/errorHandler");
const { generateToken } = require("../Utils/jwt");

// Crear cliente físico (no requiere autenticación)
exports.createClienteFisico = async (req, res) => {
  try {
    const { Documento, Nombre, Apellido, Correo, Telefono, Direccion, IdMascota } = req.body;

    // Validar campos requeridos
    if (!Documento || !Nombre || !Apellido || !Correo || !Telefono || !Direccion) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos excepto IdMascota"
      });
    }

    // Verificar si ya existe un cliente con ese documento o correo
    const clienteExistente = await db.Cliente.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { Documento: Documento },
          { Correo: Correo }
        ]
      }
    });

    if (clienteExistente) {
      return res.status(400).json({
        success: false,
        message: "Ya existe un cliente con ese documento o correo electrónico"
      });
    }

    // Crear cliente físico
    const cliente = await db.Cliente.create({
      Documento,
      Nombre,
      Apellido,
      Correo,
      Telefono,
      Direccion,
      IdMascota: IdMascota || null
    });

    res.status(201).json({
      success: true,
      data: cliente
    });

  } catch (error) {
    handleError(error, req, res, "Error al crear cliente físico");
  }
};

// Crear cliente virtual (requiere autenticación)
exports.createClienteVirtual = async (req, res) => {
  try {
    const { Documento, Nombre, Apellido, Correo, Telefono, Direccion, IdMascota } = req.body;

    // Validar campos requeridos
    if (!Documento || !Nombre || !Apellido || !Correo || !Telefono || !Direccion) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos excepto IdMascota"
      });
    }

    // Verificar si ya existe un cliente con ese documento o correo
    const clienteExistente = await db.Cliente.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { Documento: Documento },
          { Correo: Correo }
        ]
      }
    });

    if (clienteExistente) {
      return res.status(400).json({
        success: false,
        message: "Ya existe un cliente con ese documento o correo electrónico"
      });
    }

    // Crear cliente virtual
    const cliente = await db.Cliente.create({
      Documento,
      Nombre,
      Apellido,
      Correo,
      Telefono,
      Direccion,
      IdMascota: IdMascota || null
    });

    res.status(201).json({
      success: true,
      data: cliente
    });

  } catch (error) {
    handleError(error, req, res, "Error al crear cliente virtual");
  }
};

// Obtener todos los clientes
exports.getAllClientes = async (req, res) => {
  try {
    const clientes = await db.Cliente.findAll({
      include: [
        {
          model: db.Mascota,
          as: 'Mascota',
          required: false
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: clientes
    });
  } catch (error) {
    handleError(error, req, res, "Error al obtener clientes");
  }
};

// Obtener cliente por ID
exports.getClienteById = async (req, res) => {
  try {
    const cliente = await db.Cliente.findByPk(req.params.id, {
      include: [
        {
          model: db.Mascota,
          as: 'Mascota',
          required: false
        }
      ]
    });

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado"
      });
    }

    res.status(200).json({
      success: true,
      data: cliente
    });
  } catch (error) {
    handleError(error, req, res, "Error al obtener cliente");
  }
};

// Actualizar cliente
exports.updateCliente = async (req, res) => {
  try {
    const { Nombre, Apellido, Correo, Telefono, Direccion, IdMascota, Estado } = req.body;

    // Buscar el cliente
    const cliente = await db.Cliente.findByPk(req.params.id);
    
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado"
      });
    }

    // Actualizar campos
    await cliente.update({
      Nombre: Nombre || cliente.Nombre,
      Apellido: Apellido || cliente.Apellido,
      Correo: Correo || cliente.Correo,
      Telefono: Telefono || cliente.Telefono,
      Direccion: Direccion || cliente.Direccion,
      IdMascota: IdMascota !== undefined ? IdMascota : cliente.IdMascota,
      Estado: Estado !== undefined ? Estado : cliente.Estado
    });

    res.status(200).json({
      success: true,
      data: cliente
    });
  } catch (error) {
    handleError(error, req, res, "Error al actualizar cliente");
  }
};

// Actualizar cliente físico
exports.updateClienteFisico = async (req, res) => {
  try {
    const { Nombre, Apellido, Correo, Telefono, Direccion, IdMascota, Estado } = req.body;

    const cliente = await db.Cliente.findByPk(req.params.id);

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: "Cliente físico no encontrado"
      });
    }

    await cliente.update({
      Nombre: Nombre || cliente.Nombre,
      Apellido: Apellido || cliente.Apellido,
      Correo: Correo || cliente.Correo,
      Telefono: Telefono || cliente.Telefono,
      Direccion: Direccion || cliente.Direccion,
      IdMascota: IdMascota !== undefined ? IdMascota : cliente.IdMascota,
      Estado: Estado !== undefined ? Estado : cliente.Estado
    });

    res.status(200).json({
      success: true,
      data: cliente
    });
  } catch (error) {
    handleError(error, req, res, "Error al actualizar cliente físico");
  }
};

// Eliminar cliente físico
exports.deleteClienteFisico = async (req, res) => {
  try {
    const cliente = await db.Cliente.findByPk(req.params.id);
    
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: "Cliente físico no encontrado"
      });
    }
    
    await cliente.destroy();

    res.status(200).json({
      success: true,
      message: "Cliente físico eliminado correctamente"
    });
  } catch (error) {
    handleError(error, req, res, "Error al eliminar cliente físico");
  }
};

// Eliminar cliente
exports.deleteCliente = async (req, res) => {
  try {
    const cliente = await db.Cliente.findByPk(req.params.id);
    
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado"
      });
    }
    
    await cliente.destroy();

    res.status(200).json({
      success: true,
      message: "Cliente eliminado correctamente"
    });
  } catch (error) {
    handleError(error, req, res, "Error al eliminar cliente");
  }
};

// Buscar clientes
exports.searchClientes = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Término de búsqueda requerido"
      });
    }
    
    const clientes = await db.Cliente.findAll({
      where: {
        [db.Sequelize.Op.or]: [
          { Nombre: { [db.Sequelize.Op.like]: `%${query}%` } },
          { Apellido: { [db.Sequelize.Op.like]: `%${query}%` } },
          { Correo: { [db.Sequelize.Op.like]: `%${query}%` } },
          { Documento: { [db.Sequelize.Op.like]: `%${query}%` } }
        ]
      },
      include: [
        {
          model: db.Mascota,
          as: 'Mascota',
          required: false
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: clientes
    });
  } catch (error) {
    handleError(error, req, res, "Error en búsqueda de clientes");
  }
};

// ===== MÉTODOS PARA AUTENTICACIÓN DE CLIENTES =====

// Registro de cliente
exports.registrarCliente = async (req, res) => {
  try {
    const { Documento, Nombre, Apellido, Correo, Contraseña, Telefono, Direccion, IdMascota } = req.body;

    // Validar campos requeridos
    if (!Documento || !Nombre || !Apellido || !Correo || !Contraseña || !Telefono || !Direccion) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos excepto IdMascota"
      });
    }

    // Verificar si ya existe un cliente con ese documento o correo
    const clienteExistente = await db.Cliente.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { Documento: Documento },
          { Correo: Correo }
        ]
      }
    });

    // Verificar si ya existe un usuario con ese documento o correo
    const usuarioExistente = await db.Usuario.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { Documento: Documento },
          { Correo: Correo }
        ]
      }
    });

    if (clienteExistente || usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: "Ya existe un cliente o usuario con ese documento o correo electrónico"
      });
    }

    // Buscar el rol de Cliente
    const rolCliente = await db.Rol.findOne({
      where: { NombreRol: "Cliente" }
    });

    if (!rolCliente) {
      return res.status(500).json({
        success: false,
        message: "No se encontró el rol de Cliente en el sistema"
      });
    }

    // Encriptar contraseña
    const contraseñaHash = await bcrypt.hash(Contraseña, 10);

    // Iniciar transacción
    const transaction = await db.sequelize.transaction();

    try {
      // Crear usuario con rol de cliente
      const nuevoUsuario = await db.Usuario.create({
        IdRol: rolCliente.IdRol,
        Documento,
        Correo,
        Contraseña: contraseñaHash,
        Nombre,
        Apellido,
        Telefono,
        Direccion,
        Estado: true
      }, { transaction });

      // Crear cliente
      const nuevoCliente = await db.Cliente.create({
        Documento,
        Nombre,
        Apellido,
        Correo,
        Telefono,
        Direccion,
        IdMascota: IdMascota || null,
        Estado: true
      }, { transaction });

      // Confirmar transacción
      await transaction.commit();

      // Generar token
        const token = generateToken({
          id: user.IdUsuario,
          rol: user.IdRol,
          correo: user.Correo,
          idCliente: cliente.IdCliente  // Asegúrate de que sea 'idCliente' (minúscula)
        });

      res.status(201).json({
        success: true,
        message: "Cliente registrado exitosamente",
        token,
        cliente: {
          id: nuevoCliente.IdCliente,
          nombre: nuevoCliente.Nombre,
          apellido: nuevoCliente.Apellido,
          correo: nuevoCliente.Correo
        }
      });
    } catch (error) {
      // Revertir transacción en caso de error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    handleError(error, req, res, "Error al registrar cliente");
  }
};

// Login de cliente
exports.loginCliente = async (req, res) => {
  try {
    const { usuario, contraseña } = req.body;

    if (!usuario || !contraseña) {
      return res.status(400).json({
        success: false,
        message: "Usuario y contraseña son obligatorios"
      });
    }

    // Buscar usuario por correo o documento
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
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas"
      });
    }

    // Verificar que sea un cliente
    if (user.Rol.NombreRol !== "Cliente") {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado. Esta ruta es solo para clientes."
      });
    }

    // Verificar contraseña
    const contraseñaValida = await bcrypt.compare(contraseña, user.Contraseña);

    if (!contraseñaValida) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas"
      });
    }

    // Buscar datos del cliente
    const cliente = await db.Cliente.findOne({
      where: { 
        [db.Sequelize.Op.or]: [
          { Correo: user.Correo },
          { Documento: user.Documento }
        ]
      }
    });

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: "No se encontraron los datos del cliente"
      });
    }

    // Generar token
    const token = generateToken({
      id: user.IdUsuario,
      rol: user.IdRol,
      correo: user.Correo,
      idCliente: cliente.IdCliente
    });

    res.status(200).json({
      success: true,
      message: "Inicio de sesión exitoso",
      token,
      cliente: {
        id: cliente.IdCliente,
        nombre: cliente.Nombre,
        apellido: cliente.Apellido,
        correo: cliente.Correo
      }
    });
  } catch (error) {
    handleError(error, req, res, "Error en login de cliente");
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
      where: { Correo: correo },
      include: [{
        model: db.Rol,
        attributes: ['NombreRol']
      }]
    });

    if (!usuario || usuario.Rol.NombreRol !== "Cliente") {
      // Por seguridad, no informamos si el correo existe o no
      return res.status(200).json({
        success: true,
        message: "Si el correo existe, se han enviado instrucciones para recuperar la contraseña"
      });
    }

    // Generar nueva contraseña temporal
    const nuevaContraseña = Math.random().toString(36).slice(-8) + "A1!"; // Aseguramos que cumpla los requisitos

    // Encriptar nueva contraseña
    const contraseñaHash = await bcrypt.hash(nuevaContraseña, 10);

    // Actualizar la contraseña del usuario
    await usuario.update({ Contraseña: contraseñaHash });

    // En producción, aquí enviarías el correo con la nueva contraseña
    // mailer.sendPasswordReset(correo, nuevaContr  aquí enviarías el correo con la nueva contraseña
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

// Obtener perfil de cliente
exports.getClienteProfile = async (req, res) => {
  try {
    // Imprimir el objeto user para depuración
    console.log('Datos del usuario en el token:', req.user);
    
    // Obtener el ID del cliente desde el token (probar ambas formas)
    const idCliente = req.user.idCliente || req.user.IdCliente;
    
    console.log('ID del cliente extraído:', idCliente);
    
    if (!idCliente) {
      return res.status(400).json({
        success: false,
        message: "No se pudo identificar al cliente"
      });
    }

    // Buscar cliente por ID
    const cliente = await db.Cliente.findByPk(idCliente, {
      include: [
        {
          model: db.Mascota,
          as: 'Mascota',
          required: false
        }
      ]
    });

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado"
      });
    }

    res.status(200).json({
      success: true,
      data: cliente
    });
  } catch (error) {
    console.error('Error específico:', error);
    handleError(error, req, res, "Error al obtener perfil de cliente");
  }
};
// Actualizar perfil de cliente
exports.updateClienteProfile = async (req, res) => {
  try {
    // Obtener el ID del cliente desde el token
    const idCliente = req.user.idCliente;
    
    if (!idCliente) {
      return res.status(400).json({
        success: false,
        message: "No se pudo identificar al cliente"
      });
    }

    const { Nombre, Apellido, Telefono, Direccion } = req.body;

    // Buscar cliente por ID
    const cliente = await db.Cliente.findByPk(idCliente);

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado"
      });
    }

    // Actualizar datos del cliente
    await cliente.update({
      Nombre: Nombre || cliente.Nombre,
      Apellido: Apellido || cliente.Apellido,
      Telefono: Telefono || cliente.Telefono,
      Direccion: Direccion || cliente.Direccion
    });

    // Actualizar también los datos en la tabla Usuario
    const usuario = await db.Usuario.findOne({
      where: { Correo: cliente.Correo }
    });

    if (usuario) {
      await usuario.update({
        Nombre: Nombre || usuario.Nombre,
        Apellido: Apellido || usuario.Apellido,
        Telefono: Telefono || usuario.Telefono,
        Direccion: Direccion || usuario.Direccion
      });
    }

    res.status(200).json({
      success: true,
      message: "Perfil actualizado correctamente",
      data: cliente
    });
  } catch (error) {
    handleError(error, req, res, "Error al actualizar perfil de cliente");
  }
};

// Cambiar contraseña de cliente
exports.changeClientePassword = async (req, res) => {
  try {
    const { contraseñaActual, nuevaContraseña } = req.body;
    
    if (!contraseñaActual || !nuevaContraseña) {
      return res.status(400).json({
        success: false,
        message: "Contraseña actual y nueva son requeridas"
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