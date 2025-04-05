const db = require("../Config/db");
const Producto = db.Producto;
const CategoriaProducto = db.CategoriaProducto;
const { Op } = db.Sequelize;

// Obtener todos los productos
exports.getAllProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      include: [{ model: CategoriaProducto }],
    });
    res.status(200).json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los productos", error: error.message });
  }
};

// Obtener un producto por ID
exports.getProductoById = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByPk(id, {
      include: [{ model: CategoriaProducto }],
    });

    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.status(200).json(producto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el producto", error: error.message });
  }
};

// Buscar productos
exports.searchProductos = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Se requiere un término de búsqueda" });
    }

    const productos = await Producto.findAll({
      where: {
        [Op.or]: [
          { NombreProducto: { [Op.like]: `%${query}%` } },
          { Descripcion: { [Op.like]: `%${query}%` } },
          { Caracteristicas: { [Op.like]: `%${query}%` } },
          { Especificaciones: { [Op.like]: `%${query}%` } },
          { CodigoBarras: { [Op.like]: `%${query}%` } },
          { Referencia: { [Op.like]: `%${query}%` } },
        ],
      },
      include: [{ model: CategoriaProducto }],
    });

    res.status(200).json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al buscar productos", error: error.message });
  }
};

// Crear un nuevo producto
exports.createProducto = async (req, res) => {
  try {
    const {
      IdCategoriaDeProducto,
      NombreProducto,
      Foto,
      Descripcion,
      Caracteristicas,
      Especificaciones,
      Stock,
      Precio,
      AplicaIVA,
      PorcentajeIVA,
      FechaVencimiento,
      CodigoBarras,
      Referencia,
      Estado,
    } = req.body;

    // Validar campos requeridos
    if (!IdCategoriaDeProducto || !NombreProducto || !Precio) {
      return res.status(400).json({ message: "IdCategoriaDeProducto, NombreProducto y Precio son obligatorios" });
    }

    // Validar que al menos uno de CodigoBarras o Referencia esté presente
    if (!CodigoBarras && !Referencia) {
      return res.status(400).json({ message: "Se requiere al menos un CodigoBarras o una Referencia" });
    }

    // Verificar que la categoría existe
    const categoriaExiste = await CategoriaProducto.findByPk(IdCategoriaDeProducto);
    if (!categoriaExiste) {
      return res.status(404).json({ message: "La categoría de producto especificada no existe" });
    }

    // Verificar si ya existe un producto con el mismo código de barras o referencia
    if (CodigoBarras || Referencia) {
      const productoExistente = await Producto.findOne({
        where: {
          [Op.or]: [
            CodigoBarras ? { CodigoBarras } : null,
            Referencia ? { Referencia } : null,
          ].filter(Boolean),
        },
      });

      if (productoExistente) {
        return res.status(400).json({ message: "Ya existe un producto con el mismo código de barras o referencia" });
      }
    }

    // Validar fecha de vencimiento si se proporciona
    if (FechaVencimiento) {
      const fechaVencimiento = new Date(FechaVencimiento);
      const hoy = new Date();
      
      if (isNaN(fechaVencimiento.getTime())) {
        return res.status(400).json({ message: "La fecha de vencimiento no es válida" });
      }
      
      if (fechaVencimiento <= hoy) {
        return res.status(400).json({ message: "La fecha de vencimiento no puede ser pasada" });
      }
      
      const diezAñosDespues = new Date();
      diezAñosDespues.setFullYear(hoy.getFullYear() + 10);
      
      if (fechaVencimiento > diezAñosDespues) {
        return res.status(400).json({ message: "La fecha de vencimiento no puede ser más de 10 años en el futuro" });
      }
    }

    const nuevoProducto = await Producto.create({
      IdCategoriaDeProducto,
      NombreProducto,
      Foto,
      Descripcion,
      Caracteristicas: Caracteristicas || '',
      Especificaciones: Especificaciones || '',
      Stock: Stock !== undefined ? Stock : 0,
      Precio,
      AplicaIVA: AplicaIVA !== undefined ? AplicaIVA : false,
      PorcentajeIVA: PorcentajeIVA !== undefined ? PorcentajeIVA : 0,
      FechaVencimiento,
      CodigoBarras,
      Referencia,
      Estado: Estado !== undefined ? Estado : true,
    });

    const productoCreado = await Producto.findByPk(nuevoProducto.IdProducto, {
      include: [{ model: CategoriaProducto }],
    });

    res.status(201).json({ message: "Producto creado exitosamente", data: productoCreado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el producto", error: error.message });
  }
};

// Actualizar un producto
exports.updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      IdCategoriaDeProducto,
      NombreProducto,
      Foto,
      Descripcion,
      Caracteristicas,
      Especificaciones,
      Stock,
      Precio,
      AplicaIVA,
      PorcentajeIVA,
      FechaVencimiento,
      CodigoBarras,
      Referencia,
      Estado,
    } = req.body;

    const producto = await Producto.findByPk(id);

    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Si se proporciona una categoría, verificar que existe
    if (IdCategoriaDeProducto) {
      const categoriaExiste = await CategoriaProducto.findByPk(IdCategoriaDeProducto);
      if (!categoriaExiste) {
        return res.status(404).json({ message: "La categoría de producto especificada no existe" });
      }
    }

    // Verificar si ya existe otro producto con el mismo código de barras o referencia
    if (CodigoBarras || Referencia) {
      const productoExistente = await Producto.findOne({
        where: {
          [Op.or]: [
            CodigoBarras ? { CodigoBarras } : null,
            Referencia ? { Referencia } : null,
          ].filter(Boolean),
          IdProducto: { [Op.ne]: id },
        },
      });

      if (productoExistente) {
        return res.status(400).json({ message: "Ya existe otro producto con el mismo código de barras o referencia" });
      }
    }

    // Validar fecha de vencimiento si se proporciona
    if (FechaVencimiento) {
      const fechaVencimiento = new Date(FechaVencimiento);
      const hoy = new Date();
      
      if (isNaN(fechaVencimiento.getTime())) {
        return res.status(400).json({ message: "La fecha de vencimiento no es válida" });
      }
      
      if (fechaVencimiento <= hoy) {
        return res.status(400).json({ message: "La fecha de vencimiento no puede ser pasada" });
      }
      
      const diezAñosDespues = new Date();
      diezAñosDespues.setFullYear(hoy.getFullYear() + 10);
      
      if (fechaVencimiento > diezAñosDespues) {
        return res.status(400).json({ message: "La fecha de vencimiento no puede ser más de 10 años en el futuro" });
      }
    }

    await producto.update({
      IdCategoriaDeProducto: IdCategoriaDeProducto || producto.IdCategoriaDeProducto,
      NombreProducto: NombreProducto || producto.NombreProducto,
      Foto: Foto !== undefined ? Foto : producto.Foto,
      Descripcion: Descripcion !== undefined ? Descripcion : producto.Descripcion,
      Caracteristicas: Caracteristicas !== undefined ? Caracteristicas : producto.Caracteristicas,
      Especificaciones: Especificaciones !== undefined ? Especificaciones : producto.Especificaciones,
      Stock: Stock !== undefined ? Stock : producto.Stock,
      Precio: Precio || producto.Precio,
      AplicaIVA: AplicaIVA !== undefined ? AplicaIVA : producto.AplicaIVA,
      PorcentajeIVA: PorcentajeIVA !== undefined ? PorcentajeIVA : producto.PorcentajeIVA,
      FechaVencimiento: FechaVencimiento !== undefined ? FechaVencimiento : producto.FechaVencimiento,
      CodigoBarras: CodigoBarras !== undefined ? CodigoBarras : producto.CodigoBarras,
      Referencia: Referencia !== undefined ? Referencia : producto.Referencia,
      Estado: Estado !== undefined ? Estado : producto.Estado,
    });

    const productoActualizado = await Producto.findByPk(id, {
      include: [{ model: CategoriaProducto }],
    });

    res.status(200).json({ message: "Producto actualizado exitosamente", data: productoActualizado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el producto", error: error.message });
  }
};

// Eliminar un producto
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
    console.error(error);
    res.status(500).json({ message: "Error al eliminar el producto", error: error.message });
  }
};

// Cambiar estado del producto (activar/desactivar)
exports.toggleProductoStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByPk(id);

    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    await producto.update({
      Estado: !producto.Estado,
    });

    res.status(200).json({
      message: `Producto ${producto.Estado ? "activado" : "desactivado"} exitosamente`,
      estado: producto.Estado,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al cambiar el estado del producto", error: error.message });
  }
};

// Actualizar stock de un producto
exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { Stock } = req.body;

    if (Stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "La cantidad es obligatoria"
      });
    }

    const producto = await Producto.findByPk(id);
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado"
      });
    }

    producto.Stock = Stock;
    await producto.save();

    res.status(200).json({
      success: true,
      message: "Stock actualizado correctamente",
      data: producto
    });
  } catch (error) {
    console.error("Error en updateStock:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar el stock",
      error: error.message
    });
  }
};