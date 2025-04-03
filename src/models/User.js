const { DataTypes } = require("sequelize")
const sequelize = require("../database")
const bcrypt = require("bcryptjs")

const User = sequelize.define(
  "User",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 255],
      },
    },
    document: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: "CPF or CNPJ",
      validate: {
        notEmpty: true,
      },
    },
    prefecture: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    photo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [6, 255],
      },
    },
  },
  {
    tableName: "users",
    timestamps: true,
  },
)

// Hash password before saving
User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10)
})

// Add hook for password hashing during update
User.beforeUpdate(async (user) => {
  if (user.changed("password")) {
    user.password = await bcrypt.hash(user.password, 10)
  }
})

module.exports = User

