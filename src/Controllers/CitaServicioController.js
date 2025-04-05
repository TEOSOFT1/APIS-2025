const db = require("../Config/db");
const CitaServicio = db.CitaServicio;
const AgendamientoCita = db.AgendamientoCita;
const Servicio = db.Servicio;

// Obtener todas las relaciones cita-servicio
exports.getAllCitaServicios = async (req, res) => {
  try {
    const citaServicios = await CitaServicio.findAll({
      include: [
        { model: AgendamientoCita },
        { model: Servicio },
      ],
    });
    res.status(200).json(citaServicios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las relaciones cita-servicio", error: error.message });
  }
};

// Obtener una relación cita-servicio por ID
exports.getCitaServicioById = async (req, res) => {
  try {
    const { id } = req.params;
    const citaServicio = await CitaServicio.findByPk(id, {
      include: [
        { model: AgendamientoCita },
        { model: Servicio },
      ],
    });

    if (!citaServicio) {
      return res.status(404).json({ message: "Relación cita-servicio no encontrada" });
    }

    res.status(200).json(citaServicio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener la relación cita-servicio", error: error.message });
  }
};

// Obtener servicios por cita
exports.getServiciosByCita = async (req, res) => {
  try {
    const { citaId } = req.params;
    
    // Verificar que la cita existe
    const citaExiste = await AgendamientoCita.findByPk(citaId);
    if (!citaExiste) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }
    
    const citaServicios = await CitaServicio.findAll({
      where: { IdCita: citaId },
      include: [{ model: Servicio }],
    });

    // Extraer solo los servicios
    const servicios = citaServicios.map(cs => cs.Servicio);

    res.status(200).json(servicios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los servicios de la cita", error: error.message });
  }
};

// Crear una nueva relación cita-servicio
exports.createCitaServicio = async (req, res) => {
  try {
    const { IdCita, IdServicio } = req.body;

    // Validar campos requeridos
    if (!IdCita || !IdServicio) {
      return res.status(400).json({ message: "IdCita e IdServicio son obligatorios" });
    }

    // Verificar que la cita existe
    const citaExiste = await AgendamientoCita.findByPk(IdCita);
    if (!citaExiste) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }

    // Verificar que el servicio existe
    const servicioExiste = await Servicio.findByPk(IdServicio);
    if (!servicioExiste) {
      return res.status(404).json({ message: "Servicio no encontrado" });
    }

    // Verificar si ya existe la relación
    const relacionExistente = await CitaServicio.findOne({
      where: { IdCita, IdServicio },
    });

    if (relacionExistente) {
      return res.status(400).json({ message: "Esta relación cita-servicio ya existe" });
    }

    const nuevaCitaServicio = await CitaServicio.create({
      IdCita,
      IdServicio,
    });

    const citaServicioCreada = await CitaServicio.findByPk(nuevaCitaServicio.IdCitaServicio, {
      include: [
        { model: AgendamientoCita },
        { model: Servicio },
      ],
    });

    res.status(201).json({ message: "Relación cita-servicio creada exitosamente", data: citaServicioCreada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear la relación cita-servicio", error: error.message });
  }
};

// Eliminar una relación cita-servicio
exports.deleteCitaServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const citaServicio = await CitaServicio.findByPk(id);

    if (!citaServicio) {
      return res.status(404).json({ message: "Relación cita-servicio no encontrada" });
    }

    await citaServicio.destroy();
    res.status(200).json({ message: "Relación cita-servicio eliminada exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar la relación cita-servicio", error: error.message });
  }
};