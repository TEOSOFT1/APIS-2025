// migrations/add-cliente-role.js
const db = require('../Config/db');
const { QueryTypes } = require('sequelize');

async function addClienteRole() {
  try {
    console.log('🚀 Iniciando migración para agregar rol Cliente...');
    
    // Verificar si el rol Cliente ya existe
    const roles = await db.sequelize.query(
      "SELECT * FROM Roles WHERE NombreRol = 'Cliente'",
      { type: QueryTypes.SELECT }
    );

    if (roles.length === 0) {
      // El rol no existe, crearlo
      await db.sequelize.query(
        "INSERT INTO Roles (NombreRol, Estado) VALUES ('Cliente', TRUE)"
      );
      console.log('✅ Rol Cliente agregado correctamente');
    } else {
      console.log('ℹ️ El rol Cliente ya existe');
    }

    // Asignar permisos básicos al rol Cliente
    const rolCliente = await db.sequelize.query(
      "SELECT IdRol FROM Roles WHERE NombreRol = 'Cliente'",
      { type: QueryTypes.SELECT }
    );

    if (rolCliente.length > 0) {
      const idRolCliente = rolCliente[0].IdRol;
      
      // Verificar si existe el permiso para gestionar mascotas
      const permisoMascotas = await db.sequelize.query(
        "SELECT IdPermiso FROM Permisos WHERE NombrePermiso = 'Gestionar Mascotas'",
        { type: QueryTypes.SELECT }
      );

      if (permisoMascotas.length > 0) {
        const idPermisoMascotas = permisoMascotas[0].IdPermiso;
        
        // Verificar si ya existe la relación
        const relacion = await db.sequelize.query(
          "SELECT * FROM Rol_Permiso WHERE IdRol = ? AND IdPermiso = ?",
          { 
            replacements: [idRolCliente, idPermisoMascotas],
            type: QueryTypes.SELECT 
          }
        );

        if (relacion.length === 0) {
          // Crear la relación
          await db.sequelize.query(
            "INSERT INTO Rol_Permiso (IdRol, IdPermiso) VALUES (?, ?)",
            { 
              replacements: [idRolCliente, idPermisoMascotas]
            }
          );
          console.log('✅ Permiso Gestionar Mascotas asignado al rol Cliente');
        } else {
          console.log('ℹ️ El permiso ya está asignado al rol Cliente');
        }
      } else {
        console.log('⚠️ No se encontró el permiso Gestionar Mascotas');
        
        // Crear el permiso si no existe
        await db.sequelize.query(
          "INSERT INTO Permisos (NombrePermiso, Estado) VALUES ('Gestionar Mascotas', TRUE)"
        );
        console.log('✅ Permiso Gestionar Mascotas creado');
        
        // Obtener el ID del permiso recién creado
        const nuevoPermiso = await db.sequelize.query(
          "SELECT IdPermiso FROM Permisos WHERE NombrePermiso = 'Gestionar Mascotas'",
          { type: QueryTypes.SELECT }
        );
        
        if (nuevoPermiso.length > 0) {
          // Asignar el permiso al rol Cliente
          await db.sequelize.query(
            "INSERT INTO Rol_Permiso (IdRol, IdPermiso) VALUES (?, ?)",
            { 
              replacements: [idRolCliente, nuevoPermiso[0].IdPermiso]
            }
          );
          console.log('✅ Permiso Gestionar Mascotas asignado al rol Cliente');
        }
      }
    }
    
    console.log('🎉 Migración completada con éxito');
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  }
}

// Ejecutar la migración
addClienteRole()
  .then(() => {
    console.log('✅ Migración completada con éxito');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  });