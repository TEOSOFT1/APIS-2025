const db = require("../Config/db")

// Verificar la estructura de las tablas
exports.verificarEstructura = async (req, res) => {
  try {
    // Obtener la estructura de las tablas desde la base de datos
    const [estructuraDetalleCompras] = await db.sequelize.query("DESCRIBE DetalleCompras")
    const [estructuraProductos] = await db.sequelize.query("DESCRIBE Productos")
    const [estructuraCompras] = await db.sequelize.query("DESCRIBE Compras")

    // Obtener una muestra de datos para ver los valores reales
    const [muestraDetalleCompras] = await db.sequelize.query("SELECT * FROM DetalleCompras LIMIT 1")

    res.json({
      message: "Estructura de las tablas",
      DetalleCompras: {
        estructura: estructuraDetalleCompras,
        muestra: muestraDetalleCompras,
      },
      Productos: estructuraProductos,
      Compras: estructuraCompras,
    })
  } catch (error) {
    console.error("Error al verificar estructura:", error)
    res.status(500).json({
      message: "Error al verificar estructura de las tablas",
      error: error.message,
    })
  }
}

// Obtener todos los detalles de compras
exports.getAllDetalleCompras = async (req, res) => {
  try {
    // Consulta simple sin JOIN para evitar problemas con nombres de columnas
    const [detalles] = await db.sequelize.query(`
      SELECT * FROM DetalleCompras
    `)

    if (detalles.length === 0) {
      return res.status(200).json({ message: "No hay detalles de compras registrados" })
    }

    res.json(detalles)
  } catch (error) {
    console.error("Error en getAllDetalleCompras:", error)
    res.status(500).json({
      message: "Error obteniendo detalles de compras",
      error: error.message,
    })
  }
}

// Obtener un detalle específico por su ID
exports.getDetalleById = async (req, res) => {
  try {
    const { idDetalle } = req.params

    // Primero, obtener una muestra para ver la estructura
    const [muestra] = await db.sequelize.query("SELECT * FROM DetalleCompras LIMIT 1")

    // Determinar el nombre de la columna ID
    let idColumnName = "id" // Valor predeterminado
    if (muestra.length > 0) {
      const primeraFila = muestra[0]
      // Buscar una columna que parezca ser el ID
      for (const key in primeraFila) {
        if (key.toLowerCase().includes("id") && key.toLowerCase().includes("detalle")) {
          idColumnName = key
          break
        }
      }
    }

    // Consulta para obtener un detalle específico
    const [detalles] = await db.sequelize.query(
      `
      SELECT * FROM DetalleCompras
      WHERE ${idColumnName} = :idDetalle
    `,
      {
        replacements: { idDetalle },
      },
    )

    if (detalles.length === 0) {
      return res.status(404).json({ message: "Detalle de compra no encontrado" })
    }

    res.json(detalles[0])
  } catch (error) {
    console.error("Error en getDetalleById:", error)
    res.status(500).json({
      message: "Error obteniendo detalle de compra",
      error: error.message,
    })
  }
}

// Obtener detalles de una compra por ID
exports.getDetallesByCompra = async (req, res) => {
  try {
    const { idCompra } = req.params

    // Consulta simple sin JOIN para evitar problemas con nombres de columnas
    const [detalles] = await db.sequelize.query(
      `
      SELECT * FROM DetalleCompras
      WHERE IdCompra = :idCompra
    `,
      {
        replacements: { idCompra },
      },
    )

    if (detalles.length === 0) {
      return res.status(404).json({ message: "No hay detalles para esta compra" })
    }

    res.json(detalles)
  } catch (error) {
    console.error("Error en getDetallesByCompra:", error)
    res.status(500).json({
      message: "Error obteniendo detalles de la compra",
      error: error.message,
    })
  }
}

// Agregar un detalle a una compra existente
exports.addDetalleCompra = async (req, res) => {
  try {
    const { IdCompra, IdProducto, Cantidad, PrecioUnitario } = req.body

    if (!IdCompra || !IdProducto || !Cantidad || !PrecioUnitario) {
      return res.status(400).json({ message: "Datos incompletos para agregar detalle" })
    }

    // Verificar que la compra existe
    const [compras] = await db.sequelize.query(
      `
      SELECT * FROM Compras WHERE IdCompra = :IdCompra
    `,
      {
        replacements: { IdCompra },
      },
    )

    if (compras.length === 0) {
      return res.status(404).json({ message: "Compra no encontrada" })
    }

    // Verificar que el producto existe
    const [productos] = await db.sequelize.query(
      `
      SELECT * FROM Productos WHERE IdProducto = :IdProducto
    `,
      {
        replacements: { IdProducto },
      },
    )

    if (productos.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" })
    }

    // Calcular subtotales e IVA
    const Subtotal = Cantidad * PrecioUnitario
    const IvaUnitario = PrecioUnitario * 0.16 // Asumiendo IVA del 16%
    const SubtotalConIva = Subtotal + IvaUnitario * Cantidad

    // Insertar el detalle de compra
    const [result] = await db.sequelize.query(
      `
      INSERT INTO DetalleCompras (IdCompra, IdProducto, Cantidad, PrecioUnitario, Subtotal, IvaUnitario, SubtotalConIva)
      VALUES (:IdCompra, :IdProducto, :Cantidad, :PrecioUnitario, :Subtotal, :IvaUnitario, :SubtotalConIva)
    `,
      {
        replacements: {
          IdCompra,
          IdProducto,
          Cantidad,
          PrecioUnitario,
          Subtotal,
          IvaUnitario,
          SubtotalConIva,
        },
      },
    )

    // Actualizar stock del producto
    await db.sequelize.query(
      `
      UPDATE Productos 
      SET Stock = Stock + :Cantidad 
      WHERE IdProducto = :IdProducto
    `,
      {
        replacements: { Cantidad, IdProducto },
      },
    )

    // Obtener el detalle recién creado sin usar ORDER BY
    const [nuevoDetalle] = await db.sequelize.query(
      `
      SELECT * FROM DetalleCompras 
      WHERE IdCompra = :IdCompra AND IdProducto = :IdProducto
    `,
      {
        replacements: { IdCompra, IdProducto },
      },
    )

    res.status(201).json({
      message: "Detalle de compra agregado correctamente",
      detalle: nuevoDetalle.length > 0 ? nuevoDetalle[nuevoDetalle.length - 1] : {},
    })
  } catch (error) {
    console.error("Error en addDetalleCompra:", error)
    res.status(500).json({
      message: "Error agregando detalle de compra",
      error: error.message,
    })
  }
}

// Actualizar un detalle de compra
exports.updateDetalleCompra = async (req, res) => {
  try {
    const { idDetalle } = req.params
    const { Cantidad, PrecioUnitario } = req.body

    // Primero, obtener una muestra para ver la estructura
    const [muestra] = await db.sequelize.query("SELECT * FROM DetalleCompras LIMIT 1")

    // Determinar el nombre de la columna ID
    let idColumnName = "id" // Valor predeterminado
    if (muestra.length > 0) {
      const primeraFila = muestra[0]
      // Buscar una columna que parezca ser el ID
      for (const key in primeraFila) {
        if (key.toLowerCase().includes("id") && key.toLowerCase().includes("detalle")) {
          idColumnName = key
          break
        }
      }
    }

    // Verificar que el detalle existe
    const [detalles] = await db.sequelize.query(
      `
      SELECT * FROM DetalleCompras WHERE ${idColumnName} = :idDetalle
    `,
      {
        replacements: { idDetalle },
      },
    )

    if (detalles.length === 0) {
      return res.status(404).json({ message: "Detalle de compra no encontrado" })
    }

    const detalle = detalles[0]
    const cantidadAnterior = detalle.Cantidad
    const IdProducto = detalle.IdProducto

    // Calcular nuevos subtotales e IVA
    const Subtotal = Cantidad * PrecioUnitario
    const IvaUnitario = PrecioUnitario * 0.16 // Asumiendo IVA del 16%
    const SubtotalConIva = Subtotal + IvaUnitario * Cantidad

    // Actualizar el detalle
    await db.sequelize.query(
      `
      UPDATE DetalleCompras 
      SET Cantidad = :Cantidad, 
          PrecioUnitario = :PrecioUnitario,
          Subtotal = :Subtotal,
          IvaUnitario = :IvaUnitario,
          SubtotalConIva = :SubtotalConIva
      WHERE ${idColumnName} = :idDetalle
    `,
      {
        replacements: {
          idDetalle,
          Cantidad,
          PrecioUnitario,
          Subtotal,
          IvaUnitario,
          SubtotalConIva,
        },
      },
    )

    // Ajustar el stock del producto
    const diferenciaCantidad = Cantidad - cantidadAnterior
    if (diferenciaCantidad !== 0) {
      await db.sequelize.query(
        `
        UPDATE Productos 
        SET Stock = Stock + :diferenciaCantidad 
        WHERE IdProducto = :IdProducto
      `,
        {
          replacements: { diferenciaCantidad, IdProducto },
        },
      )
    }

    // Obtener el detalle actualizado
    const [detalleActualizado] = await db.sequelize.query(
      `
      SELECT * FROM DetalleCompras WHERE ${idColumnName} = :idDetalle
    `,
      {
        replacements: { idDetalle },
      },
    )

    res.json({
      message: "Detalle de compra actualizado correctamente",
      detalle: detalleActualizado[0] || {},
    })
  } catch (error) {
    console.error("Error en updateDetalleCompra:", error)
    res.status(500).json({
      message: "Error actualizando detalle de compra",
      error: error.message,
    })
  }
}

// Eliminar un detalle de compra
exports.deleteDetalleCompra = async (req, res) => {
  try {
    const { idDetalle } = req.params

    // Primero, obtener una muestra para ver la estructura
    const [muestra] = await db.sequelize.query("SELECT * FROM DetalleCompras LIMIT 1")

    // Determinar el nombre de la columna ID
    let idColumnName = "id" // Valor predeterminado
    if (muestra.length > 0) {
      const primeraFila = muestra[0]
      // Buscar una columna que parezca ser el ID
      for (const key in primeraFila) {
        if (key.toLowerCase().includes("id") && key.toLowerCase().includes("detalle")) {
          idColumnName = key
          break
        }
      }
    }

    // Verificar que el detalle existe
    const [detalles] = await db.sequelize.query(
      `
      SELECT * FROM DetalleCompras WHERE ${idColumnName} = :idDetalle
    `,
      {
        replacements: { idDetalle },
      },
    )

    if (detalles.length === 0) {
      return res.status(404).json({ message: "Detalle de compra no encontrado" })
    }

    const detalle = detalles[0]
    const cantidad = detalle.Cantidad
    const idProducto = detalle.IdProducto

    // Eliminar el detalle
    await db.sequelize.query(
      `
      DELETE FROM DetalleCompras WHERE ${idColumnName} = :idDetalle
    `,
      {
        replacements: { idDetalle },
      },
    )

    // Actualizar stock del producto (reducir)
    await db.sequelize.query(
      `
      UPDATE Productos 
      SET Stock = Stock - :cantidad 
      WHERE IdProducto = :idProducto
    `,
      {
        replacements: { cantidad, idProducto },
      },
    )

    res.json({ message: "Detalle de compra eliminado correctamente" })
  } catch (error) {
    console.error("Error en deleteDetalleCompra:", error)
    res.status(500).json({
      message: "Error eliminando detalle de compra",
      error: error.message,
    })
  }
}

