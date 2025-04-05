// src/Utils/errorHandler.js
// Función para manejar errores en controladores
exports.handleError = (error, req, res, customMessage = "Error en el servidor") => {
  console.error(`❌ ${customMessage}:`, error);
  
  // Errores de validación de Sequelize
  if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
    const errors = error.errors.map(err => ({
      field: err.path,
      message: err.message
    }));
    
    return res.status(400).json({
      success: false,
      message: "Error de validación",
      errors
    });
  }
  
  // Errores personalizados
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message
    });
  }
  
  // Error de servidor por defecto
  return res.status(500).json({
    success: false,
    message: customMessage,
    error: process.env.NODE_ENV === "development" ? error.message : undefined
  });
};

// Función para crear errores personalizados
exports.createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};