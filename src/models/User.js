const { DataTypes } = require('sequelize');
const sequelize = require('../database'); // Já está correto
const bcrypt = require('bcryptjs');

const User = sequelize.define(
  'User',
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
    document: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    prefecture: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    photo: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
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
  },
  {
    tableName: 'users',
    underscored: true,
  }
);

// Hash password before saving
User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});

// Add hook for password hashing during update
User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

module.exports = User;