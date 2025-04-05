const db = require("../Config/db");
const CategoriaProducto = db.CategoriaProducto;
const { Op } = db.Sequelize;

// Obtener todas las categorías de productos
exports.getAllCategorias = async (req, res) => {
  try {
    const categorias = await CategoriaProducto.findAll();
    res.status(200).json(categorias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las categorías de productos", error: error.message });
  }
};

// Obtener una categoría de producto por ID
exports.getCategoriaById = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await CategoriaProducto.findByPk(id);

    if (!categoria) {
      return res.status(404).json({ message: "Categoría de producto no encontrada" });
    }

    res.status(200).json(categoria);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener la categoría de producto", error: error.message });
  }
};

// Crear una nueva categoría de producto
exports.createCategoria = async (req, res) => {
  try {
    const { NombreCategoria, Descripcion, Estado } = req.body;

    if (!NombreCategoria) {
      return res.status(400).json({ message: "El nombre de la categoría es obligatorio" });
    }

    // Verificar si ya existe una categoría con el mismo nombre
    const categoriaExistente = await CategoriaProducto.findOne({
      where: { NombreCategoria },
    });

    if (categoriaExistente) {
      return res.status(400).json({ message: "Ya existe una categoría con el mismo nombre" });
    }

    const nuevaCategoria = await CategoriaProducto.create({
      NombreCategoria,
      Descripcion,
      Estado: Estado !== undefined ? Estado : true,
    });

    res.status(201).json({ message: "Categoría de producto creada exitosamente", data: nuevaCategoria });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear la categoría de producto", error: error.message });
  }
};

// Actualizar una categoría de producto
exports.updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { NombreCategoria, Descripcion, Estado } = req.body;

    const categoria = await CategoriaProducto.findByPk(id);

    if (!categoria) {
      return res.status(404).json({ message: "Categoría de producto no encontrada" });
    }

    // Verificar si ya existe otra categoría con el mismo nombre
    if (NombreCategoria && NombreCategoria !== categoria.NombreCategoria) {
      const categoriaExistente = await CategoriaProducto.findOne({
        where: { NombreCategoria },
      });

      if (categoriaExistente) {
        return res.status(400).json({ message: "Ya existe otra categoría con el mismo nombre" });
      }
    }

    await categoria.update({
      NombreCategoria: NombreCategoria || categoria.NombreCategoria,
      Descripcion: Descripcion !== undefined ? Descripcion : categoria.Descripcion,
      Estado: Estado !== undefined ? Estado : categoria.Estado,
    });

    res.status(200).json({ message: "Categoría de producto actualizada exitosamente", data: categoria });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar la categoría de producto", error: error.message });
  }
};

// Eliminar una categoría de producto
exports.deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await CategoriaProducto.findByPk(id);

    if (!categoria) {
      return res.status(404).json({ message: "Categoría de producto no encontrada" });
    }

    await categoria.destroy();
    res.status(200).json({ message: "Categoría de producto eliminada exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar la categoría de producto", error: error.message });
  }
};

// Cambiar estado de la categoría de producto (activar/desactivar)
exports.toggleCategoriaStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await CategoriaProducto.findByPk(id);

    if (!categoria) {
      return res.status(404).json({ message: "Categoría de producto no encontrada" });
    }

    await categoria.update({
      Estado: !categoria.Estado,
    });

    res.status(200).json({
      message: `Categoría de producto ${categoria.Estado ? "activada" : "desactivada"} exitosamente`,
      estado: categoria.Estado,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al cambiar el estado de la categoría de producto", error: error.message });
  }
};