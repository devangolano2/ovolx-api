const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const User = require('./User');

const Basket = sequelize.define(
  'Basket',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    date: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('EM ANDAMENTO', 'PRONTA', 'LIBERADA PARA CESTA', 'EM ABERTO'),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    user_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_number: {
      type: DataTypes.STRING,
    },
    element_type: {
      type: DataTypes.ENUM('LICITAÇÃO', 'DISPENSA/INEXIGIBILIDADE'),
    },
    calculation_type: {
      type: DataTypes.STRING,
    },
    decimals: {
      type: DataTypes.INTEGER,
    },
    support_status: {
      type: DataTypes.STRING,
    },
    client_status: {
      type: DataTypes.STRING,
    },
    finalized_date: {
      type: DataTypes.STRING,
    },
    basket_date: {
      type: DataTypes.STRING,
    },
    quotation_deadline: {
      type: DataTypes.STRING,
    },
    possession: {
      type: DataTypes.STRING,
    },
    expense_element: {
      type: DataTypes.STRING,
    },
    request_date: {
      type: DataTypes.STRING,
    },
    correction_index: {
      type: DataTypes.STRING,
    },
    correction_target: {
      type: DataTypes.STRING,
    },
    correction_start_date: {
      type: DataTypes.STRING,
    },
    correction_end_date: {
      type: DataTypes.STRING,
    },
    research_documents: {
      type: DataTypes.STRING,
    }
  },
  {
    tableName: 'baskets',
    underscored: true,
    timestamps: true 
  }
);

// Associações
Basket.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Basket, { foreignKey: 'user_id', as: 'baskets' });

module.exports = Basket;