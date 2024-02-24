"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Customer extends Model {}
  Customer.init(
    {
      // Define attributes of the Customer model
      customerId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // Automatically gets converted to SERIAL for postgres
        allowNull: false,
        unique: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "A client name is required",
          },
          notEmpty: {
            msg: "Please provide a client name",
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "An email is required",
          },
          isEmail: {
            msg: "Please provide a valid email address",
          },
        },
      },
      phone: {
        type: DataTypes.STRING,
      },
      address: {
        type: DataTypes.STRING,
      },
      notes: {
        type: DataTypes.TEXT,
      },
    },
    { sequelize }
  );

  Customer.associate = (models) => {
    // Tells Sequelize that a customer can be associated with one user
    Customer.belongsTo(models.User, {
      foreignKey: {
        fieldName: "userId",
        allowNull: false,
      },
    });
    // Tells Sequelize that a customer can be associated with one or more invoices
    Customer.hasMany(models.Invoice, {
      foreignKey: {
        name: "customerId",
        allowNull: false,
      },
    });
  };

  return Customer;
};
