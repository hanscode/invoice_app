"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Invoice extends Model {}
  Invoice.init(
    {
      // Define attributes of the Invoice model
      invoiceNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      customerName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      issueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      totalAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      // Define an array field for storing invoice items
      items: {
        type: DataTypes.ARRAY(DataTypes.JSONB), // Using JSONB for flexibility
        allowNull: false,
        defaultValue: [], // Default value as an empty array
      },
      tax: {
        type: DataTypes.FLOAT,
      },
      discount: {
        type: DataTypes.FLOAT,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "draft",
      },
    },
    { sequelize }
  );

  Invoice.associate = (models) => {
    // Tells Sequelize that a invoice can be associated with only 1 user
    Invoice.belongsTo(models.User, {
      foreignKey: {
        fieldName: "userId",
      },
    });
  };

  return Invoice;
};
