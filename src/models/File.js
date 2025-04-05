const { DataTypes } = require('sequelize');
const sequelize = require('../database'); // Corrigido de '../config/database' para '../database'
const Basket = require('./Basket');

const File = sequelize.define(
  'File',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sent_date: { // Alterado de sentDate para sent_date
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    basket_id: { // Alterado de basketId para basket_id
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Basket,
        key: 'id',
      },
    },
    file_category: { // Alterado de fileCategory para file_category
      type: DataTypes.ENUM('basket', 'purchase'),
      allowNull: false,
    },
    created_at: { // Adicionado explicitamente devido a timestamps: true
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: { // Adicionado explicitamente devido a timestamps: true
      type: DataTypes.DATE,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      // Remova allowNull: false
    },
    updated_at: {
      type: DataTypes.DATE,
      // Remova allowNull: false
    },
  },
  {
    tableName: 'files',
    underscored: true,
  }
);

// Associações
File.belongsTo(Basket, { foreignKey: 'basket_id', as: 'basket' });
Basket.hasMany(File, { foreignKey: 'basket_id', as: 'files' });

module.exports = File;