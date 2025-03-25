const db = require("../Config/db");
const Mascota = db.Mascota;

// Obtener todas las mascotas
exports.getAllMascotas = async (req, res) => {
  try {
    const mascotas = await Mascota.findAll();
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
    const mascota = await Mascota.findByPk(id);

    if (!mascota) {
      return res.status(404).json({ message: "Mascota no encontrada" });
    }

    res.status(200).json(mascota);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener la mascota", error: error.message });
  }
};

// Crear una nueva mascota
exports.createMascota = async (req, res) => {
  try {
    const { IdCliente, Nombre, Especie, Raza, Tamaño, FechaNacimiento } = req.body;

    // Validar que los campos obligatorios estén presentes
    if (!IdCliente || !Nombre || !Especie || !Raza || !Tamaño || !FechaNacimiento) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Crear la nueva mascota
    const nuevaMascota = await Mascota.create({ IdCliente, Nombre, Especie, Raza, Tamaño, FechaNacimiento });
    res.status(201).json({ message: "Mascota creada exitosamente", data: nuevaMascota });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear la mascota", error: error.message });
  }
};

// Actualizar una mascota
exports.updateMascota = async (req, res) => {
  try {
    const { id } = req.params;
    const { IdCliente, Nombre, Especie, Raza, Tamaño, FechaNacimiento } = req.body;

    // Buscar la mascota por ID
    const mascota = await Mascota.findByPk(id);

    if (!mascota) {
      return res.status(404).json({ message: "Mascota no encontrada" });
    }

    // Actualizar la mascota
    await mascota.update({ IdCliente, Nombre, Especie, Raza, Tamaño, FechaNacimiento });
    res.status(200).json({ message: "Mascota actualizada exitosamente", data: mascota });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar la mascota", error: error.message });
  }
};

// Eliminar una mascota
exports.deleteMascota = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar la mascota por ID
    const mascota = await Mascota.findByPk(id);

    if (!mascota) {
      return res.status(404).json({ message: "Mascota no encontrada" });
    }

    // Eliminar la mascota
    await mascota.destroy();
    res.status(200).json({ message: "Mascota eliminada exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar la mascota", error: error.message });
  }
};