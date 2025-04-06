// connection-status.js
// Script para verificar el estado de la conexión a la base de datos

require("dotenv").config()
const db = require("./src/Config/db")

async function checkConnection() {
  console.log("🔍 Verificando conexión a la base de datos...")

  try {
    const connected = await db.testConnection()

    if (connected) {
      console.log("✅ Conexión exitosa a la base de datos")

      // Mostrar información de la conexión
      console.log("\nInformación de la conexión:")
      console.log("------------------------")
      console.log(`Host: ${process.env.DB_LOCAL_HOST}`)
      console.log(`Puerto: ${process.env.DB_LOCAL_PORT}`)
      console.log(`Base de datos: ${process.env.DB_LOCAL_NAME}`)
      console.log(`Usuario: ${process.env.DB_LOCAL_USER}`)

      // Verificar tablas existentes
      try {
        const [results] = await db.sequelize.query("SHOW TABLES")
        console.log("\nTablas en la base de datos:")
        console.log("------------------------")

        if (results.length === 0) {
          console.log("No se encontraron tablas en la base de datos.")
        } else {
          results.forEach((row, index) => {
            const tableName = row[`Tables_in_${process.env.DB_LOCAL_NAME}`]
            console.log(`${index + 1}. ${tableName}`)
          })
        }
      } catch (error) {
        console.error("Error al consultar las tablas:", error.message)
      }
    } else {
      console.error("❌ No se pudo conectar a la base de datos")
    }
  } catch (error) {
    console.error("❌ Error al verificar la conexión:", error)
  } finally {
    // Cerrar la conexión
    await db.sequelize.close()
    process.exit(0)
  }
}

checkConnection()

