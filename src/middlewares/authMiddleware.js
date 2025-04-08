const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth Header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Token não fornecido ou formato inválido');
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token recebido:', token);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta_padrao');
      console.log('Token decodificado:', decoded);

      // Buscar o usuário no banco para obter mais informações
      const user = await User.findByPk(decoded.id);
      console.log('Usuário encontrado:', user ? user.id : 'Não');

      if (!user) {
        console.log('Usuário não encontrado no banco');
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      req.userId = decoded.id;
      req.user = {
        id: decoded.id,
        name: user.name,
      };

      console.log('Autenticação bem-sucedida para usuário:', req.userId);
      return next();
    } catch (jwtError) {
      console.error('Erro ao verificar token:', jwtError);
      return res.status(401).json({ error: 'Token inválido', details: jwtError.message });
    }
  } catch (error) {
    console.error('Erro de autenticação:', error);
    return res.status(500).json({ error: 'Erro interno de autenticação' });
  }
};