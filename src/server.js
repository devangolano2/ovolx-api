require('dotenv').config();
const app = require('./app');
const sequelize = require('./database'); // Corrigido de './database/index' para './database'

// Importar os modelos para garantir que sejam registrados
require('./models/User');
require('./models/Basket');
require('./models/File');

const PORT = process.env.PORT || 3000;

// Criar a pasta uploads se ela não existir
const fs = require('fs');
const path = require('path');
const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Pasta uploads criada com sucesso.');
}

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
    } else {
      console.log('Nenhum índice duplicado encontrado na coluna "document".');
    }
  } catch (err) {
    console.error('Erro ao remover índices duplicados:', err.message);
  }
}

// Função para iniciar a limpeza periódica
function startIndexCleanup() {
  cleanDuplicateIndexes();
  setInterval(() => {
    cleanDuplicateIndexes();
  }, 60000); // 1 minuto
}

// Função para testar a conexão com o banco de dados
async function testDatabaseConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
    return true;
  } catch (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
    return false;
  }
}

// Inicia o servidor e a limpeza periódica
async function startServer() {
  try {
    // Testar a conexão com o banco de dados
    const isDbConnected = await testDatabaseConnection();
    if (!isDbConnected) {
      console.warn('O servidor será iniciado, mas o banco de dados não está acessível. Algumas funcionalidades podem não funcionar.');
    }

    // Sincronizar o banco de dados apenas se a conexão foi estabelecida
    if (isDbConnected) {
      try {
        await sequelize.sync({ alter: true });
        console.log('Database synced successfully.');
      } catch (syncErr) {
        console.error('Erro ao sincronizar o banco de dados:', syncErr.message);
        console.warn('O servidor será iniciado mesmo com erro na sincronização do banco de dados.');
      }
    }

    // Inicia o servidor
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      // Inicia a limpeza periódica apenas se a conexão com o banco de dados foi estabelecida
      if (isDbConnected) {
        startIndexCleanup();
      } else {
        console.warn('Limpeza periódica de índices não iniciada devido à falha na conexão com o banco de dados.');
      }
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Porta ${PORT} já está em uso. Tente outra porta ou finalize o processo que está usando a porta.`);
      } else {
        console.error('Erro ao iniciar o servidor:', err.message);
      }
      process.exit(1);
    });
  } catch (err) {
    console.error('Erro crítico ao iniciar o servidor:', err.message);
    console.warn('O servidor não pôde ser iniciado devido a um erro crítico.');
    process.exit(1);
  }
}

startServer();