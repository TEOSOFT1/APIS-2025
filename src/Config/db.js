const { Sequelize, DataTypes } = require("sequelize")
require("dotenv").config()

// Configuración de la conexión a la base de datos
const sequelize = new Sequelize(process.env.DB_LOCAL_NAME, process.env.DB_LOCAL_USER, process.env.DB_LOCAL_PASSWORD, {
  host: process.env.DB_LOCAL_HOST,
  dialect: "mysql",
  port: process.env.DB_LOCAL_PORT || 3306,
  dialectOptions: {
    connectTimeout: 150000,
    ssl: false,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 150000,
    idle: 50000,
  },
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  define: {
    timestamps: false,
  },
})

// Función para probar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate()
    console.log("✅ Conexión a MySQL LOCAL exitosa con Sequelize")
    console.log(`   Host: ${process.env.DB_LOCAL_HOST}`)
    console.log(`   Base de datos: ${process.env.DB_LOCAL_NAME}`)
    console.log(`   Usuario: ${process.env.DB_LOCAL_USER}`)
    return true
  } catch (err) {
    console.error("❌ Error en la conexión:", err)
    return false
  }
}

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize
db.testConnection = testConnection

// Importar modelos
db.Permiso = require("../Models/PermisoModel")(sequelize, DataTypes)
db.Rol = require("../Models/RolModel")(sequelize, DataTypes)
db.RolPermiso = require("../Models/RolPermisoModel")(sequelize, DataTypes)
db.Usuario = require("../Models/UsuarioModel")(sequelize, DataTypes)
db.Mascota = require("../Models/MascotaModel")(sequelize, DataTypes)
db.Cliente = require("../Models/ClienteModel")(sequelize, DataTypes)
db.Resena = require("../Models/ResenaModel")(sequelize, DataTypes)
db.Proveedor = require("../Models/ProveedorModel")(sequelize, DataTypes)
db.CategoriaProducto = require("../Models/CategoriaProductoModel")(sequelize, DataTypes)
db.Producto = require("../Models/ProductoModel")(sequelize, DataTypes)
db.TipoServicio = require("../Models/TipoServicioModel")(sequelize, DataTypes)
db.Servicio = require("../Models/ServicioModel")(sequelize, DataTypes)
db.AgendamientoCita = require("../Models/AgendamientoCitaModel")(sequelize, DataTypes)
db.CitaServicio = require("../Models/CitaServicioModel")(sequelize, DataTypes)
db.NotificacionProducto = require("../Models/NotificacionProductoModel")(sequelize, DataTypes)
db.Compra = require("../Models/CompraModel")(sequelize, DataTypes)
db.DetalleCompra = require("../Models/DetalleCompraModel")(sequelize, DataTypes)
db.Venta = require("../Models/VentaModel")(sequelize, DataTypes)
db.DetalleVenta = require("../Models/DetalleVentaModel")(sequelize, DataTypes)
db.DetalleVentaServicio = require("../Models/DetalleVentaServicioModel")(sequelize, DataTypes)
db.ResenaEntidad = require("../Models/ResenaEntidadesModel")(sequelize, DataTypes)

// Definir relaciones
// Roles y Permisos
db.Rol.belongsToMany(db.Permiso, { through: db.RolPermiso, foreignKey: "IdRol", otherKey: "IdPermiso" })
db.Permiso.belongsToMany(db.Rol, { through: db.RolPermiso, foreignKey: "IdPermiso", otherKey: "IdRol" })

// Relaciones específicas para RolPermiso
db.RolPermiso.belongsTo(db.Rol, { foreignKey: "IdRol" })
db.RolPermiso.belongsTo(db.Permiso, { foreignKey: "IdPermiso" })
db.Rol.hasMany(db.RolPermiso, { foreignKey: "IdRol" })
db.Permiso.hasMany(db.RolPermiso, { foreignKey: "IdPermiso" })

// Usuarios y Roles
db.Rol.hasMany(db.Usuario, { foreignKey: "IdRol" })
db.Usuario.belongsTo(db.Rol, { foreignKey: "IdRol" })

// Clientes y Mascotas
db.Mascota.hasMany(db.Cliente, { foreignKey: "IdMascota" })
db.Cliente.belongsTo(db.Mascota, { foreignKey: "IdMascota", as: "Mascota" })

// Clientes y Reseñas
db.Cliente.hasMany(db.Resena, { foreignKey: "IdCliente" })
db.Resena.belongsTo(db.Cliente, { foreignKey: "IdCliente" })

// Categorías y Productos
db.CategoriaProducto.hasMany(db.Producto, { foreignKey: "IdCategoriaDeProducto" })
db.Producto.belongsTo(db.CategoriaProducto, { foreignKey: "IdCategoriaDeProducto" })

// Tipos de Servicio y Servicios
db.TipoServicio.hasMany(db.Servicio, { foreignKey: "IdTipoServicio" })
db.Servicio.belongsTo(db.TipoServicio, { foreignKey: "IdTipoServicio" })

// Agendamiento de Citas
db.Cliente.hasMany(db.AgendamientoCita, { foreignKey: "IdCliente" })
db.AgendamientoCita.belongsTo(db.Cliente, { foreignKey: "IdCliente" })
db.Mascota.hasMany(db.AgendamientoCita, { foreignKey: "IdMascota" })
db.AgendamientoCita.belongsTo(db.Mascota, { foreignKey: "IdMascota" })

// Citas y Servicios
db.AgendamientoCita.belongsToMany(db.Servicio, {
  through: db.CitaServicio,
  foreignKey: "IdCita",
  otherKey: "IdServicio",
})
db.Servicio.belongsToMany(db.AgendamientoCita, {
  through: db.CitaServicio,
  foreignKey: "IdServicio",
  otherKey: "IdCita",
})

// Notificaciones y Productos
db.Producto.hasMany(db.NotificacionProducto, { foreignKey: "IdProducto" })
db.NotificacionProducto.belongsTo(db.Producto, { foreignKey: "IdProducto" })

// Compras y Proveedores
db.Proveedor.hasMany(db.Compra, { foreignKey: "IdProveedor" })
db.Compra.belongsTo(db.Proveedor, { foreignKey: "IdProveedor" })

// Compras y Detalles de Compra
db.Compra.hasMany(db.DetalleCompra, { foreignKey: "IdCompra" })
db.DetalleCompra.belongsTo(db.Compra, { foreignKey: "IdCompra" })
db.Producto.hasMany(db.DetalleCompra, { foreignKey: "IdProducto" })
db.DetalleCompra.belongsTo(db.Producto, { foreignKey: "IdProducto" })

// Ventas
db.Cliente.hasMany(db.Venta, { foreignKey: "IdCliente" })
db.Venta.belongsTo(db.Cliente, { foreignKey: "IdCliente" })
db.Usuario.hasMany(db.Venta, { foreignKey: "IdUsuario" })
db.Venta.belongsTo(db.Usuario, { foreignKey: "IdUsuario" })
db.Venta.hasOne(db.Venta, { foreignKey: "IdVentaOriginal", as: "VentaOriginal" })

// Detalles de Venta
db.Venta.hasMany(db.DetalleVenta, { foreignKey: "IdVenta", as: "DetallesVenta" })
db.DetalleVenta.belongsTo(db.Venta, { foreignKey: "IdVenta" })
db.Producto.hasMany(db.DetalleVenta, { foreignKey: "IdProducto" })
db.DetalleVenta.belongsTo(db.Producto, { foreignKey: "IdProducto", as: "Producto" })

// Detalles de Venta de Servicios
db.Venta.hasMany(db.DetalleVentaServicio, { foreignKey: "IdVenta", as: "DetallesVentaServicio" })
db.DetalleVentaServicio.belongsTo(db.Venta, { foreignKey: "IdVenta" })
db.Servicio.hasMany(db.DetalleVentaServicio, { foreignKey: "IdServicio" })
db.DetalleVentaServicio.belongsTo(db.Servicio, { foreignKey: "IdServicio", as: "Servicio" })
db.Mascota.hasMany(db.DetalleVentaServicio, { foreignKey: "IdMascota" })
db.DetalleVentaServicio.belongsTo(db.Mascota, { foreignKey: "IdMascota" })

// Reseñas
db.Resena.hasMany(db.ResenaEntidad, { foreignKey: "IdReseña" })
db.ResenaEntidad.belongsTo(db.Resena, { foreignKey: "IdReseña" })

db.Producto.hasMany(db.ResenaEntidad, { foreignKey: "IdProducto" })
db.ResenaEntidad.belongsTo(db.Producto, { foreignKey: "IdProducto" })

db.Servicio.hasMany(db.ResenaEntidad, { foreignKey: "IdServicio" })
db.ResenaEntidad.belongsTo(db.Servicio, { foreignKey: "IdServicio" })

// Función para sincronizar modelos con la base de datos
db.sync = async (force = false) => {
  try {
    await db.sequelize.sync({ force })
    console.log("✅ Modelos sincronizados con la base de datos")
    return true
  } catch (error) {
    console.error("❌ Error al sincronizar modelos:", error)
    return false
  }
}

// Función para inicializar datos básicos (roles, permisos, etc.)
db.initializeData = async () => {
  try {
    // Verificar si ya existen roles
    const rolesCount = await db.Rol.count()

    if (rolesCount === 0) {
      // Crear roles básicos
      const roles = [
        { NombreRol: "Administrador", Estado: true },
        { NombreRol: "Cliente", Estado: true },
        { NombreRol: "Vendedor", Estado: true },
        { NombreRol: "Analista", Estado: true },
        { NombreRol: "Soporte", Estado: true },
      ]

      await db.Rol.bulkCreate(roles)
      console.log("✅ Roles básicos creados")
    }

    // Verificar si ya existen permisos
    const permisosCount = await db.Permiso.count()

    if (permisosCount === 0) {
      // Crear permisos básicos
      const permisos = [
        { NombrePermiso: "Administrar Usuarios", Estado: true },
        { NombrePermiso: "Gestionar Ventas", Estado: true },
        { NombrePermiso: "Ver Reportes", Estado: true },
        { NombrePermiso: "Configurar Sistema", Estado: true },
        { NombrePermiso: "Gestionar Productos", Estado: true },
        { NombrePermiso: "Gestionar Servicios", Estado: true },
        { NombrePermiso: "Gestionar Mascotas", Estado: true },
        { NombrePermiso: "Gestionar Proveedores", Estado: true },
        { NombrePermiso: "Gestionar Clientes", Estado: true },
      ]

      await db.Permiso.bulkCreate(permisos)
      console.log("✅ Permisos básicos creados")

      // Asignar todos los permisos al rol Administrador
      const rolAdmin = await db.Rol.findOne({ where: { NombreRol: "Administrador" } })
      const todosPermisos = await db.Permiso.findAll()

      if (rolAdmin && todosPermisos.length > 0) {
        const rolPermisos = todosPermisos.map((permiso) => ({
          IdRol: rolAdmin.IdRol,
          IdPermiso: permiso.IdPermiso,
          Estado: true,
        }))

        await db.RolPermiso.bulkCreate(rolPermisos)
        console.log("✅ Permisos asignados al rol Administrador")
      }
    }

    return true
  } catch (error) {
    console.error("❌ Error al inicializar datos:", error)
    return false
  }
}

module.exports = db

