require('dotenv').config();
const app = require('./app');
const sequelize = require('./database');

const PORT = process.env.PORT || 3000;

// Sync database
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synced');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error syncing database:', err);
  });