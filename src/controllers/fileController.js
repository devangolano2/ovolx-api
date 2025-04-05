const File = require('../models/File');
const Basket = require('../models/Basket');
const fs = require('fs');
const path = require('path');

const getFilesByBasket = async (req, res) => {
  try {
    const { basketId } = req.params;
    const basket = await Basket.findOne({ where: { id: basketId, user_id: req.user.id } });

    if (!basket) {
      return res.status(404).json({ error: 'Cesta não encontrada' });
    }

    const files = await File.findAll({ where: { basket_id: basketId } });
    return res.status(200).json(files);
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    return res.status(500).json({ error: 'Erro ao listar arquivos' });
  }
};

const downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findByPk(fileId);

    if (!file) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    const basket = await Basket.findOne({ where: { id: file.basket_id, user_id: req.user.id } });
    if (!basket) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const filePath = path.join(__dirname, '..', file.path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Arquivo não encontrado no servidor' });
    }

    res.download(filePath, file.name);
  } catch (error) {
    console.error('Erro ao baixar arquivo:', error);
    return res.status(500).json({ error: 'Erro ao baixar arquivo' });
  }
};

module.exports = { getFilesByBasket, downloadFile };