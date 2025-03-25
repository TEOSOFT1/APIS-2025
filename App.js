const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

// Importar conexión a la base de datos
const db = require("./src/Config/db");

// Importar rutas
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

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Rutas
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/permisos", permisoRoutes);
app.use("/api/roles", rolRoutes);
app.use("/api/rol-permisos", rolPermisoRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/mascotas", mascotaRoutes);
app.use("/api/categorias", categoriaProductoRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/proveedores", proveedorRoutes);
app.use("/api/tipos-servicio", tipoServicioRoutes);
app.use("/api/servicios", servicioRoutes);
app.use("/api/agendamientos", agendamientoRoutes);
app.use("/api/cita-servicios", citaServicioRoutes);
app.use("/api/compras", compraRoutes);
app.use("/api/detalle-compras", detalleCompraRoutes);
app.use("/api/notificaciones", notificacionProductoRoutes);
app.use("/api/ventas", ventaRoutes);
app.use("/api/detalle-ventas", detalleVentaRoutes);
app.use("/api/detalle-ventas-servicios", detalleVentaServicioRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "API funcionando correctamente" });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error("❌ Error en la aplicación:", err.stack);
  res.status(500).json({
    message: "Error interno del servidor",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// Sincronizar modelos con la base de datos (en desarrollo)
if (process.env.NODE_ENV === "development") {
  db.sequelize
    .sync({ alter: false }) // Cambiado a false para evitar alteraciones automáticas
    .then(() => console.log("✅ Modelos sincronizados con la base de datos correctamente"))
    .catch((err) => console.error("❌ Error al sincronizar modelos:", err));
}

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});

module.exports = app;
