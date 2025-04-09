const Product = require('../models/Product');

// Listar todos os produtos
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar produtos', error: error.message });
  }
};

// Buscar produto por ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar produto', error: error.message });
  }
};

// Criar novo produto
exports.createProduct = async (req, res) => {
  try {
    const { code, description, unit, expenseElement } = req.body;
    
    // Formata o código do produto
    const formattedCode = `#${code.padStart(6, '0')}`;
    
    const product = await Product.create({
      code: formattedCode,
      description,
      unit,
      expenseElement
    });
    
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar produto', error: error.message });
  }
};

// Atualizar produto
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    const { description, unit, expenseElement, reviewed } = req.body;
    await product.update({
      description,
      unit,
      expenseElement,
      reviewed
    });
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar produto', error: error.message });
  }
};

// Deletar produto
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    await product.destroy();
    res.json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar produto', error: error.message });
  }
};
