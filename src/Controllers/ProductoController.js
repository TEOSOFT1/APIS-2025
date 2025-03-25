const db = require("../Config/db");
const Producto = db.Producto;

exports.getAllProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll();
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los productos", error: error.message });
  }
};

exports.getProductoById = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByPk(id);
    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.status(200).json(producto);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el producto", error: error.message });
  }
};

exports.createProducto = async (req, res) => {
  try {
    const { IdCategoriaDeProducto, NombreProducto, Foto, Descripcion = "Sin descripción", Stock = 0, Precio, AplicaIVA = false, PorcentajeIVA = 0, FechaVencimiento, CodigoBarras, Referencia, Estado = true } = req.body;
    if (!IdCategoriaDeProducto || !NombreProducto || !Precio) {
      return res.status(400).json({ message: "IdCategoriaDeProducto, NombreProducto y Precio son obligatorios" });
    }
    const nuevoProducto = await Producto.create({ IdCategoriaDeProducto, NombreProducto, Foto, Descripcion, Stock, Precio, AplicaIVA, PorcentajeIVA, FechaVencimiento, CodigoBarras, Referencia, Estado });
    res.status(201).json({ message: "Producto creado exitosamente", data: nuevoProducto });
  } catch (error) {
    console.error("Error al crear producto:", error);
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ message: "Error de validación", errors: error.errors.map(e => e.message) });
    }
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "El código de barras o referencia ya están registrados" });
    }
    res.status(500).json({ message: "Error al crear el producto", error: error.message });
  }
};

exports.updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { IdCategoriaDeProducto, NombreProducto, Foto, Descripcion, Stock, Precio, AplicaIVA, PorcentajeIVA, FechaVencimiento, CodigoBarras, Referencia, Estado } = req.body;
    const producto = await Producto.findByPk(id);
    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    await producto.update({ IdCategoriaDeProducto, NombreProducto, Foto, Descripcion, Stock, Precio, AplicaIVA, PorcentajeIVA, FechaVencimiento, CodigoBarras, Referencia, Estado });
    res.status(200).json({ message: "Producto actualizado exitosamente", data: producto });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ message: "Error al actualizar el producto", error: error.message });
  }
};

exports.deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByPk(id);
    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    await producto.destroy();
    res.status(200).json({ message: "Producto eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el producto", error: error.message });
  }
};