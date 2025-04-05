// src/Utils/jwt.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Clave secreta para firmar los tokens
const JWT_SECRET = process.env.JWT_SECRET || "TeoSoft2024SecretKey!@#$";

// Tiempo de expiración del token (en segundos)
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "24h";

// Generar token JWT
exports.generateToken = (payload) => {
  try {
    console.log("Generando token para:", payload);
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
    console.log("Token generado correctamente");
    return token;
  } catch (error) {
    console.error("Error al generar token:", error);
    throw error;
  }
};

// Verificar token JWT
exports.verifyToken = (token) => {
  try {
    console.log("Verificando token");
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Token verificado correctamente");
    return decoded;
  } catch (error) {
    console.error("Error al verificar token:", error);
    throw error;
  }
};