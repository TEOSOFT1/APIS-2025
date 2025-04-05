const db = require("../Config/db")
const Venta = db.Venta
const Cliente = db.Cliente
const Usuario = db.Usuario
const DetalleVenta = db.DetalleVenta
const DetalleVentaServicio = db.DetalleVentaServicio
const Producto = db.Producto
const Servicio = db.Servicio
const Mascota = db.Mascota
const { Op } = db.Sequelize

// Obtener todas las ventas
exports.getAllVentas = async (req, res) => {
  try {
    const ventas = await Venta.findAll({
      include: [
        { model: Cliente },
        { model: Usuario },
        {
          model: DetalleVenta,
          as: "DetallesVenta",
          include: [{ model: Producto, as: "Producto" }],
        },
        {
          model: DetalleVentaServicio,
          as: "DetallesVentaServicio",
          include: [{ model: Servicio, as: "Servicio" }, { model: Mascota }],
        },
      ],
    })
    res.status(200).json(ventas)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Error al obtener las ventas", error: error.message })
  }
}

// Obtener una venta por ID
exports.getVentaById = async (req, res) => {
  try {
    const { id } = req.params
    const venta = await Venta.findByPk(id, {
      include: [
        { model: Cliente },
        { model: Usuario },
        {
          model: DetalleVenta,
          as: "DetallesVenta",
          include: [{ model: Producto, as: "Producto" }],
        },
        {
          model: DetalleVentaServicio,
          as: "DetallesVentaServicio",
          include: [{ model: Servicio, as: "Servicio" }, { model: Mascota }],
        },
      ],
    })

    if (!venta) {
      return res.status(404).json({ message: "Venta no encontrada" })
    }

    res.status(200).json(venta)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Error al obtener la venta", error: error.message })
  }
}

// Obtener ventas por cliente
exports.getVentasByCliente = async (req, res) => {
  try {
    const { clienteId } = req.params

    // Verificar que el cliente existe
    const clienteExiste = await Cliente.findByPk(clienteId)
    if (!clienteExiste) {
      return res.status(404).json({ message: "Cliente no encontrado" })
    }

    const ventas = await Venta.findAll({
      where: { IdCliente: clienteId },
      include: [
        { model: Cliente },
        { model: Usuario },
        {
          model: DetalleVenta,
          as: "DetallesVenta",
          include: [{ model: Producto, as: "Producto" }],
        },
        {
          model: DetalleVentaServicio,
          as: "DetallesVentaServicio",
          include: [{ model: Servicio, as: "Servicio" }, { model: Mascota }],
        },
      ],
    })

    res.status(200).json(ventas)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Error al obtener las ventas del cliente", error: error.message })
  }
}

// Obtener ventas por usuario
exports.getVentasByUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params

    // Verificar que el usuario existe
    const usuarioExiste = await Usuario.findByPk(usuarioId)
    if (!usuarioExiste) {
      return res.status(404).json({ message: "Usuario no encontrado" })
    }

    const ventas = await Venta.findAll({
      where: { IdUsuario: usuarioId },
      include: [
        { model: Cliente },
        { model: Usuario },
        {
          model: DetalleVenta,
          as: "DetallesVenta",
          include: [{ model: Producto, as: "Producto" }],
        },
        {
          model: DetalleVentaServicio,
          as: "DetallesVentaServicio",
          include: [{ model: Servicio, as: "Servicio" }, { model: Mascota }],
        },
      ],
    })

    res.status(200).json(ventas)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Error al obtener las ventas del usuario", error: error.message })
  }
}

// Obtener ventas por fecha
exports.getVentasByFecha = async (req, res) => {
  try {
    const { desde, hasta } = req.query

    if (!desde || !hasta) {
      return res.status(400).json({
        success: false,
        message: "Se requieren las fechas 'desde' y 'hasta'",
      })
    }

    const fechaDesde = new Date(desde)
    const fechaHasta = new Date(hasta)

    // Ajustar fechaHasta para incluir todo el día
    fechaHasta.setHours(23, 59, 59, 999)

    if (isNaN(fechaDesde.getTime()) || isNaN(fechaHasta.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Formato de fecha inválido",
      })
    }

    const ventas = await Venta.findAll({
      where: {
        FechaVenta: {
          [Op.between]: [fechaDesde, fechaHasta],
        },
      },
      include: [
        { model: Cliente },
        { model: Usuario },
        {
          model: DetalleVenta,
          as: "DetallesVenta",
          include: [{ model: Producto, as: "Producto" }],
        },
        {
          model: DetalleVentaServicio,
          as: "DetallesVentaServicio",
          include: [{ model: Servicio, as: "Servicio" }, { model: Mascota }],
        },
      ],
    })

    if (ventas.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No se encontraron ventas en el rango de fechas especificado",
      })
    }

    res.status(200).json({
      success: true,
      data: ventas,
    })
  } catch (error) {
    console.error("Error en getVentasByFecha:", error)
    res.status(500).json({
      success: false,
      message: "Error al obtener ventas por fecha",
      error: error.message,
    })
  }
}

// Crear una nueva venta
exports.createVenta = async (req, res) => {
  try {
    const { IdCliente, IdUsuario, detallesProductos, detallesServicios, Tipo, IdVentaOriginal } = req.body

    // Validar campos requeridos
    if (!IdCliente || !IdUsuario) {
      return res.status(400).json({ message: "IdCliente e IdUsuario son obligatorios" })
    }

    // Validar que al menos hay un detalle de producto o servicio
    if ((!detallesProductos || !detallesProductos.length) && (!detallesServicios || !detallesServicios.length)) {
      return res.status(400).json({ message: "Se requiere al menos un detalle de producto o servicio" })
    }

    // Verificar que el cliente existe
    const clienteExiste = await Cliente.findByPk(IdCliente)
    if (!clienteExiste) {
      return res.status(404).json({ message: "Cliente no encontrado" })
    }

    // Verificar que el usuario existe
    const usuarioExiste = await Usuario.findByPk(IdUsuario)
    if (!usuarioExiste) {
      return res.status(404).json({ message: "Usuario no encontrado" })
    }

    // Validar tipo de venta
    const tipoVenta = Tipo || "Venta"
    if (!["Venta", "Devolucion"].includes(tipoVenta)) {
      return res.status(400).json({ message: "El tipo debe ser 'Venta' o 'Devolucion'" })
    }

    // Si es una devolución, verificar que existe la venta original
    if (tipoVenta === "Devolucion") {
      if (!IdVentaOriginal) {
        return res.status(400).json({ message: "Para una devolución, se requiere el ID de la venta original" })
      }

      const ventaOriginalExiste = await Venta.findByPk(IdVentaOriginal)
      if (!ventaOriginalExiste) {
        return res.status(404).json({ message: "Venta original no encontrada" })
      }

      if (ventaOriginalExiste.Tipo === "Devolucion") {
        return res.status(400).json({ message: "No se puede hacer una devolución de otra devolución" })
      }
    }

    // Calcular totales iniciales
    let subtotal = 0
    let totalIva = 0
    let totalMonto = 0

    // Crear la venta
    const nuevaVenta = await Venta.create({
      IdCliente,
      IdUsuario,
      FechaVenta: new Date(),
      Subtotal: subtotal,
      TotalIva: totalIva,
      TotalMonto: totalMonto,
      Estado: "Efectiva",
      Tipo: tipoVenta,
      IdVentaOriginal: tipoVenta === "Devolucion" ? IdVentaOriginal : null,
    })

    // Procesar detalles de productos
    if (detallesProductos && detallesProductos.length > 0) {
      for (const detalle of detallesProductos) {
        if (!detalle.IdProducto || !detalle.Cantidad || !detalle.PrecioUnitario) {
          return res
            .status(400)
            .json({ message: "Cada detalle de producto debe tener IdProducto, Cantidad y PrecioUnitario" })
        }

        // Verificar que el producto existe
        const producto = await Producto.findByPk(detalle.IdProducto)
        if (!producto) {
          return res.status(404).json({ message: `Producto con ID ${detalle.IdProducto} no encontrado` })
        }

        // Validar que la cantidad sea positiva
        if (detalle.Cantidad <= 0) {
          return res.status(400).json({ message: "La cantidad debe ser mayor que 0" })
        }

        // Validar que el precio unitario sea positivo
        if (detalle.PrecioUnitario < 0) {
          return res.status(400).json({ message: "El precio unitario no puede ser negativo" })
        }

        // Si es una venta, verificar stock
        if (tipoVenta === "Venta" && producto.Stock < detalle.Cantidad) {
          return res.status(400).json({
            message: `Stock insuficiente para el producto ${producto.NombreProducto}. Disponible: ${producto.Stock}`,
          })
        }

        // Calcular subtotal
        const subtotalDetalle = detalle.Cantidad * detalle.PrecioUnitario

        // Calcular IVA unitario
        const ivaUnitario = producto.AplicaIVA ? (detalle.PrecioUnitario * producto.PorcentajeIVA) / 100 : 0

        // Calcular subtotal con IVA
        const subtotalConIva =
          subtotalDetalle + subtotalDetalle * (producto.AplicaIVA ? producto.PorcentajeIVA / 100 : 0)

        await DetalleVenta.create({
          IdVenta: nuevaVenta.IdVenta,
          IdProducto: detalle.IdProducto,
          Cantidad: detalle.Cantidad,
          PrecioUnitario: detalle.PrecioUnitario,
          Subtotal: subtotalDetalle,
          IvaUnitario: ivaUnitario,
          SubtotalConIva: subtotalConIva,
        })

        // Actualizar stock del producto
        if (tipoVenta === "Venta") {
          await producto.update({
            Stock: producto.Stock - detalle.Cantidad,
          })
        } else if (tipoVenta === "Devolucion") {
          await producto.update({
            Stock: producto.Stock + detalle.Cantidad,
          })
        }

        // Actualizar totales
        subtotal += subtotalDetalle
        totalIva += subtotalDetalle * (producto.AplicaIVA ? producto.PorcentajeIVA / 100 : 0)
        totalMonto += subtotalConIva
      }
    }

    // Procesar detalles de servicios
    if (detallesServicios && detallesServicios.length > 0) {
      for (const detalle of detallesServicios) {
        if (!detalle.IdServicio || !detalle.IdMascota || !detalle.Cantidad || !detalle.PrecioUnitario) {
          return res
            .status(400)
            .json({ message: "Cada detalle de servicio debe tener IdServicio, IdMascota, Cantidad y PrecioUnitario" })
        }

        // Verificar que el servicio existe
        const servicio = await Servicio.findByPk(detalle.IdServicio)
        if (!servicio) {
          return res.status(404).json({ message: `Servicio con ID ${detalle.IdServicio} no encontrado` })
        }

        // Verificar que la mascota existe
        const mascota = await Mascota.findByPk(detalle.IdMascota)
        if (!mascota) {
          return res.status(404).json({ message: `Mascota con ID ${detalle.IdMascota} no encontrada` })
        }

        // Validar que la cantidad sea positiva
        if (detalle.Cantidad <= 0) {
          return res.status(400).json({ message: "La cantidad debe ser mayor que 0" })
        }

        // Validar que el precio unitario sea positivo
        if (detalle.PrecioUnitario < 0) {
          return res.status(400).json({ message: "El precio unitario no puede ser negativo" })
        }

        // Calcular subtotal
        const subtotalDetalle = detalle.Cantidad * detalle.PrecioUnitario

        await DetalleVentaServicio.create({
          IdVenta: nuevaVenta.IdVenta,
          IdServicio: detalle.IdServicio,
          IdMascota: detalle.IdMascota,
          Cantidad: detalle.Cantidad,
          PrecioUnitario: detalle.PrecioUnitario,
          Subtotal: subtotalDetalle,
        })

        // Actualizar totales
        subtotal += subtotalDetalle
        totalMonto += subtotalDetalle
      }
    }

    // Actualizar totales en la venta
    await nuevaVenta.update({
      Subtotal: subtotal,
      TotalIva: totalIva,
      TotalMonto: totalMonto,
    })

    // Obtener la venta creada con sus relaciones
    const ventaCreada = await Venta.findByPk(nuevaVenta.IdVenta, {
      include: [
        { model: Cliente },
        { model: Usuario },
        {
          model: DetalleVenta,
          as: "DetallesVenta",
          include: [{ model: Producto, as: "Producto" }],
        },
        {
          model: DetalleVentaServicio,
          as: "DetallesVentaServicio",
          include: [{ model: Servicio, as: "Servicio" }, { model: Mascota }],
        },
      ],
    })

    res.status(201).json({ message: "Venta creada exitosamente", data: ventaCreada })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Error al crear la venta", error: error.message })
  }
}

// Devolver una venta (crear una devolución)
exports.devolverVenta = async (req, res) => {
  try {
    const { id } = req.params

    // Validar que la venta existe
    const venta = await Venta.findByPk(id, {
      include: [
        {
          model: DetalleVenta,
          as: "DetallesVenta",
          include: [{ model: Producto, as: "Producto" }],
        },
        {
          model: DetalleVentaServicio,
          as: "DetallesVentaServicio",
          include: [{ model: Servicio, as: "Servicio" }],
        },
      ],
    })

    if (!venta) {
      return res.status(404).json({
        success: false,
        message: "Venta no encontrada",
      })
    }

    // Validar que no sea una devolución
    if (venta.Tipo === "Devolucion") {
      return res.status(400).json({
        success: false,
        message: "No se puede hacer una devolución de otra devolución",
      })
    }

    // Validar que la venta esté efectiva
    if (venta.Estado !== "Efectiva") {
      return res.status(400).json({
        success: false,
        message: `No se puede devolver una venta en estado ${venta.Estado}`,
      })
    }

    // Crear la devolución
    const devolucion = await Venta.create({
      IdCliente: venta.IdCliente,
      IdUsuario: venta.IdUsuario,
      FechaVenta: new Date(),
      Subtotal: venta.Subtotal,
      TotalIva: venta.TotalIva,
      TotalMonto: venta.TotalMonto,
      NotasAdicionales: venta.NotasAdicionales || "",
      ComprobantePago: venta.ComprobantePago || "",
      Estado: "Efectiva",
      Tipo: "Devolucion",
      IdVentaOriginal: venta.IdVenta,
    })

    // Devolver productos al inventario
    if (venta.DetallesVenta && venta.DetallesVenta.length > 0) {
      for (const detalle of venta.DetallesVenta) {
        // Crear detalle de devolución
        await DetalleVenta.create({
          IdVenta: devolucion.IdVenta,
          IdProducto: detalle.IdProducto,
          Cantidad: detalle.Cantidad,
          PrecioUnitario: detalle.PrecioUnitario,
          Subtotal: detalle.Subtotal,
          IvaUnitario: detalle.IvaUnitario,
          SubtotalConIva: detalle.SubtotalConIva,
        })

        // Actualizar stock
        const producto = await Producto.findByPk(detalle.IdProducto)
        if (producto) {
          producto.Stock += detalle.Cantidad
          await producto.save()
        }
      }
    }

    // Devolver servicios (solo registro, no hay stock que actualizar)
    if (venta.DetallesVentaServicio && venta.DetallesVentaServicio.length > 0) {
      for (const detalle of venta.DetallesVentaServicio) {
        await DetalleVentaServicio.create({
          IdVenta: devolucion.IdVenta,
          IdServicio: detalle.IdServicio,
          IdMascota: detalle.IdMascota,
          Cantidad: detalle.Cantidad,
          PrecioUnitario: detalle.PrecioUnitario,
          Subtotal: detalle.Subtotal,
        })
      }
    }

    // Actualizar estado de la venta original
    venta.Estado = "Devuelta"
    await venta.save()

    res.status(200).json({
      success: true,
      message: "Venta devuelta correctamente",
      data: {
        ventaOriginal: venta,
        devolucion: devolucion,
      },
    })
  } catch (error) {
    console.error("Error en devolverVenta:", error)
    res.status(500).json({
      success: false,
      message: "Error al devolver la venta",
      error: error.message,
    })
  }
}

// Anular una venta (cambiar estado a Cancelada)
exports.anularVenta = async (req, res) => {
  try {
    const { id } = req.params
    const venta = await Venta.findByPk(id, {
      include: [
        {
          model: DetalleVenta,
          as: "DetallesVenta",
        },
      ],
    })

    if (!venta) {
      return res.status(404).json({ message: "Venta no encontrada" })
    }

    // Verificar que la venta no esté ya cancelada
    if (venta.Estado === "Cancelada") {
      return res.status(400).json({ message: "La venta ya está cancelada" })
    }

    // Verificar que la venta no esté devuelta
    if (venta.Estado === "Devuelta") {
      return res.status(400).json({ message: "No se puede anular una venta que ya ha sido devuelta" })
    }

    // Si la venta es efectiva, revertir el stock
    if (venta.Estado === "Efectiva") {
      if (venta.Tipo === "Venta") {
        // Si era una venta, devolver el stock
        for (const detalle of venta.DetallesVenta) {
          const producto = await Producto.findByPk(detalle.IdProducto)

          // Aumentar el stock
          await producto.update({
            Stock: producto.Stock + detalle.Cantidad,
          })
        }
      } else if (venta.Tipo === "Devolucion") {
        // Si era una devolución, quitar el stock
        for (const detalle of venta.DetallesVenta) {
          const producto = await Producto.findByPk(detalle.IdProducto)

          // Disminuir el stock
          await producto.update({
            Stock: Math.max(0, producto.Stock - detalle.Cantidad),
          })
        }
      }
    }

    // Actualizar estado de la venta a Cancelada
    await venta.update({ Estado: "Cancelada" })

    // Si era una devolución, actualizar el estado de la venta original
    if (venta.Tipo === "Devolucion" && venta.IdVentaOriginal) {
      const ventaOriginal = await Venta.findByPk(venta.IdVentaOriginal)
      if (ventaOriginal && ventaOriginal.Estado === "Devuelta") {
        await ventaOriginal.update({ Estado: "Efectiva" })
      }
    }

    const ventaActualizada = await Venta.findByPk(id, {
      include: [
        { model: Cliente },
        { model: Usuario },
        {
          model: DetalleVenta,
          as: "DetallesVenta",
          include: [{ model: Producto, as: "Producto" }],
        },
        {
          model: DetalleVentaServicio,
          as: "DetallesVentaServicio",
          include: [{ model: Servicio, as: "Servicio" }, { model: Mascota }],
        },
      ],
    })

    res.status(200).json({ message: "Venta anulada exitosamente", data: ventaActualizada })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Error al anular la venta", error: error.message })
  }
}

// Actualizar el estado de una venta
exports.updateVentaEstado = async (req, res) => {
  try {
    const { id } = req.params
    const { Estado } = req.body

    // Validar que el estado sea válido
    if (!["Efectiva", "Pendiente", "Cancelada", "Devuelta"].includes(Estado)) {
      return res.status(400).json({ message: "El estado debe ser 'Efectiva', 'Pendiente', 'Cancelada' o 'Devuelta'" })
    }

    const venta = await Venta.findByPk(id, {
      include: [
        {
          model: DetalleVenta,
          as: "DetallesVenta",
        },
      ],
    })

    if (!venta) {
      return res.status(404).json({ message: "Venta no encontrada" })
    }

    const estadoAnterior = venta.Estado

    // Si se está cancelando una venta efectiva, revertir el stock
    if (estadoAnterior === "Efectiva" && (Estado === "Cancelada" || Estado === "Devuelta")) {
      if (venta.Tipo === "Venta") {
        // Si era una venta, devolver el stock
        for (const detalle of venta.DetallesVenta) {
          const producto = await Producto.findByPk(detalle.IdProducto)

          // Aumentar el stock
          await producto.update({
            Stock: producto.Stock + detalle.Cantidad,
          })
        }
      } else if (venta.Tipo === "Devolucion") {
        // Si era una devolución, quitar el stock
        for (const detalle of venta.DetallesVenta) {
          const producto = await Producto.findByPk(detalle.IdProducto)

          // Disminuir el stock
          await producto.update({
            Stock: Math.max(0, producto.Stock - detalle.Cantidad),
          })
        }
      }
    }
    // Si se está reactivando una venta cancelada, ajustar el stock
    else if ((estadoAnterior === "Cancelada" || estadoAnterior === "Devuelta") && Estado === "Efectiva") {
      if (venta.Tipo === "Venta") {
        // Si es una venta, quitar el stock
        for (const detalle of venta.DetallesVenta) {
          const producto = await Producto.findByPk(detalle.IdProducto)

          // Verificar stock
          if (producto.Stock < detalle.Cantidad) {
            return res.status(400).json({
              message: `Stock insuficiente para el producto ${producto.NombreProducto}. Disponible: ${producto.Stock}`,
            })
          }

          // Disminuir el stock
          await producto.update({
            Stock: producto.Stock - detalle.Cantidad,
          })
        }
      } else if (venta.Tipo === "Devolucion") {
        // Si es una devolución, aumentar el stock
        for (const detalle of venta.DetallesVenta) {
          const producto = await Producto.findByPk(detalle.IdProducto)

          // Aumentar el stock
          await producto.update({
            Stock: producto.Stock + detalle.Cantidad,
          })
        }
      }
    }

    await venta.update({ Estado })

    const ventaActualizada = await Venta.findByPk(id, {
      include: [
        { model: Cliente },
        { model: Usuario },
        {
          model: DetalleVenta,
          as: "DetallesVenta",
          include: [{ model: Producto, as: "Producto" }],
        },
        {
          model: DetalleVentaServicio,
          as: "DetallesVentaServicio",
          include: [{ model: Servicio, as: "Servicio" }, { model: Mascota }],
        },
      ],
    })

    res.status(200).json({ message: "Estado de venta actualizado exitosamente", data: ventaActualizada })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Error al actualizar el estado de la venta", error: error.message })
  }
}

// Eliminar una venta
exports.deleteVenta = async (req, res) => {
  try {
    const { id } = req.params
    const venta = await Venta.findByPk(id, {
      include: [
        {
          model: DetalleVenta,
          as: "DetallesVenta",
        },
      ],
    })

    if (!venta) {
      return res.status(404).json({ message: "Venta no encontrada" })
    }

    // Si la venta es efectiva, revertir el stock
    if (venta.Estado === "Efectiva") {
      if (venta.Tipo === "Venta") {
        // Si era una venta, devolver el stock
        for (const detalle of venta.DetallesVenta) {
          const producto = await Producto.findByPk(detalle.IdProducto)

          // Aumentar el stock
          await producto.update({
            Stock: producto.Stock + detalle.Cantidad,
          })
        }
      } else if (venta.Tipo === "Devolucion") {
        // Si era una devolución, quitar el stock
        for (const detalle of venta.DetallesVenta) {
          const producto = await Producto.findByPk(detalle.IdProducto)

          // Disminuir el stock
          await producto.update({
            Stock: Math.max(0, producto.Stock - detalle.Cantidad),
          })
        }
      }
    }

    // Eliminar los detalles de venta
    await DetalleVenta.destroy({
      where: { IdVenta: id },
    })

    // Eliminar los detalles de venta de servicios
    await DetalleVentaServicio.destroy({
      where: { IdVenta: id },
    })

    // Eliminar la venta
    await venta.destroy()

    res.status(200).json({ message: "Venta eliminada exitosamente" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Error al eliminar la venta", error: error.message })
  }
}

