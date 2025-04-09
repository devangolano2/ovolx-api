const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Configuração do CORS
const corsOptions = {
  origin: ['http://localhost:5173', 'https://evolx-pricing.vercel.app'], // URLs permitidas
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware de debug
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

// Routes
const authRoutes = require('./routes/authRoutes');
const basketRoutes = require('./routes/basketRoutes');
const productRoutes = require('./routes/productRoutes');

app.use('/auth', authRoutes);
app.use('/api/baskets', basketRoutes);
app.use('/api/products', productRoutes);

module.exports = app;