const db = require("../Config/db");
const CitaServicio = db.CitaServicio;
const AgendamientoCita = db.AgendamientoCita;
const Servicio = db.Servicio;

exports.getAllCitaServicios = async (req, res) => {
  try {
    const citaServicios = await CitaServicio.findAll({
      include: [
        { model: Servicio },
        { model: AgendamientoCita },
      ],
    });
    res.status(200).json(citaServicios);
  } catch (error) {
    console.error("❌ Error en getAllCitaServicios:", error);
    res.status(500).json({
      message: "Error obteniendo todas las relaciones de citas y servicios",
      error: error.message,
    });
  }
};

exports.getServiciosByCita = async (req, res) => {
  try {
    const { idCita } = req.params;
    const servicios = await CitaServicio.findAll({
      where: { IdCita: idCita },
      include: [{ model: Servicio }],
    });

    if (!servicios.length) {
      return res.status(404).json({ message: "No se encontraron servicios para esta cita" });
    }

    res.status(200).json(servicios);
  } catch (error) {
    console.error("❌ Error en getServiciosByCita:", error);
    res.status(500).json({ message: "Error obteniendo servicios de la cita", error: error.message });
  }
};

exports.getCitasByServicio = async (req, res) => {
  try {
    const { idServicio } = req.params;
    const citas = await CitaServicio.findAll({
      where: { IdServicio: idServicio },
      include: [{ model: AgendamientoCita }],
    });

    if (!citas.length) {
      return res.status(404).json({ message: "No se encontraron citas para este servicio" });
    }

    res.status(200).json(citas);
  } catch (error) {
    console.error("❌ Error en getCitasByServicio:", error);
    res.status(500).json({ message: "Error obteniendo citas del servicio", error: error.message });
  }
};

exports.addServicioToCita = async (req, res) => {
  try {
    const { IdCita, IdServicio } = req.body;

    if (!IdCita || !IdServicio) {
      return res.status(400).json({ message: "IdCita e IdServicio son obligatorios" });
    }

    // Validar que la cita y el servicio existan antes de insertarlos
    const cita = await AgendamientoCita.findByPk(IdCita);
    const servicio = await Servicio.findByPk(IdServicio);

    if (!cita) {
      return res.status(404).json({ message: "La cita no existe" });
    }
    if (!servicio) {
      return res.status(404).json({ message: "El servicio no existe" });
    }

    const nuevaRelacion = await CitaServicio.create({ IdCita, IdServicio });

    res.status(201).json({ message: "Servicio agregado a la cita exitosamente", data: nuevaRelacion });
  } catch (error) {
    console.error("❌ Error en addServicioToCita:", error);
    res.status(500).json({ message: "Error al agregar servicio a la cita", error: error.message });
  }
};

exports.removeServicioFromCita = async (req, res) => {
  try {
    const { id } = req.params;
    const relacion = await CitaServicio.findByPk(id);

    if (!relacion) {
      return res.status(404).json({ message: "Relación no encontrada" });
    }

    await relacion.destroy();
    res.status(200).json({ message: "Servicio eliminado de la cita exitosamente" });
  } catch (error) {
    console.error("❌ Error en removeServicioFromCita:", error);
    res.status(500).json({ message: "Error al eliminar servicio de la cita", error: error.message });
  }
};
