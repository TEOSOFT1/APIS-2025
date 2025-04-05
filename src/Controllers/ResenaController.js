const db = require("../Config/db");
const Resena = db.Resena;
const Cliente = db.Cliente;
const ResenaEntidad = db.ResenaEntidad;
const Producto = db.Producto;
const Servicio = db.Servicio;

// Obtener todas las reseñas
exports.getAllResenas = async (req, res) => {
  try {
    const resenas = await Resena.findAll({
      include: [{ model: Cliente }],
    });
    res.status(200).json(resenas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las reseñas", error: error.message });
  }
};

// Obtener una reseña por ID
exports.getResenaById = async (req, res) => {
  try {
    const { id } = req.params;
    const resena = await Resena.findByPk(id, {
      include: [{ model: Cliente }],
    });

    if (!resena) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }

    res.status(200).json(resena);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener la reseña", error: error.message });
  }
};

// Obtener reseñas por cliente
exports.getResenasByCliente = async (req, res) => {
  try {
    const { idCliente } = req.params;
    
    // Verificar que el cliente existe
    const cliente = await Cliente.findByPk(idCliente);
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado"
      });
    }

    // Obtener las reseñas del cliente
    const resenas = await Resena.findAll({
      where: { IdCliente: idCliente },
      include: [
        { 
          model: ResenaEntidad,
          include: [
            { model: Producto },
            { model: Servicio }
          ]
        }
      ]
    });

    // Si no hay reseñas, devolver un array vacío en lugar de un error
    res.status(200).json({
      success: true,
      data: resenas
    });
  } catch (error) {
    console.error("Error en getResenasByCliente:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener reseñas por cliente",
      error: error.message
    });
  }
};

// Crear una nueva reseña
exports.createResena = async (req, res) => {
  try {
    const { IdCliente, Calificacion, Comentario, Foto } = req.body;

    // Validar campos requeridos
    if (!IdCliente || !Calificacion) {
      return res.status(400).json({ message: "IdCliente y Calificacion son obligatorios" });
    }

    // Validar que la calificación esté entre 1 y 5
    if (Calificacion < 1 || Calificacion > 5) {
      return res.status(400).json({ message: "La calificación debe estar entre 1 y 5" });
    }

    // Verificar que el cliente existe
    const clienteExiste = await Cliente.findByPk(IdCliente);
    if (!clienteExiste) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    const nuevaResena = await Resena.create({
      IdCliente,
      Calificacion,
      Comentario,
      Foto,
      Estado: true,
    });

    const resenaCreada = await Resena.findByPk(nuevaResena.IdReseña, {
      include: [{ model: Cliente }],
    });

    res.status(201).json({ message: "Reseña creada exitosamente", data: resenaCreada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear la reseña", error: error.message });
  }
};

// Actualizar una reseña
exports.updateResena = async (req, res) => {
  try {
    const { id } = req.params;
    const { Calificacion, Comentario, Foto, Estado } = req.body;

    const resena = await Resena.findByPk(id);

    if (!resena) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }

    // Validar que la calificación esté entre 1 y 5 si se proporciona
    if (Calificacion && (Calificacion < 1 || Calificacion > 5)) {
      return res.status(400).json({ message: "La calificación debe estar entre 1 y 5" });
    }

    await resena.update({
      Calificacion: Calificacion || resena.Calificacion,
      Comentario: Comentario !== undefined ? Comentario : resena.Comentario,
      Foto: Foto !== undefined ? Foto : resena.Foto,
      Estado: Estado !== undefined ? Estado : resena.Estado,
    });

    const resenaActualizada = await Resena.findByPk(id, {
      include: [{ model: Cliente }],
    });

    res.status(200).json({ message: "Reseña actualizada exitosamente", data: resenaActualizada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar la reseña", error: error.message });
  }
};

// Eliminar una reseña
exports.deleteResena = async (req, res) => {
  try {
    const { id } = req.params;
    const resena = await Resena.findByPk(id);

    if (!resena) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }

    await resena.destroy();
    res.status(200).json({ message: "Reseña eliminada exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar la reseña", error: error.message });
  }
};

// Cambiar estado de la reseña (activar/desactivar)
exports.toggleResenaStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const resena = await Resena.findByPk(id);

    if (!resena) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }

    await resena.update({
      Estado: !resena.Estado,
    });

    res.status(200).json({
      message: `Reseña ${resena.Estado ? "activada" : "desactivada"} exitosamente`,
      estado: resena.Estado,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al cambiar el estado de la reseña", error: error.message });
  }
};