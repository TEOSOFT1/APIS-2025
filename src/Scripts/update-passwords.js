// src/Scripts/update-passwords.js
const db = require("../Config/db");
const bcrypt = require("bcrypt");

async function updatePasswords() {
  try {
    console.log('🔐 Actualizando contraseñas de usuarios...');
    
    // Verificar conexión a la base de datos
    await db.testConnection();
    
    // Obtener todos los usuarios
    const usuarios = await db.Usuario.findAll();
    
    if (usuarios.length === 0) {
      console.log('❌ No se encontraron usuarios en la base de datos.');
      return;
    }
    
    console.log(`✅ Se encontraron ${usuarios.length} usuarios.`);
    
    // Nuevas contraseñas seguras para cada usuario
    const nuevasContraseñas = {
      'admin@teocat.com': 'Admin2024!',
      'vendedor@teocat.com': 'Vendedor2024!',
      'analista@teocat.com': 'Analista2024!',
      'soporte@teocat.com': 'Soporte2024!',
      'vendedor2@teocat.com': 'Vendedor2024!'
    };
    
    // Actualizar cada usuario
    for (const usuario of usuarios) {
      // Determinar la nueva contraseña
      let nuevaContraseña = nuevasContraseñas[usuario.Correo];
      
      // Si no hay una contraseña específica, crear una genérica segura
      if (!nuevaContraseña) {
        nuevaContraseña = `${usuario.Nombre}2024!`;
      }
      
      // Verificar si la contraseña ya está encriptada
      if (usuario.Contraseña && usuario.Contraseña.startsWith('$2')) {
        console.log(`ℹ️ La contraseña de ${usuario.Correo} ya está encriptada. Actualizando de todos modos.`);
      }
      
      // Encriptar la nueva contraseña
      const contraseñaHash = await bcrypt.hash(nuevaContraseña, 10);
      
      // Actualizar en la base de datos
      await usuario.update({ Contraseña: contraseñaHash });
      
      console.log(`✅ Contraseña actualizada para ${usuario.Correo}`);
      console.log(`   Nueva contraseña: ${nuevaContraseña}`);
    }
    
    console.log('✅ Todas las contraseñas han sido actualizadas correctamente.');
    
  } catch (error) {
    console.error('❌ Error al actualizar contraseñas:', error);
  } finally {
    process.exit();
  }
}

// Ejecutar la función
updatePasswords();