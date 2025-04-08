const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

// Routes
const authRoutes = require('./routes/authRoutes');
const basketRoutes = require('./routes/basketRoutes');

app.use('/auth', authRoutes);
app.use('/api/baskets', basketRoutes);

module.exports = app;