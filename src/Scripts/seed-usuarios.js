// src/Scripts/seed-usuarios.js
const db = require("../Config/db");
const bcrypt = require("bcrypt");

async function crearDatosIniciales() {
  try {
    console.log('🚀 Creando datos iniciales...');
    
    // Verificar conexión a la base de datos
    await db.sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // 1. Crear roles si no existen
    console.log('📊 Creando roles...');
    const roles = [
      { NombreRol: 'Administrador', Estado: true },
      { NombreRol: 'Cliente', Estado: true },
      { NombreRol: 'Vendedor', Estado: true },
      { NombreRol: 'Analista', Estado: true },
      { NombreRol: 'Soporte', Estado: true }
    ];
    
    for (const rol of roles) {
      const [rolCreado, creado] = await db.Rol.findOrCreate({
        where: { NombreRol: rol.NombreRol },
        defaults: rol
      });
      
      if (creado) {
        console.log(`✅ Rol ${rol.NombreRol} creado correctamente`);
      } else {
        console.log(`ℹ️ Rol ${rol.NombreRol} ya existe`);
      }
    }
    
    // 2. Crear permisos si no existen
    console.log('🔑 Creando permisos...');
    const permisos = [
      { NombrePermiso: 'Administrar Usuarios', Estado: true },
      { NombrePermiso: 'Gestionar Ventas', Estado: true },
      { NombrePermiso: 'Ver Reportes', Estado: true },
      { NombrePermiso: 'Configurar Sistema', Estado: true },
      { NombrePermiso: 'Gestionar Productos', Estado: true },
      { NombrePermiso: 'Gestionar Servicios', Estado: true },
      { NombrePermiso: 'Gestionar Mascotas', Estado: true },
      { NombrePermiso: 'Gestionar Proveedores', Estado: true },
      { NombrePermiso: 'Gestionar Clientes', Estado: true }
    ];
    
    for (const permiso of permisos) {
      const [permisoCreado, creado] = await db.Permiso.findOrCreate({
        where: { NombrePermiso: permiso.NombrePermiso },
        defaults: permiso
      });
      
      if (creado) {
        console.log(`✅ Permiso ${permiso.NombrePermiso} creado correctamente`);
      } else {
        console.log(`ℹ️ Permiso ${permiso.NombrePermiso} ya existe`);
      }
    }
    
    // 3. Asignar permisos al rol Administrador
    console.log('🔄 Asignando permisos al rol Administrador...');
    const rolAdmin = await db.Rol.findOne({ where: { NombreRol: 'Administrador' } });
    const todosPermisos = await db.Permiso.findAll();
    
    if (rolAdmin && todosPermisos.length > 0) {
      for (const permiso of todosPermisos) {
        const [rolPermiso, creado] = await db.RolPermiso.findOrCreate({
          where: {
            IdRol: rolAdmin.IdRol,
            IdPermiso: permiso.IdPermiso
          },
          defaults: {
            IdRol: rolAdmin.IdRol,
            IdPermiso: permiso.IdPermiso,
            Estado: true
          }
        });
        
        if (creado) {
          console.log(`✅ Permiso ${permiso.NombrePermiso} asignado al rol Administrador`);
        } else {
          console.log(`ℹ️ Permiso ${permiso.NombrePermiso} ya está asignado al rol Administrador`);
        }
      }
    }
    
    // 4. Crear usuario administrador por defecto
    console.log('👤 Creando usuario administrador por defecto...');
    const adminExiste = await db.Usuario.findOne({
      where: { Correo: 'admin@teocat.com' }
    });
    
    if (!adminExiste) {
      const contraseñaHash = await bcrypt.hash('Admin2024!', 10);
      
      await db.Usuario.create({
        IdRol: rolAdmin.IdRol,
        Documento: '1234567890',
        Correo: 'admin@teocat.com',
        Contraseña: contraseñaHash,
        Nombre: 'Administrador',
        Apellido: 'Sistema',
        Telefono: '3001234567',
        Direccion: 'Calle Principal #123',
        Estado: true
      });
      
      console.log('✅ Usuario administrador creado correctamente');
    } else {
      console.log('ℹ️ El usuario administrador ya existe');
    }
    
    console.log('🎉 Datos iniciales creados correctamente');
  } catch (error) {
    console.error(`❌ Error al crear datos iniciales: ${error.message}`);
  } finally {
    process.exit();
  }
}

// Ejecutar la función
crearDatosIniciales();