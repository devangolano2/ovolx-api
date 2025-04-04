require('dotenv').config();
const app = require('./app');
const sequelize = require('./database');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Caminho para um arquivo de flag indicando se a limpeza já foi feita
const CLEANUP_FLAG = path.join(__dirname, 'cleanup-done.flag');

// Função para remover índices duplicados na coluna 'document'
async function cleanDuplicateIndexes() {
  // Verifica se a limpeza já foi feita
  if (fs.existsSync(CLEANUP_FLAG)) {
    console.log('Limpeza de índices já realizada anteriormente. Pulando...');
    return;
  }

  try {
    const [indexes] = await sequelize.query('SHOW INDEXES FROM users WHERE Column_name = "document"');
    const duplicateIndexes = indexes
      .filter(index => index.Key_name.startsWith('document') && index.Key_name !== 'document')
      .map(index => index.Key_name);

    if (duplicateIndexes.length > 0) {
      // Remove todos os índices duplicados em uma única query
      const dropQuery = duplicateIndexes.map(index => `DROP INDEX ${index} ON users`).join('; ');
      await sequelize.query(dropQuery);
      console.log(`Índices duplicados removidos: ${duplicateIndexes.join(', ')}`);

      // Cria o arquivo de flag para indicar que a limpeza foi feita
      fs.writeFileSync(CLEANUP_FLAG, 'Cleanup completed at ' + new Date().toISOString());
    } else {
      console.log('Nenhum índice duplicado encontrado.');
      fs.writeFileSync(CLEANUP_FLAG, 'No duplicates found at ' + new Date().toISOString());
    }
  } catch (err) {
    console.error('Erro ao remover índices duplicados:', err);
  }
}

// Inicia o servidor
async function startServer() {
  try {
    // Executa a limpeza apenas se necessário
    await cleanDuplicateIndexes();

    // Opcional: mantenha o sync se ainda precisar, ou remova se não for necessário
    await sequelize.sync({ alter: true });
    console.log('Database synced');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Erro ao iniciar o servidor:', err);
  }
}

startServer();