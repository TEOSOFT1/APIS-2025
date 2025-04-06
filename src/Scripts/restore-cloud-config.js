// restore-cloud-config.js
// Script para restaurar la configuración de Google Cloud en caso de necesitarlo

require("dotenv").config()
const fs = require("fs")
const path = require("path")

// Ruta al archivo de configuración de la base de datos
const dbConfigPath = path.join(__dirname, "src", "Config", "db.js")

// Leer el contenido actual del archivo
let dbContent = fs.readFileSync(dbConfigPath, "utf8")

// Reemplazar la configuración para usar la base de datos en Google Cloud
dbContent = dbContent.replace(
  /const sequelize = new Sequelize\(process\.env\.DB_LOCAL_NAME, process\.env\.DB_LOCAL_USER, process\.env\.DB_LOCAL_PASSWORD, {/g,
  "const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {",
)

dbContent = dbContent.replace(/host: process\.env\.DB_LOCAL_HOST,/g, "host: process.env.DB_HOST,")

dbContent = dbContent.replace(/port: process\.env\.DB_LOCAL_PORT \|\| 3306,/g, "port: process.env.DB_PORT || 3306,")

// Modificar la función testConnection
dbContent = dbContent.replace(
  /console\.log$$"✅ Conexión a MySQL LOCAL exitosa con Sequelize"$$;/g,
  'console.log("✅ Conexión a MySQL en GOOGLE CLOUD exitosa con Sequelize");',
)

dbContent = dbContent.replace(
  /console\.log$$` {3}Host: \${process\.env\.DB_LOCAL_HOST}`$$;/g,
  "console.log(`   Host: ${process.env.DB_HOST}`);",
)

dbContent = dbContent.replace(
  /console\.log$$` {3}Base de datos: \${process\.env\.DB_LOCAL_NAME}`$$;/g,
  "console.log(`   Base de datos: ${process.env.DB_NAME}`);",
)

dbContent = dbContent.replace(
  /console\.log$$` {3}Usuario: \${process\.env\.DB_LOCAL_USER}`$$;/g,
  "console.log(`   Usuario: ${process.env.DB_USER}`);",
)

// Guardar el archivo modificado
fs.writeFileSync(dbConfigPath, dbContent)

console.log("✅ Configuración restaurada a base de datos en Google Cloud")
console.log(`   Host: ${process.env.DB_HOST}`)
console.log(`   Base de datos: ${process.env.DB_NAME}`)
console.log(`   Usuario: ${process.env.DB_USER}`)
console.log("")
console.log("Para verificar la conexión, ejecuta:")
console.log("node connection-status.js")

//node restore-cloud-config.js//
//en caso de que quiera restaurar el antiguo nuevamente  