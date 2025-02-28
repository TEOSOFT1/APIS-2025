const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const testRoutes = require('./Routes/testRoutes'); // Importa las rutas de prueba

const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Usa las rutas de prueba
app.use('/test', testRoutes); // Prefijo '/test' para las rutas de prueba

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('¡Algo salió mal!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});