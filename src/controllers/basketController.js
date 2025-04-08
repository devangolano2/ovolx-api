const Basket = require('../models/Basket');
const File = require('../models/File');
const fs = require('fs');
const path = require('path');

const createBasket = async (req, res) => {
  try {
    const {
      date,
      status,
      description,
      element_type,
      calculation_type,
      decimals,
      support_status,
      client_status,
      finalized_date,
      basket_date,
      quotation_deadline,
      possession,
      expense_element,
      request_date,
      correction_index,
      correction_target,
      correction_start_date,
      correction_end_date,
      research_documents,
    } = req.body;

    // Validar campos obrigatórios
    if (!description) {
      return res.status(400).json({ error: 'Descrição é obrigatória' });
    }

    const now = new Date();
    const formattedDate = now.toLocaleString('pt-BR');

    const basket = await Basket.create({
      id: Date.now().toString(),
      date: date || formattedDate,
      status: status || 'EM ANDAMENTO',
      description,
      user_id: req.user.id,
      user_name: req.user.name,
      user_number: req.user.id.toString(),
      element_type,
      calculation_type,
      decimals,
      support_status,
      client_status,
      finalized_date,
      basket_date,
      quotation_deadline,
      possession,
      expense_element,
      request_date: request_date || formattedDate,
      correction_index,
      correction_target,
      correction_start_date,
      correction_end_date,
      research_documents,
    });

    return res.status(201).json(basket);
  } catch (error) {
    console.error('Erro ao criar cesta:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: error.errors.map(e => e.message)
      });
    }
    return res.status(500).json({ error: 'Erro ao criar cesta' });
  }
};

const getBaskets = async (req, res) => {
  try {
    const { status, date, sortOrder = 'desc' } = req.query;
    let where = { user_id: req.user.id };

    if (status) where.status = status;
    if (date) where.date = date;

    const baskets = await Basket.findAll({
      where,
      order: [['id', sortOrder.toUpperCase()]],
      include: [{ model: File, as: 'files' }],
    });

    return res.status(200).json(baskets);
  } catch (error) {
    console.error('Erro ao listar cestas:', error);
    return res.status(500).json({ error: 'Erro ao listar cestas' });
  }
};

const getBasketById = async (req, res) => {
  try {
    const { id } = req.params;
    const basket = await Basket.findOne({
      where: { id, user_id: req.user.id },
      include: [{ model: File, as: 'files' }],
    });

    if (!basket) {
      return res.status(404).json({ error: 'Cesta não encontrada' });
    }

    return res.status(200).json(basket);
  } catch (error) {
    console.error('Erro ao buscar cesta:', error);
    return res.status(500).json({ error: 'Erro ao buscar cesta' });
  }
};

const updateBasket = async (req, res) => {
  try {
    const { id } = req.params;
    const basket = await Basket.findOne({ where: { id, user_id: req.user.id } });

    if (!basket) {
      return res.status(404).json({ error: 'Cesta não encontrada' });
    }

    await basket.update(req.body);
    return res.status(200).json(basket);
  } catch (error) {
    console.error('Erro ao atualizar cesta:', error);
    return res.status(500).json({ error: 'Erro ao atualizar cesta' });
  }
};

const deleteBasket = async (req, res) => {
  try {
    const { id } = req.params;
    const basket = await Basket.findOne({ where: { id, user_id: req.user.id } });

    if (!basket) {
      return res.status(404).json({ error: 'Cesta não encontrada' });
    }

    const files = await File.findAll({ where: { basket_id: id } });
    for (const file of files) {
      const filePath = path.join(__dirname, '..', file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      await file.destroy();
    }

    await basket.destroy();
    return res.status(204).json();
  } catch (error) {
    console.error('Erro ao deletar cesta:', error);
    return res.status(500).json({ error: 'Erro ao deletar cesta' });
  }
};

const uploadFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const { file_category } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    if (!file_category || !['basket', 'purchase'].includes(file_category)) {
      return res.status(400).json({ error: 'Categoria de arquivo inválida' });
    }

    const basket = await Basket.findOne({ where: { id, user_id: req.user.id } });
    if (!basket) {
      // Se a cesta não for encontrada, exclui os arquivos físicos
      files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error('Erro ao excluir arquivo:', err);
        }
      });
      return res.status(404).json({ error: 'Cesta não encontrada' });
    }

    const uploadedFiles = [];
    for (const file of files) {
      try {
        const now = new Date();
        const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}`;

        const fileSize =
          file.size < 1024
            ? `${file.size} B`
            : file.size < 1024 * 1024
            ? `${(file.size / 1024).toFixed(2)} KB`
            : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

        const fileExtension = file.originalname.split('.').pop().toLowerCase();
        let fileType = 'other';
        if (['pdf'].includes(fileExtension)) fileType = 'pdf';
        else if (['doc', 'docx'].includes(fileExtension)) fileType = 'word';
        else if (['xls', 'xlsx'].includes(fileExtension)) fileType = 'excel';
        else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) fileType = 'image';
        else if (['zip', 'rar', '7z'].includes(fileExtension)) fileType = 'archive';

        try {
          const fileRecord = await File.create({
            name: file.originalname,
            size: fileSize,
            sent_date: formattedDate,
            type: fileType,
            path: file.filename, // Usando filename em vez de path
            basket_id: id,
            file_category,
          });

          uploadedFiles.push(fileRecord);
        } catch (error) {
          console.error('Erro ao salvar arquivo no banco:', error);
          // Se houver erro ao salvar no banco, exclui o arquivo físico
          try {
            fs.unlinkSync(file.path);
          } catch (err) {
            console.error('Erro ao excluir arquivo após falha:', err);
          }
          throw error;
        }
      } catch (error) {
        console.error('Erro ao processar arquivo:', error);
        // Se houver erro ao processar um arquivo, tenta excluir o arquivo físico
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error('Erro ao excluir arquivo após falha:', err);
        }
        throw error;
      }
    }

    return res.status(200).json(uploadedFiles);
  } catch (error) {
    console.error('Erro ao fazer upload de arquivos:', error);
    // Se for um erro de validação do Sequelize, retorna mensagem específica
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: 'Dados inválidos para o arquivo',
        details: error.errors.map(e => e.message)
      });
    }
    return res.status(500).json({ error: 'Erro ao fazer upload de arquivos' });
  }
};

const deleteFile = async (req, res) => {
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
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await file.destroy();
    return res.status(204).json();
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    return res.status(500).json({ error: 'Erro ao deletar arquivo' });
  }
};

module.exports = {
  createBasket,
  getBaskets,
  getBasketById,
  updateBasket,
  deleteBasket,
  uploadFiles,
  deleteFile,
};