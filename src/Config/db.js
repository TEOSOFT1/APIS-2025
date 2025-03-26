const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

// Opción 1: Conexión directa por IP
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: "mysql",
  port: process.env.DB_PORT,
  dialectOptions: {
    connectTimeout: 150000,
    ssl: false
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 150000,
    idle: 50000
  },
  logging: console.log
});

// Función para probar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión a MySQL exitosa con Sequelize");
    return true;
  } catch (err) {
    console.error("❌ Error en la conexión:", err);
    return false;
  }
};

// Ejecutar la prueba de conexión
testConnection();

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// ✅ Importar modelos
db.Permiso = require("../Models/PermisoModel")(sequelize, DataTypes);
db.Rol = require("../Models/RolModel")(sequelize, DataTypes);
db.RolPermiso = require("../Models/RolPermisoModel")(sequelize, DataTypes);
db.Usuario = require("../Models/UsuarioModel")(sequelize, DataTypes);
db.Cliente = require("../Models/ClienteModel")(sequelize, DataTypes);
db.Mascota = require("../Models/MascotaModel")(sequelize, DataTypes);
db.CategoriaProducto = require("../Models/CategoriaProductoModel")(sequelize, DataTypes);
db.Producto = require("../Models/ProductoModel")(sequelize, DataTypes);
db.Proveedor = require("../Models/ProveedorModel")(sequelize, DataTypes);
db.TipoServicio = require("../Models/TipoServicioModel")(sequelize, DataTypes);
db.Servicio = require("../Models/ServicioModel")(sequelize, DataTypes);
db.AgendamientoCita = require("../Models/AgendamientoCitaModel")(sequelize, DataTypes);
db.CitaServicio = require("../Models/CitaServicioModel")(sequelize, DataTypes);
db.Compra = require("../Models/CompraModel")(sequelize, DataTypes);
db.DetalleCompra = require("../Models/DetalleCompraModel")(sequelize, DataTypes);
db.NotificacionProducto = require("../Models/NotificacionProductoModel")(sequelize, DataTypes);
db.Venta = require("../Models/VentaModel")(sequelize, DataTypes);
db.DetalleVenta = require("../Models/DetalleVentaModel")(sequelize, DataTypes);
db.DetalleVentaServicio = require("../Models/DetalleVentaServicioModel")(sequelize, DataTypes);

// ✅ Definir relaciones

// Permisos y roles
db.Rol.belongsToMany(db.Permiso, { through: db.RolPermiso, foreignKey: "IdRol" });
db.Permiso.belongsToMany(db.Rol, { through: db.RolPermiso, foreignKey: "IdPermiso" });
db.RolPermiso.belongsTo(db.Rol, { foreignKey: "IdRol" });
db.RolPermiso.belongsTo(db.Permiso, { foreignKey: "IdPermiso" });

// Usuarios y roles
db.Usuario.belongsTo(db.Rol, { foreignKey: "IdRol" });
db.Rol.hasMany(db.Usuario, { foreignKey: "IdRol" });

// Clientes y mascotas
db.Mascota.belongsTo(db.Cliente, { foreignKey: "IdCliente" });
db.Cliente.hasMany(db.Mascota, { foreignKey: "IdCliente" });

// Productos y categorías
db.Producto.belongsTo(db.CategoriaProducto, { foreignKey: "IdCategoriaDeProducto" });
db.CategoriaProducto.hasMany(db.Producto, { foreignKey: "IdCategoriaDeProducto" });

// Servicios y tipos
db.Servicio.belongsTo(db.TipoServicio, { foreignKey: "IdTipoServicio" });
db.TipoServicio.hasMany(db.Servicio, { foreignKey: "IdTipoServicio" });

// Compras y proveedores
db.Compra.belongsTo(db.Proveedor, { foreignKey: "IdProveedor" });
db.Proveedor.hasMany(db.Compra, { foreignKey: "IdProveedor" });

// Detalles de compras y productos
db.DetalleCompra.belongsTo(db.Compra, { foreignKey: "IdCompra" });
db.DetalleCompra.belongsTo(db.Producto, { foreignKey: "IdProducto" });
db.Compra.hasMany(db.DetalleCompra, { foreignKey: "IdCompra" });
db.Producto.hasMany(db.DetalleCompra, { foreignKey: "IdProducto" });

// Ventas y clientes/usuarios
db.Venta.belongsTo(db.Cliente, { foreignKey: "IdCliente" });
db.Cliente.hasMany(db.Venta, { foreignKey: "IdCliente" });

db.Venta.belongsTo(db.Usuario, { foreignKey: "IdUsuario" });
db.Usuario.hasMany(db.Venta, { foreignKey: "IdUsuario" });

// Detalles de venta y productos
db.Venta.hasMany(db.DetalleVenta, { as: "DetallesVenta", foreignKey: "IdVenta" });
db.DetalleVenta.belongsTo(db.Venta, { as: "Venta", foreignKey: "IdVenta" });

db.DetalleVenta.belongsTo(db.Producto, { as: "Producto", foreignKey: "IdProducto" });
db.Producto.hasMany(db.DetalleVenta, { as: "DetallesVenta", foreignKey: "IdProducto" });

// Relación entre DetalleVentaServicio y Venta
db.Venta.hasMany(db.DetalleVentaServicio, { as: "DetallesVentaServicio", foreignKey: "IdVenta" });
db.DetalleVentaServicio.belongsTo(db.Venta, { as: "Venta", foreignKey: "IdVenta" });

// Relación entre DetalleVentaServicio y Servicio
db.Servicio.hasMany(db.DetalleVentaServicio, { as: "DetallesVentaServicio", foreignKey: "IdServicio" });
db.DetalleVentaServicio.belongsTo(db.Servicio, { as: "Servicio", foreignKey: "IdServicio" });

// Relación entre DetalleVentaServicio y Mascota
db.Mascota.hasMany(db.DetalleVentaServicio, { as: "DetallesVentaServicio", foreignKey: "IdMascota" });
db.DetalleVentaServicio.belongsTo(db.Mascota, { as: "Mascota", foreignKey: "IdMascota" });

// ✅ Sincronizar modelos con la base de datos
sequelize
  .sync({ alter: false })
  .then(() => console.log("✅ Base de datos sincronizada correctamente"))
  .catch((err) => console.error("❌ Error al sincronizar la base de datos:", err));

// Solo exportar db
module.exports = db;