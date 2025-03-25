const jwt = require("jsonwebtoken");

// Middleware para verificar el token JWT
exports.verifyToken = (req, res, next) => {
  try {
    // Obtener el token del header de autorización
    const authHeader = req.headers["authorization"];
    
    if (!authHeader) {
      return res.status(403).json({ message: "Token requerido" });
    }
    
    // Eliminar el prefijo "Bearer " si existe
    const token = authHeader.startsWith("Bearer ") 
      ? authHeader.slice(7) 
      : authHeader;
    
    if (!token) {
      return res.status(403).json({ message: "Token requerido" });
    }
    
    // Verificar el token
    jwt.verify(token, process.env.JWT_SECRET || "secreto", (err, decoded) => {
      if (err) {
        console.error("Error al verificar token:", err);
        return res.status(401).json({ message: "Token no válido" });
      }
      
      // Guardar la información del usuario en el objeto request
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error("Error en middleware de autenticación:", error);
    return res.status(500).json({ message: "Error en la autenticación" });
  }
};

// Middleware para verificar el rol del usuario
exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ message: "Usuario no autenticado" });
    }
    
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ message: "Acceso denegado" });
    }
    
    next();
  };
};