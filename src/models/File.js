const { DataTypes } = require('sequelize');
const sequelize = require('../database'); 
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
    sent_date: { 
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
    basket_id: { 
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Basket,
        key: 'id',
      },
    },
    file_category: { 
      type: DataTypes.ENUM('basket', 'purchase'),
      allowNull: false,
    }
  },
  {
    tableName: 'files',
    underscored: true,
    timestamps: true 
  }
);

// Associações
File.belongsTo(Basket, { foreignKey: 'basket_id', as: 'basket' });
Basket.hasMany(File, { foreignKey: 'basket_id', as: 'files' });

module.exports = File;