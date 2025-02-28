const express = require('express');
const db = require('../Config/Db'); // Importa la conexión a la base de datos
const router = express.Router();
 
// Ruta para probar la conexión a la base de datos
router.get('/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT VERSION() AS mysqlVersion');
    res.json({
      success: true,
      message: 'Conexión a la base de datos exitosa!',
      mysqlVersion: rows[0].mysqlVersion,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al conectar a la base de datos',
      error: error.message,
    });
  }
});

module.exports = router;