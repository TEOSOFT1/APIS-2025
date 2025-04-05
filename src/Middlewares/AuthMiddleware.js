// src/Middlewares/AuthMiddleware.js
const jwt = require('jsonwebtoken');
const db = require('../Config/db');

exports.verifyToken = (req, res, next) => {
  console.log('Verificando token para ruta:', req.originalUrl);
  
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    console.log('No se proporcionó un token de autenticación');
    return res.status(401).json({
      success: false,
      message: 'No se proporcionó un token de autenticación'
    });
  }
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    console.log('Formato de token inválido');
    return res.status(401).json({
      success: false,
      message: 'Formato de token inválido'
    });
  }
  
  const token = parts[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "TeoSoft2024SecretKey!@#$");
    req.user = decoded;
    console.log('Token válido para usuario:', decoded.id, 'con rol:', decoded.rol);
    next();
  } catch (error) {
    console.log('Token inválido:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

exports.checkRole = (roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }
    
    const userRole = req.user.rol;
    
    try {
      // Buscar el rol por ID
      const rol = await db.Rol.findByPk(userRole);
      
      if (!rol) {
        return res.status(403).json({
          success: false,
          message: 'Rol no encontrado'
        });
      }
      
      if (roles.includes(rol.NombreRol)) {
        next();
      } else {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para acceder a este recurso'
        });
      }
    } catch (error) {
      console.error('Error al verificar rol:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al verificar permisos'
      });
    }
  };
};