const { DataTypes } = require('sequelize');
const sequelize = require('../database'); // Corrigido de '../config/database' para '../database'
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
    user_id: { // Alterado de userId para user_id
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    user_name: { // Alterado de userName para user_name
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_number: { // Alterado de userNumber para user_number
      type: DataTypes.STRING,
    },
    element_type: { // Alterado de elementType para element_type
      type: DataTypes.ENUM('LICITAÇÃO', 'DISPENSA/INEXIGIBILIDADE'),
    },
    calculation_type: { // Alterado de calculationType para calculation_type
      type: DataTypes.STRING,
    },
    decimals: {
      type: DataTypes.INTEGER,
    },
    support_status: { // Alterado de supportStatus para support_status
      type: DataTypes.STRING,
    },
    client_status: { // Alterado de clientStatus para client_status
      type: DataTypes.STRING,
    },
    finalized_date: { // Alterado de finalizedDate para finalized_date
      type: DataTypes.STRING,
    },
    basket_date: { // Alterado de basketDate para basket_date
      type: DataTypes.STRING,
    },
    quotation_deadline: { // Alterado de quotationDeadline para quotation_deadline
      type: DataTypes.STRING,
    },
    possession: {
      type: DataTypes.STRING,
    },
    expense_element: { // Alterado de expenseElement para expense_element
      type: DataTypes.STRING,
    },
    request_date: { // Alterado de requestDate para request_date
      type: DataTypes.STRING,
    },
    correction_index: { // Alterado de correctionIndex para correction_index
      type: DataTypes.STRING,
    },
    correction_target: { // Alterado de correctionTarget para correction_target
      type: DataTypes.STRING,
    },
    correction_start_date: { // Alterado de correctionStartDate para correction_start_date
      type: DataTypes.STRING,
    },
    correction_end_date: { // Alterado de correctionEndDate para correction_end_date
      type: DataTypes.STRING,
    },
    research_documents: { // Alterado de researchDocuments para research_documents
      type: DataTypes.STRING,
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
      // Não defina allowNull: false aqui
    },
    updated_at: {
      type: DataTypes.DATE,
      // Não defina allowNull: false aqui
    },
  },
  {
    tableName: 'baskets',
    underscored: true,
  }
);

// Associações
Basket.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Basket, { foreignKey: 'user_id', as: 'baskets' });

module.exports = Basket;