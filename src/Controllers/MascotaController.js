const db = require("../Config/db");
const Mascota = db.Mascota;
const Cliente = db.Cliente;
const { Op } = db.Sequelize;

// Obtener todas las mascotas
exports.getAllMascotas = async (req, res) => {
  try {
    const mascotas = await Mascota.findAll({
      include: [{ model: Cliente }],
    });
    res.status(200).json(mascotas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las mascotas", error: error.message });
  }
};

// Obtener una mascota por ID
exports.getMascotaById = async (req, res) => {
  try {
    const { id } = req.params;
    const mascota = await Mascota.findByPk(id, {
      include: [{ model: Cliente }],
    });

    if (!mascota) {
      return res.status(404).json({ message: "Mascota no encontrada" });
    }

    res.status(200).json(mascota);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener la mascota", error: error.message });
  }
};

// Buscar mascotas por nombre, especie o raza
exports.searchMascotas = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: "Se requiere un término de búsqueda" });
    }
    
    const mascotas = await Mascota.findAll({
      where: {
        [Op.or]: [
          { Nombre: { [Op.like]: `%${query}%` } },
          { Especie: { [Op.like]: `%${query}%` } },
          { Raza: { [Op.like]: `%${query}%` } },
        ],
      },
      include: [{ model: Cliente }],
    });

    res.status(200).json(mascotas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al buscar mascotas", error: error.message });
  }
};

// Crear una nueva mascota
exports.createMascota = async (req, res) => {
  try {
    const { Nombre, Foto, Especie, Raza, Tamaño, FechaNacimiento } = req.body;

    // Validar campos requeridos
    if (!Nombre || !Especie || !Raza || !Tamaño || !FechaNacimiento) {
      return res.status(400).json({ message: "Nombre, Especie, Raza, Tamaño y FechaNacimiento son obligatorios" });
    }

    // Validar tamaño
    if (!['Pequeño', 'Grande'].includes(Tamaño)) {
      return res.status(400).json({ message: "Tamaño debe ser 'Pequeño' o 'Grande'" });
    }

    // Validar fecha de nacimiento
    const fechaNacimiento = new Date(FechaNacimiento);
    if (isNaN(fechaNacimiento.getTime())) {
      return res.status(400).json({ message: "Formato de fecha inválido. Use YYYY-MM-DD" });
    }

    // Verificar que la fecha de nacimiento no sea futura
    if (fechaNacimiento > new Date()) {
      return res.status(400).json({ message: "La fecha de nacimiento no puede ser futura" });
    }

    // Verificar que la fecha de nacimiento no sea extremadamente antigua (más de 30 años)
    const treintaAnosAtras = new Date();
    treintaAnosAtras.setFullYear(treintaAnosAtras.getFullYear() - 30);
    if (fechaNacimiento < treintaAnosAtras) {
      return res.status(400).json({ message: "La fecha de nacimiento no puede ser anterior a hace 30 años" });
    }

    const nuevaMascota = await Mascota.create({
      Nombre,
      Foto,
      Especie,
      Raza,
      Tamaño,
      FechaNacimiento: fechaNacimiento,
    });

    const mascotaCreada = await Mascota.findByPk(nuevaMascota.IdMascota, {
      include: [{ model: Cliente }],
    });

    res.status(201).json({ message: "Mascota creada exitosamente", data: mascotaCreada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear la mascota", error: error.message });
  }
};

// Actualizar una mascota
exports.updateMascota = async (req, res) => {
  try {
    const { id } = req.params;
    const { Nombre, Foto, Especie, Raza, Tamaño, FechaNacimiento } = req.body;

    const mascota = await Mascota.findByPk(id);

    if (!mascota) {
      return res.status(404).json({ message: "Mascota no encontrada" });
    }

    // Validar tamaño si se proporciona
    if (Tamaño && !['Pequeño', 'Grande'].includes(Tamaño)) {
      return res.status(400).json({ message: "Tamaño debe ser 'Pequeño' o 'Grande'" });
    }

    // Validar fecha de nacimiento si se proporciona
    let fechaNacimiento;
    if (FechaNacimiento) {
      fechaNacimiento = new Date(FechaNacimiento);
      if (isNaN(fechaNacimiento.getTime())) {
        return res.status(400).json({ message: "Formato de fecha inválido. Use YYYY-MM-DD" });
      }

      // Verificar que la fecha de nacimiento no sea futura
      if (fechaNacimiento > new Date()) {
        return res.status(400).json({ message: "La fecha de nacimiento no puede ser futura" });
      }

      // Verificar que la fecha de nacimiento no sea extremadamente antigua (más de 30 años)
      const treintaAnosAtras = new Date();
      treintaAnosAtras.setFullYear(treintaAnosAtras.getFullYear() - 30);
      if (fechaNacimiento < treintaAnosAtras) {
        return res.status(400).json({ message: "La fecha de nacimiento no puede ser anterior a hace 30 años" });
      }
    }

    await mascota.update({
      Nombre: Nombre || mascota.Nombre,
      Foto: Foto !== undefined ? Foto : mascota.Foto,
      Especie: Especie || mascota.Especie,
      Raza: Raza || mascota.Raza,
      Tamaño: Tamaño || mascota.Tamaño,
      FechaNacimiento: fechaNacimiento || mascota.FechaNacimiento,
    });

    const mascotaActualizada = await Mascota.findByPk(id, {
      include: [{ model: Cliente }],
    });

    res.status(200).json({ message: "Mascota actualizada exitosamente", data: mascotaActualizada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar la mascota", error: error.message });
  }
};

// Eliminar una mascota
exports.deleteMascota = async (req, res) => {
  try {
    const { id } = req.params;
    const mascota = await Mascota.findByPk(id);

    if (!mascota) {
      return res.status(404).json({ message: "Mascota no encontrada" });
    }

    // Verificar si hay clientes asociados a esta mascota
    const clientesAsociados = await Cliente.findAll({
      where: { IdMascota: id },
    });

    if (clientesAsociados.length > 0) {
      // Actualizar los clientes para quitar la referencia a esta mascota
      for (const cliente of clientesAsociados) {
        await cliente.update({ IdMascota: null });
      }
    }

    await mascota.destroy();

    res.status(200).json({ message: "Mascota eliminada exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar la mascota", error: error.message });
  }
};