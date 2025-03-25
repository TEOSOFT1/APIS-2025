const db = require("../Config/db");
const CategoriaProducto = db.CategoriaProducto;

exports.getAllCategoriasProducto = async (req, res) => {
  try {
    const categorias = await CategoriaProducto.findAll();
    res.status(200).json(categorias);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las categorías", error: error.message });
  }
};

exports.getCategoriaProductoById = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await CategoriaProducto.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }
    res.status(200).json(categoria);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la categoría", error: error.message });
  }
};

exports.createCategoriaProducto = async (req, res) => {
  try {
    const { NombreCategoria, Descripcion = "Sin descripción", Estado = true } = req.body;
    if (!NombreCategoria || NombreCategoria.trim() === "") {
      return res.status(400).json({ message: "El nombre de la categoría es obligatorio" });
    }
    const nuevaCategoria = await CategoriaProducto.create({ NombreCategoria, Descripcion, Estado });
    res.status(201).json({ message: "Categoría creada exitosamente", data: nuevaCategoria });
  } catch (error) {
    console.error("Error al crear categoría:", error);
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ message: "Error de validación", errors: error.errors.map(e => e.message) });
    }
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "El nombre de la categoría ya está registrado" });
    }
    res.status(500).json({ message: "Error al crear la categoría", error: error.message });
  }
};

exports.updateCategoriaProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { NombreCategoria, Descripcion, Estado } = req.body;
    const categoria = await CategoriaProducto.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }
    if (!NombreCategoria || NombreCategoria.trim() === "") {
      return res.status(400).json({ message: "El nombre de la categoría es obligatorio" });
    }
    await categoria.update({ NombreCategoria, Descripcion, Estado });
    res.status(200).json({ message: "Categoría actualizada exitosamente", data: categoria });
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    res.status(500).json({ message: "Error al actualizar la categoría", error: error.message });
  }
};

exports.deleteCategoriaProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await CategoriaProducto.findByPk(id);
    if (!categoria) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }
    await categoria.destroy();
    res.status(200).json({ message: "Categoría eliminada exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la categoría", error: error.message });
  }
};
