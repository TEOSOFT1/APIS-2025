const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "secreto";

// Generar token JWT
const generateToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.IdUsuario,
      rol: usuario.IdRol,
      correo: usuario.Correo,
    },
    JWT_SECRET,
    {
      expiresIn: "24h", // El token expira en 24 horas
    }
  );
};

// Verificar token JWT
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};