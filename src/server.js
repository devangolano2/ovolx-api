require('dotenv').config();
const app = require('./app');
const sequelize = require('./database');

const PORT = process.env.PORT || 3000;

// Função para remover índices duplicados na coluna 'document'
async function cleanDuplicateIndexes() {
  try {
    const [indexes] = await sequelize.query('SHOW INDEXES FROM users WHERE Column_name = "document"');
    const duplicateIndexes = indexes
      .filter(index => index.Key_name.startsWith('document') && index.Key_name !== 'document')
      .map(index => index.Key_name);

    if (duplicateIndexes.length > 0) {
      for (const indexName of duplicateIndexes) {
        await sequelize.query(`DROP INDEX ${indexName} ON users`);
        console.log(`Índice duplicado removido às ${new Date().toLocaleTimeString()}: ${indexName}`);
      }
    }
  } catch (err) {
    console.error('Erro ao remover índices duplicados:', err);
  }
}

// Função para iniciar a limpeza periódica
function startIndexCleanup() {
  // Executa a limpeza imediatamente na inicialização
  cleanDuplicateIndexes();

  // Configura um intervalo para rodar a cada minuto (60.000 ms)
  setInterval(() => {
    cleanDuplicateIndexes();
  }, 60000); // 1 minuto
}

// Inicia o servidor e a limpeza periódica
async function startServer() {
  try {
    // Opcional: sincroniza o banco na inicialização (remova se não precisar)
    await sequelize.sync({ alter: true });
    console.log('Database synced');

    // Inicia o servidor
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      // Inicia a limpeza periódica após o servidor estar ativo
      startIndexCleanup();
    });
  } catch (err) {
    console.error('Erro ao iniciar o servidor:', err);
  }
}

startServer();