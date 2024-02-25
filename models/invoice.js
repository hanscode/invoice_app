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
      customerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Customers",
          key: "customerId",
        },
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
        validate: {
          isValidItems(value) {
            // Custom validator function to check each element in the items array
            if (!Array.isArray(value)) {
              throw new Error("Items must be an array");
            }
            // Perform validation for each element in the array
            value.forEach((item) => {
              if (!item.description || !item.quantity || !item.unitPrice) {
                throw new Error(
                  "Each item must have at least a description, quantity, and unit price"
                );
              }
              if (typeof item.description !== "string") {
                throw new Error("Item  must be a string");
              }
              if (typeof item.quantity !== "number" || item.quantity <= 0) {
                throw new Error("Item quantity must be a positive number");
              }
              if (typeof item.price !== "number" || item.price <= 0) {
                throw new Error("Item price must be a positive number");
              }
            });
          },
        },
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
        allowNull: false,
      },
    });
    // Tells Sequelize that a invoice can be associated with only 1 customer
    Invoice.belongsTo(models.Customer, {
      foreignKey: {
        name: "customerId",
        allowNull: false,
      },
      scope: {
        userId: sequelize.col("User.id"), // Only select invoices where the userId matches the userId of the user associated with the customer
      },
    });
  };

  return Invoice;
};
