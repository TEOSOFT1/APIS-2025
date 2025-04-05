const db = require("../Config/db");
const AgendamientoCita = db.AgendamientoCita;
const Cliente = db.Cliente;
const Mascota = db.Mascota;
const Servicio = db.Servicio;
const CitaServicio = db.CitaServicio;
const { Op } = db.Sequelize;

// Obtener todas las citas
exports.getAllCitas = async (req, res) => {
  try {
    const citas = await AgendamientoCita.findAll({
      include: [
        { model: Cliente },
        { model: Mascota },
        { model: Servicio, through: { attributes: [] } },
      ],
    });
    res.status(200).json(citas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las citas", error: error.message });
  }
};

// Obtener una cita por ID
exports.getCitaById = async (req, res) => {
  try {
    const { id } = req.params;
    const cita = await AgendamientoCita.findByPk(id, {
      include: [
        { model: Cliente },
        { model: Mascota },
        { model: Servicio, through: { attributes: [] } },
      ],
    });

    if (!cita) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }

    res.status(200).json(cita);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener la cita", error: error.message });
  }
};

// Obtener citas por cliente
exports.getCitasByCliente = async (req, res) => {
  try {
    const { clienteId } = req.params;
    
    // Verificar que el cliente existe
    const clienteExiste = await Cliente.findByPk(clienteId);
    if (!clienteExiste) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    
    const citas = await AgendamientoCita.findAll({
      where: { IdCliente: clienteId },
      include: [
        { model: Cliente },
        { model: Mascota },
        { model: Servicio, through: { attributes: [] } },
      ],
    });

    res.status(200).json(citas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las citas del cliente", error: error.message });
  }
};

// Obtener citas por mascota
exports.getCitasByMascota = async (req, res) => {
  try {
    const { mascotaId } = req.params;
    
    // Verificar que la mascota existe
    const mascotaExiste = await Mascota.findByPk(mascotaId);
    if (!mascotaExiste) {
      return res.status(404).json({ message: "Mascota no encontrada" });
    }
    
    const citas = await AgendamientoCita.findAll({
      where: { IdMascota: mascotaId },
      include: [
        { model: Cliente },
        { model: Mascota },
        { model: Servicio, through: { attributes: [] } },
      ],
    });

    res.status(200).json(citas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las citas de la mascota", error: error.message });
  }
};

// Obtener citas por fecha
// Corrección en AgendamientoCitaController.js
exports.getCitasByFecha = async (req, res) => {
  try {
    const { fecha } = req.params;
    
    if (!fecha) {
      return res.status(400).json({
        success: false,
        message: "Se requiere la fecha"
      });
    }

    // Convertir a objeto Date
    const fechaBusqueda = new Date(fecha);
    if (isNaN(fechaBusqueda.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Formato de fecha inválido"
      });
    }

    // Crear rango para buscar todo el día
    const fechaInicio = new Date(fechaBusqueda);
    fechaInicio.setHours(0, 0, 0, 0);
    
    const fechaFin = new Date(fechaBusqueda);
    fechaFin.setHours(23, 59, 59, 999);

    const citas = await AgendamientoCita.findAll({
      where: {
        Fecha: {
          [Op.between]: [fechaInicio, fechaFin]
        }
      },
      include: [
        { model: Cliente },
        { model: Mascota },
        { 
          model: Servicio,
          through: CitaServicio
        }
      ]
    });

    if (citas.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No se encontraron citas para la fecha especificada"
      });
    }

    res.status(200).json({
      success: true,
      data: citas
    });
  } catch (error) {
    console.error("Error en getCitasByFecha:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener citas por fecha",
      error: error.message
    });
  }
};

// Crear una nueva cita
exports.createCita = async (req, res) => {
  try {
    const { IdCliente, IdMascota, Fecha, servicios } = req.body;

    // Validar campos requeridos
    if (!IdCliente || !IdMascota || !Fecha || !servicios || !servicios.length) {
      return res.status(400).json({ message: "IdCliente, IdMascota, Fecha y al menos un servicio son obligatorios" });
    }

    // Verificar que el cliente existe
    const clienteExiste = await Cliente.findByPk(IdCliente);
    if (!clienteExiste) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    // Verificar que la mascota existe
    const mascotaExiste = await Mascota.findByPk(IdMascota);
    if (!mascotaExiste) {
      return res.status(404).json({ message: "Mascota no encontrada" });
    }

    // Validar que la fecha sea futura
    const fechaCita = new Date(Fecha);
    const ahora = new Date();
    
    if (isNaN(fechaCita.getTime())) {
      return res.status(400).json({ message: "La fecha no es válida" });
    }
    
    if (fechaCita <= ahora) {
      return res.status(400).json({ message: "La fecha de la cita debe ser en el futuro" });
    }

    // Verificar que los servicios existen
    const serviciosExistentes = await Servicio.findAll({
      where: { IdServicio: servicios },
    });

    if (serviciosExistentes.length !== servicios.length) {
      return res.status(404).json({ message: "Uno o más servicios no existen" });
    }

    // Crear la cita
    const nuevaCita = await AgendamientoCita.create({
      IdCliente,
      IdMascota,
      Fecha,
      Estado: 'Programada',
    });

    // Asociar servicios a la cita
    const citaServicios = servicios.map(idServicio => ({
      IdCita: nuevaCita.IdCita,
      IdServicio: idServicio,
    }));

    await CitaServicio.bulkCreate(citaServicios);

    // Obtener la cita creada con sus relaciones
    const citaCreada = await AgendamientoCita.findByPk(nuevaCita.IdCita, {
      include: [
        { model: Cliente },
        { model: Mascota },
        { model: Servicio, through: { attributes: [] } },
      ],
    });

    res.status(201).json({ message: "Cita creada exitosamente", data: citaCreada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear la cita", error: error.message });
  }
};

// Actualizar una cita
exports.updateCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { Fecha, Estado, servicios } = req.body;

    const cita = await AgendamientoCita.findByPk(id);

    if (!cita) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }

    // Validar que la fecha sea futura si se proporciona
    if (Fecha) {
      const fechaCita = new Date(Fecha);
      const ahora = new Date();
      
      if (isNaN(fechaCita.getTime())) {
        return res.status(400).json({ message: "La fecha no es válida" });
      }
      
      if (fechaCita <= ahora) {
        return res.status(400).json({ message: "La fecha de la cita debe ser en el futuro" });
      }
    }

    // Validar que el estado sea válido si se proporciona
    if (Estado && !['Programada', 'Completada', 'Cancelada'].includes(Estado)) {
      return res.status(400).json({ message: "El estado debe ser 'Programada', 'Completada' o 'Cancelada'" });
    }

    // Actualizar la cita
    await cita.update({
      Fecha: Fecha || cita.Fecha,
      Estado: Estado || cita.Estado,
    });

    // Actualizar servicios si se proporcionan
    if (servicios && servicios.length > 0) {
      // Verificar que los servicios existen
      const serviciosExistentes = await Servicio.findAll({
        where: { IdServicio: servicios },
      });

      if (serviciosExistentes.length !== servicios.length) {
        return res.status(404).json({ message: "Uno o más servicios no existen" });
      }

      // Eliminar asociaciones existentes
      await CitaServicio.destroy({
        where: { IdCita: id },
      });

      // Crear nuevas asociaciones
      const citaServicios = servicios.map(idServicio => ({
        IdCita: id,
        IdServicio: idServicio,
      }));

      await CitaServicio.bulkCreate(citaServicios);
    }

    // Obtener la cita actualizada con sus relaciones
    const citaActualizada = await AgendamientoCita.findByPk(id, {
      include: [
        { model: Cliente },
        { model: Mascota },
        { model: Servicio, through: { attributes: [] } },
      ],
    });

    res.status(200).json({ message: "Cita actualizada exitosamente", data: citaActualizada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar la cita", error: error.message });
  }
};

// Cambiar estado de una cita
exports.updateCitaStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { Estado } = req.body;

    if (!Estado || !['Programada', 'Completada', 'Cancelada'].includes(Estado)) {
      return res.status(400).json({ message: "El estado debe ser 'Programada', 'Completada' o 'Cancelada'" });
    }

    const cita = await AgendamientoCita.findByPk(id);

    if (!cita) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }

    await cita.update({ Estado });

    res.status(200).json({ message: `Cita marcada como ${Estado} exitosamente`, data: cita });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el estado de la cita", error: error.message });
  }
};

// Eliminar una cita
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
    console.error(error);
    res.status(500).json({ message: "Error al eliminar la cita", error: error.message });
  }
};