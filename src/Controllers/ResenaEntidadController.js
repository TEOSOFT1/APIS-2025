const db = require("../Config/db");
const ResenaEntidad = db.ResenaEntidad;
const Resena = db.Resena;
const Producto = db.Producto;
const Servicio = db.Servicio;
const Cliente = db.Cliente;
const { Op } = require("sequelize");

// Obtener todas las entidades de reseñas
exports.getAllResenasEntidades = async (req, res) => {
  try {
    const resenasEntidades = await ResenaEntidad.findAll({
      include: [
        {
          model: Resena,
          include: [{ model: Cliente }]
        },
        { model: Producto },
        { model: Servicio }
      ],
    });
    res.status(200).json({
      success: true,
      data: resenasEntidades
    });
  } catch (error) {
    console.error("Error en getAllResenasEntidades:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener las entidades de reseñas", 
      error: error.message 
    });
  }
};

// Obtener una entidad de reseña por ID
exports.getResenaEntidadById = async (req, res) => {
  try {
    const { id } = req.params;
    const resenaEntidad = await ResenaEntidad.findByPk(id, {
      include: [
        {
          model: Resena,
          include: [{ model: Cliente }]
        },
        { model: Producto },
        { model: Servicio }
      ],
    });

    if (!resenaEntidad) {
      return res.status(404).json({ 
        success: false,
        message: "Entidad de reseña no encontrada" 
      });
    }

    res.status(200).json({
      success: true,
      data: resenaEntidad
    });
  } catch (error) {
    console.error("Error en getResenaEntidadById:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener la entidad de reseña", 
      error: error.message 
    });
  }
};

// Obtener entidades de reseña por reseña
exports.getResenaEntidadesByResena = async (req, res) => {
  try {
    const { resenaId } = req.params;
    
    // Verificar que la reseña existe
    const resenaExiste = await Resena.findByPk(resenaId);
    if (!resenaExiste) {
      return res.status(404).json({ 
        success: false,
        message: "Reseña no encontrada" 
      });
    }
    
    const resenasEntidades = await ResenaEntidad.findAll({
      where: { IdReseña: resenaId },
      include: [
        { model: Producto },
        { model: Servicio }
      ],
    });

    res.status(200).json({
      success: true,
      data: resenasEntidades
    });
  } catch (error) {
    console.error("Error en getResenaEntidadesByResena:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener las entidades de la reseña", 
      error: error.message 
    });
  }
};

// Obtener entidades de reseña por producto
exports.getResenaEntidadesByProducto = async (req, res) => {
  try {
    const { productoId } = req.params;
    
    // Verificar que el producto existe
    const productoExiste = await Producto.findByPk(productoId);
    if (!productoExiste) {
      return res.status(404).json({ 
        success: false,
        message: "Producto no encontrado" 
      });
    }
    
    const resenasEntidades = await ResenaEntidad.findAll({
      where: { 
        IdProducto: productoId,
        TipoReseña: 'producto'
      },
      include: [
        {
          model: Resena,
          include: [{ model: Cliente }]
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: resenasEntidades
    });
  } catch (error) {
    console.error("Error en getResenaEntidadesByProducto:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener reseñas por producto",
      error: error.message
    });
  }
};

// Obtener entidades de reseña por servicio
exports.getResenaEntidadesByServicio = async (req, res) => {
  try {
    const { servicioId } = req.params;
    
    // Verificar que el servicio existe
    const servicioExiste = await Servicio.findByPk(servicioId);
    if (!servicioExiste) {
      return res.status(404).json({
        success: false,
        message: "Servicio no encontrado"
      });
    }
    
    const resenasEntidades = await ResenaEntidad.findAll({
      where: { 
        IdServicio: servicioId,
        TipoReseña: 'servicio'
      },
      include: [
        {
          model: Resena,
          include: [{ model: Cliente }]
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: resenasEntidades
    });
  } catch (error) {
    console.error("Error en getResenaEntidadesByServicio:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener reseñas por servicio",
      error: error.message
    });
  }
};

// Obtener entidades de reseña generales
exports.getResenasEntidadesGenerales = async (req, res) => {
  try {
    const resenasEntidades = await ResenaEntidad.findAll({
      where: { TipoReseña: 'general' },
      include: [
        { 
          model: Resena,
          include: [{ model: Cliente }]
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: resenasEntidades
    });
  } catch (error) {
    console.error("Error en getResenasEntidadesGenerales:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener reseñas generales",
      error: error.message
    });
  }
};

// Crear una nueva entidad de reseña
exports.createResenaEntidad = async (req, res) => {
  try {
    const { IdReseña, IdProducto, IdServicio, TipoReseña } = req.body;
    
    // Validar que TipoReseña sea válido
    if (!['producto', 'servicio', 'general'].includes(TipoReseña)) {
      return res.status(400).json({
        success: false,
        message: "TipoReseña debe ser 'producto', 'servicio' o 'general'"
      });
    }

    // Validar que la reseña existe
    const resena = await Resena.findByPk(IdReseña);
    if (!resena) {
      return res.status(404).json({
        success: false,
        message: "Reseña no encontrada"
      });
    }

    // Validar que el producto o servicio exista según el tipo
    if (TipoReseña === 'producto' && !IdProducto) {
      return res.status(400).json({
        success: false,
        message: "IdProducto es requerido para reseñas de tipo 'producto'"
      });
    }

    if (TipoReseña === 'servicio' && !IdServicio) {
      return res.status(400).json({
        success: false,
        message: "IdServicio es requerido para reseñas de tipo 'servicio'"
      });
    }

    // Validar que el producto existe si se proporciona
    if (IdProducto) {
      const producto = await Producto.findByPk(IdProducto);
      if (!producto) {
        return res.status(404).json({
          success: false,
          message: "Producto no encontrado"
        });
      }
    }

    // Validar que el servicio existe si se proporciona
    if (IdServicio) {
      const servicio = await Servicio.findByPk(IdServicio);
      if (!servicio) {
        return res.status(404).json({
          success: false,
          message: "Servicio no encontrado"
        });
      }
    }

    // Crear la entidad de reseña
    const resenaEntidad = await ResenaEntidad.create({
      IdReseña,
      IdProducto: TipoReseña === 'producto' ? IdProducto : null,
      IdServicio: TipoReseña === 'servicio' ? IdServicio : null,
      TipoReseña
    });

    res.status(201).json({
      success: true,
      message: "Entidad de reseña creada correctamente",
      data: resenaEntidad
    });
  } catch (error) {
    console.error("Error en createResenaEntidad:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear entidad de reseña",
      error: error.message
    });
  }
};

// Actualizar una entidad de reseña
exports.updateResenaEntidad = async (req, res) => {
  try {
    const { id } = req.params;
    const { IdReseña, IdProducto, IdServicio, TipoReseña } = req.body;

    const resenaEntidad = await ResenaEntidad.findByPk(id, {
      include: [{ model: Resena }]
    });

    if (!resenaEntidad) {
      return res.status(404).json({ 
        success: false,
        message: "Entidad de reseña no encontrada" 
      });
    }

    // Verificar si la reseña está aprobada
    if (resenaEntidad.Resena && resenaEntidad.Resena.Aprobado) {
      return res.status(400).json({ 
        success: false,
        message: "No se puede modificar una entidad de reseña después de que la reseña ha sido aprobada" 
      });
    }

    // Validar que el tipo de reseña sea válido
    if (TipoReseña && !['producto', 'servicio', 'general'].includes(TipoReseña)) {
      return res.status(400).json({ 
        success: false,
        message: "TipoReseña debe ser 'producto', 'servicio' o 'general'" 
      });
    }

    // Validar coherencia entre tipo y entidades
    const nuevoTipo = TipoReseña || resenaEntidad.TipoReseña;
    
    if (nuevoTipo === 'producto' && !IdProducto && !resenaEntidad.IdProducto) {
      return res.status(400).json({ 
        success: false,
        message: "Para reseñas de tipo producto, se debe proporcionar un IdProducto" 
      });
    }

    if (nuevoTipo === 'servicio' && !IdServicio && !resenaEntidad.IdServicio) {
      return res.status(400).json({ 
        success: false,
        message: "Para reseñas de tipo servicio, se debe proporcionar un IdServicio" 
      });
    }

    const nuevoIdProducto = nuevoTipo === 'producto' ? (IdProducto || resenaEntidad.IdProducto) : null;
    const nuevoIdServicio = nuevoTipo === 'servicio' ? (IdServicio || resenaEntidad.IdServicio) : null;

    if (nuevoTipo === 'general' && (nuevoIdProducto || nuevoIdServicio)) {
      return res.status(400).json({ 
        success: false,
        message: "Para reseñas de tipo general, no se debe proporcionar IdProducto ni IdServicio" 
      });
    }

    // Verificar que la reseña existe si se proporciona
    if (IdReseña) {
      const resenaExiste = await Resena.findByPk(IdReseña);
      if (!resenaExiste) {
        return res.status(404).json({ 
          success: false,
          message: "Reseña no encontrada" 
        });
      }
    }

    // Verificar que el producto existe si se proporciona
    if (nuevoIdProducto) {
      const productoExiste = await Producto.findByPk(nuevoIdProducto);
      if (!productoExiste) {
        return res.status(404).json({ 
          success: false,
          message: "Producto no encontrado" 
        });
      }
    }

    // Verificar que el servicio existe si se proporciona
    if (nuevoIdServicio) {
      const servicioExiste = await Servicio.findByPk(nuevoIdServicio);
      if (!servicioExiste) {
        return res.status(404).json({ 
          success: false,
          message: "Servicio no encontrado" 
        });
      }
    }

    // Verificar que no exista ya otra relación para esta reseña con el mismo tipo
    if (IdReseña || TipoReseña) {
      const existeRelacion = await ResenaEntidad.findOne({
        where: {
          IdReseña: IdReseña || resenaEntidad.IdReseña,
          TipoReseña: TipoReseña || resenaEntidad.TipoReseña,
          IdReseñaEntidad: { [Op.ne]: id }
        }
      });

      if (existeRelacion) {
        return res.status(400).json({ 
          success: false,
          message: "Ya existe otra relación para esta reseña con el mismo tipo" 
        });
      }
    }

    // Actualizar la entidad de reseña
    await resenaEntidad.update({
      IdReseña: IdReseña || resenaEntidad.IdReseña,
      IdProducto: nuevoIdProducto,
      IdServicio: nuevoIdServicio,
      TipoReseña: nuevoTipo
    });

    // Obtener la entidad actualizada con sus relaciones
    const resenaEntidadActualizada = await ResenaEntidad.findByPk(id, {
      include: [
        {
          model: Resena,
          include: [{ model: Cliente }]
        },
        { model: Producto },
        { model: Servicio }
      ],
    });

    res.status(200).json({ 
      success: true,
      message: "Entidad de reseña actualizada exitosamente", 
      data: resenaEntidadActualizada 
    });
  } catch (error) {
    console.error("Error en updateResenaEntidad:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al actualizar la entidad de reseña", 
      error: error.message 
    });
  }
};

// Eliminar una entidad de reseña
exports.deleteResenaEntidad = async (req, res) => {
  try {
    const { id } = req.params;
    
    const resenaEntidad = await ResenaEntidad.findByPk(id, {
      include: [{ model: Resena }]
    });

    if (!resenaEntidad) {
      return res.status(404).json({ 
        success: false,
        message: "Entidad de reseña no encontrada" 
      });
    }

    // Verificar si la reseña está aprobada
    if (resenaEntidad.Resena && resenaEntidad.Resena.Aprobado) {
      return res.status(400).json({ 
        success: false,
        message: "No se puede eliminar una entidad de reseña después de que la reseña ha sido aprobada" 
      });
    }

    await resenaEntidad.destroy();
    res.status(200).json({ 
      success: true,
      message: "Entidad de reseña eliminada exitosamente" 
    });
  } catch (error) {
    console.error("Error en deleteResenaEntidad:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al eliminar la entidad de reseña", 
      error: error.message 
    });
  }
};

// Obtener promedio de calificación por producto
exports.getPromedioCalificacionProducto = async (req, res) => {
  try {
    const { productoId } = req.params;
    
    // Verificar que el producto existe
    const productoExiste = await Producto.findByPk(productoId);
    if (!productoExiste) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado"
      });
    }
    
    // Obtener todas las reseñas del producto
    const resenasProducto = await ResenaEntidad.findAll({
      where: { 
        IdProducto: productoId,
        TipoReseña: 'producto'
      },
      include: [
        {
          model: Resena,
          where: { 
            Estado: true,
            Aprobado: true
          }
        }
      ]
    });
    
    // Calcular el promedio de calificación
    let totalCalificacion = 0;
    let totalResenas = resenasProducto.length;
    
    resenasProducto.forEach(resenaEntidad => {
      totalCalificacion += resenaEntidad.Resena.Calificacion;
    });
    
    const promedioCalificacion = totalResenas > 0 ? totalCalificacion / totalResenas : 0;
    
    res.status(200).json({
      success: true,
      data: {
        productoId,
        promedioCalificacion,
        totalResenas
      }
    });
  } catch (error) {
    console.error("Error en getPromedioCalificacionProducto:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener el promedio de calificación del producto",
      error: error.message
    });
  }
};

// Obtener promedio de calificación por servicio
exports.getPromedioCalificacionServicio = async (req, res) => {
  try {
    const { servicioId } = req.params;
    
    // Verificar que el servicio existe
    const servicioExiste = await Servicio.findByPk(servicioId);
    if (!servicioExiste) {
      return res.status(404).json({
        success: false,
        message: "Servicio no encontrado"
      });
    }
    
    // Obtener todas las reseñas del servicio
    const resenasServicio = await ResenaEntidad.findAll({
      where: { 
        IdServicio: servicioId,
        TipoReseña: 'servicio'
      },
      include: [
        {
          model: Resena,
          where: { 
            Estado: true,
            Aprobado: true
          }
        }
      ]
    });
    
    // Calcular el promedio de calificación
    let totalCalificacion = 0;
    let totalResenas = resenasServicio.length;
    
    resenasServicio.forEach(resenaEntidad => {
      totalCalificacion += resenaEntidad.Resena.Calificacion;
    });
    
    const promedioCalificacion = totalResenas > 0 ? totalCalificacion / totalResenas : 0;
    
    res.status(200).json({
      success: true,
      data: {
        servicioId,
        promedioCalificacion,
        totalResenas
      }
    });
  } catch (error) {
    console.error("Error en getPromedioCalificacionServicio:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener el promedio de calificación del servicio",
      error: error.message
    });
  }
};

// Obtener promedio de calificación general
exports.getPromedioCalificacionGeneral = async (req, res) => {
  try {
    // Obtener todas las reseñas generales
    const resenasGenerales = await ResenaEntidad.findAll({
      where: { 
        TipoReseña: 'general'
      },
      include: [
        {
          model: Resena,
          where: { 
            Estado: true,
            Aprobado: true
          }
        }
      ]
    });
    
    // Calcular el promedio de calificación
    let totalCalificacion = 0;
    let totalResenas = resenasGenerales.length;
    
    resenasGenerales.forEach(resenaEntidad => {
      totalCalificacion += resenaEntidad.Resena.Calificacion;
    });
    
    const promedioCalificacion = totalResenas > 0 ? totalCalificacion / totalResenas : 0;
    
    res.status(200).json({
      success: true,
      data: {
        promedioCalificacion,
        totalResenas
      }
    });
  } catch (error) {
    console.error("Error en getPromedioCalificacionGeneral:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener el promedio de calificación general",
      error: error.message
    });
  }
};