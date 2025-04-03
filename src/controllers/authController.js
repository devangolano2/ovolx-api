const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

/**
 * Registra um novo usuário
 */
const register = async (req, res) => {
  try {
    const { name, document, prefecture, password } = req.body;
    const photo = req.file ? req.file.filename : null;

    const userExists = await User.findOne({ where: { document } });
    if (userExists) {
      return res.status(400).json({ error: 'Documento já registrado' });
    }

    const user = await User.create({
      name,
      document,
      prefecture,
      photo,
      password
    });

    user.password = undefined;

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    return res.status(201).json({ user, token });
  } catch (error) {
    console.error('Erro no registro:', error);
    return res.status(500).json({ error: 'Falha no registro' });
  }
};

/**
 * Busca usuários pelo documento
 */
const getUsersByDocument = async (req, res) => {
  try {
    const { document } = req.body;

    const user = await User.findOne({
      where: { document },
      attributes: ['id', 'prefecture']
    });

    if (!user) {
      return res.status(400).json({ error: 'Nenhum usuário encontrado!' });
    }

    return res.status(200).json({ 
      id: user.id,
      prefecture: user.prefecture 
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return res.status(500).json({ error: 'Falha ao buscar informações do usuário' });
  }
};

/**
 * Realiza login do usuário
 */
const login = async (req, res) => {
  try {
    const { document, prefecture, password } = req.body;

    const user = await User.findOne({
      where: { document }
    });

    if (!user) {
      return res.status(400).json({ error: 'Usuário não encontrado' });
    }

    // Se apenas o documento foi enviado, retorna a prefeitura
    if (!prefecture && !password) {
      return res.status(200).json({
        id: user.id,
        prefecture: user.prefecture
      });
    }

    // Verifica se a prefeitura corresponde
    if (prefecture && prefecture !== user.prefecture) {
      return res.status(400).json({ error: 'Prefeitura não corresponde ao usuário' });
    }

    // Verifica a senha apenas quando todos os campos estão presentes
    if (document && prefecture && password) {
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ error: 'Senha inválida' });
      }

      user.password = undefined;

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '1d'
      });

      return res.status(200).json({ user, token });
    }

    return res.status(400).json({ error: 'Dados incompletos' });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Falha no login' });
  }
};

/**
 * Atualiza dados do usuário
 */
const updateUser = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, document, prefecture, currentPassword, newPassword } = req.body;
    const photo = req.file ? req.file.filename : undefined;

    // Busca usuário atual
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Se estiver alterando a senha, verifica a senha atual
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Senha atual é obrigatória para alterar a senha' });
      }
      
      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) {
        return res.status(400).json({ error: 'Senha atual incorreta' });
      }
    }

    // Verifica se o novo documento já está sendo usado por outro usuário
    if (document && document !== user.document) {
      const existingUser = await User.findOne({ 
        where: { 
          document,
          id: { [Op.ne]: userId }
        }
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Documento já está em uso' });
      }
    }

    // Cria objeto de atualização apenas com os campos fornecidos
    const updateData = {};
    if (name) updateData.name = name;
    if (document) updateData.document = document;
    if (prefecture) updateData.prefecture = prefecture;
    if (newPassword) updateData.password = newPassword;
    if (photo) updateData.photo = photo;

    // Atualiza dados do usuário
    const [updated] = await User.update(updateData, {
      where: { id: userId },
      individualHooks: true
    });

    if (!updated) {
      return res.status(404).json({ error: 'Falha ao atualizar usuário' });
    }

    // Busca dados atualizados do usuário
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    return res.json(updatedUser);
  } catch (error) {
    console.error('Erro na atualização:', error);
    return res.status(500).json({ error: 'Falha na atualização' });
  }
};

/**
 * Busca perfil do usuário
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return res.status(500).json({ error: 'Falha ao buscar perfil' });
  }
};

/**
 * Exclui a foto do perfil do usuário
 */
const deletePhoto = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Busca usuário atual
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Se o usuário não tem foto, retorna sucesso
    if (!user.photo) {
      return res.status(200).json({ message: 'Nenhuma foto para excluir' });
    }
    
    // Armazena o nome do arquivo para excluir depois
    const photoToDelete = user.photo;
    
    // Atualiza o usuário para remover a referência da foto
    await User.update({ photo: null }, {
      where: { id: userId }
    });
    
    // Tenta excluir o arquivo do diretório de uploads
    try {
      const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads');
      const filePath = path.join(uploadsDir, photoToDelete);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fileError) {
      console.error('Erro ao excluir arquivo:', fileError);
      // Continua mesmo se a exclusão do arquivo falhar
    }
    
    return res.status(200).json({ message: 'Foto excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir foto:', error);
    return res.status(500).json({ error: 'Falha ao excluir foto' });
  }
};

module.exports = {
  register,
  login,
  getUsersByDocument,
  updateUser,
  getProfile,
  deletePhoto
};