// utils/validators.js
// Validar email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar contraseña (mínimo 8 caracteres, al menos una letra mayúscula, una minúscula, un número y un carácter especial)
const isValidPassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,64}$/;
  return passwordRegex.test(password);
};

// Validar teléfono (solo números, mínimo 7 dígitos)
const isValidPhone = (phone) => {
  const phoneRegex = /^\d{7,15}$/;
  return phoneRegex.test(phone);
};

// Validar documento (solo números, entre 5 y 20 dígitos)
const isValidDocument = (document) => {
  const documentRegex = /^\d{5,20}$/;
  return documentRegex.test(document);
};

// Validar que todos los campos requeridos estén presentes
const validateRequiredFields = (data, requiredFields) => {
  const missingFields = [];

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === "") {
      missingFields.push(field);
    }
  }

  return {
    valid: missingFields.length === 0,
    missingFields,
  };
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isValidDocument,
  validateRequiredFields,
};