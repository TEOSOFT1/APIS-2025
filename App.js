// App.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

// Importar conexión a la base de datos
const db = require("./src/Config/db");

// Importar rutas
const authRoutes = require("./src/Routes/AuthRoutes"); // Importar rutas de autenticación
const usuarioRoutes = require("./src/Routes/UsuarioRoutes");
const permisoRoutes = require("./src/Routes/PermisoRoutes");
const rolRoutes = require("./src/Routes/RolRoutes");
const rolPermisoRoutes = require("./src/Routes/RolPermisoRoutes");
const clienteRoutes = require("./src/Routes/ClienteRoutes");
const mascotaRoutes = require("./src/Routes/MascotaRoutes");
const categoriaProductoRoutes = require("./src/Routes/CategoriaProductoRoutes");
const productoRoutes = require("./src/Routes/ProductoRoutes");
const proveedorRoutes = require("./src/Routes/ProveedorRoutes");
const tipoServicioRoutes = require("./src/Routes/TipoServicioRoutes");
const servicioRoutes = require("./src/Routes/ServicioRoutes");
const agendamientoRoutes = require("./src/Routes/AgendamientoCitaRoutes");
const citaServicioRoutes = require("./src/Routes/CitaServicioRoutes");
const compraRoutes = require("./src/Routes/CompraRoutes");
const detalleCompraRoutes = require("./src/Routes/DetalleCompraRoutes");
const notificacionProductoRoutes = require("./src/Routes/NotificacionProductoRoutes");
const ventaRoutes = require("./src/Routes/VentaRoutes");
const detalleVentaRoutes = require("./src/Routes/DetalleVentaRoutes");
const detalleVentaServicioRoutes = require("./src/Routes/DetalleVentaServicioRoutes");
const resenaRoutes = require("./src/Routes/ResenaRoutes");
const resenaEntidadRoutes = require("./src/Routes/ResenaEntidadRoutes");

// Importar middleware de autenticación
const { verifyToken } = require("./src/Middlewares/AuthMiddleware");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false, // Desactivar para desarrollo
  crossOriginEmbedderPolicy: false // Desactivar para desarrollo
}));
app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));

// Middleware para imprimir información de solicitudes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ 
    message: "API de TeoCat funcionando correctamente",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development"
  });
});

// ===== RUTAS PÚBLICAS (no requieren autenticación) =====

// Rutas de autenticación (públicas)
app.use("/api/auth", authRoutes); // Usar el router de autenticación para todas las rutas de auth

// Rutas públicas para consulta de productos y servicios
app.use("/api/publico/productos", productoRoutes);
app.use("/api/publico/servicios", servicioRoutes);
app.use("/api/publico/categorias", categoriaProductoRoutes);
app.use("/api/publico/tipos-servicio", tipoServicioRoutes);

// ===== RUTAS PROTEGIDAS (requieren autenticación) =====

// Rutas administrativas
app.use("/api/usuarios", verifyToken, usuarioRoutes);
app.use("/api/permisos", verifyToken, permisoRoutes);
app.use("/api/roles", verifyToken, rolRoutes);
app.use("/api/rol-permisos", verifyToken, rolPermisoRoutes);

// Rutas de clientes (protegidas)
app.use("/api/clientes", verifyToken, clienteRoutes);

// Rutas de entidades principales
app.use("/api/mascotas", verifyToken, mascotaRoutes);
app.use("/api/categorias", verifyToken, categoriaProductoRoutes);
app.use("/api/productos", verifyToken, productoRoutes);
app.use("/api/proveedores", verifyToken, proveedorRoutes);
app.use("/api/tipos-servicio", verifyToken, tipoServicioRoutes);
app.use("/api/servicios", verifyToken, servicioRoutes);

// Rutas de operaciones
app.use("/api/agendamiento-citas", verifyToken, agendamientoRoutes);
app.use("/api/cita-servicios", verifyToken, citaServicioRoutes);
app.use("/api/compras", verifyToken, compraRoutes);
app.use("/api/detalle-compras", verifyToken, detalleCompraRoutes);
app.use("/api/notificaciones", verifyToken, notificacionProductoRoutes);
app.use("/api/ventas", verifyToken, ventaRoutes);
app.use("/api/detalle-ventas", verifyToken, detalleVentaRoutes);
app.use("/api/detalle-ventas-servicios", verifyToken, detalleVentaServicioRoutes);

// Rutas de reseñas
app.use("/api/resenas", verifyToken, resenaRoutes);
app.use("/api/resenas-entidades", verifyToken, resenaEntidadRoutes);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error("❌ Error en la aplicación:", err.stack);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// Middleware para rutas no encontradas
app.use((req, res) => {
  console.log(`Ruta no encontrada: ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada"
  });
});

// Iniciar servidor
async function iniciarServidor() {
  try {
    // Probar conexión a la base de datos
    const conexionExitosa = await db.testConnection();
    
    if (conexionExitosa) {
      // Sincronizar modelos con la base de datos (no forzar)
      if (process.env.NODE_ENV === "development") {
        await db.sequelize.sync({ alter: false });
        console.log("✅ Modelos sincronizados con la base de datos correctamente");
      }
      
      // Inicializar datos básicos (roles, permisos, etc.)
      if (typeof db.initializeData === 'function') {
        await db.initializeData();
        console.log("✅ Datos básicos inicializados correctamente");
      }
      
      // Iniciar el servidor
      app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        console.log(`📝 Ambiente: ${process.env.NODE_ENV || "development"}`);
        console.log(`🔑 Rutas de autenticación disponibles en http://localhost:${PORT}/api/auth/usuarios/login y http://localhost:${PORT}/api/auth/clientes/login`);
      });
    } else {
      console.error("❌ No se pudo iniciar el servidor debido a problemas con la base de datos");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

iniciarServidor();

module.exports = app;