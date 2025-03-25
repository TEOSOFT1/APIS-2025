const db = require("../Config/db");
const AgendamientoCita = db.AgendamientoCita;
const Cliente = db.Cliente;

exports.getAllCitas = async (req, res) => {
  try {
    const citas = await AgendamientoCita.findAll({
      include: [{ model: Cliente, attributes: ["IdCliente", "Nombre", "Correo"] }],
    });
    res.status(200).json(citas);
  } catch (error) {
    console.error("Error obteniendo citas:", error);
    res.status(500).json({ message: "Error obteniendo citas", error: error.message });
  }
};

exports.getCitaById = async (req, res) => {
  try {
    const { id } = req.params;
    const cita = await AgendamientoCita.findByPk(id, {
      include: [{ model: Cliente, attributes: ["IdCliente", "Nombre", "Correo"] }],
    });
    if (!cita) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }
    res.status(200).json(cita);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la cita", error: error.message });
  }
};

exports.createCita = async (req, res) => {
  try {
    const { IdCliente, Fecha, Estado } = req.body;
    if (!IdCliente || !Fecha || !Estado) {
      return res.status(400).json({ message: "IdCliente, Fecha y Estado son obligatorios" });
    }
    const nuevaCita = await AgendamientoCita.create({ IdCliente, Fecha, Estado });
    res.status(201).json({ message: "Cita creada exitosamente", data: nuevaCita });
  } catch (error) {
    console.error("Error al crear cita:", error);
    res.status(500).json({ message: "Error al crear la cita", error: error.message });
  }
};

exports.updateCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { IdCliente, Fecha, Estado } = req.body;
    const cita = await AgendamientoCita.findByPk(id);
    if (!cita) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }
    await cita.update({ IdCliente, Fecha, Estado });
    res.status(200).json({ message: "Cita actualizada exitosamente", data: cita });
  } catch (error) {
    console.error("Error al actualizar cita:", error);
    res.status(500).json({ message: "Error al actualizar la cita", error: error.message });
  }
};

exports.deleteCita = async (req, res) => {
  try {
    const { id } = req.params;
    const cita = await AgendamientoCita.findByPk(id);
    if (!cita) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }
    await cita.destroy();
    res.status(200).json({ message: "Cita eliminada exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la cita", error: error.message });
  }
};
