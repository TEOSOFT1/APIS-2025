// Función para manejar errores de forma centralizada
const handleError = (error, req, res, customMessage = "Error en la operación") => {
    console.error(`❌ ${customMessage}:`, error)
  
    // Determinar el código de estado HTTP apropiado
    let statusCode = 500
    let message = "Error interno del servidor"
  
    // Errores específicos de Sequelize
    if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
      statusCode = 400
      message = error.errors.map((e) => e.message).join(", ")
    }
  
    // Errores de autenticación
    else if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      statusCode = 401
      message = error.name === "TokenExpiredError" ? "Token expirado" : "Token inválido"
    }
  
    // Errores personalizados
    else if (error.statusCode) {
      statusCode = error.statusCode
      message = error.message
    }
  
    // Responder con el error
    res.status(statusCode).json({
      success: false,
      message: message,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
  
  // Crear un error personalizado con código de estado
  const createError = (message, statusCode = 500) => {
    const error = new Error(message)
    error.statusCode = statusCode
    return error
  }
  
  module.exports = {
    handleError,
    createError,
  }
  
  