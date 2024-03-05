"use strict";
const { Model, DataTypes, Op } = require("sequelize");

module.exports = (sequelize) => {
  class Invoice extends Model {}
  Invoice.init(
    {
      // Define attributes of the Invoice model
      invoiceNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "An invoice number is required",
          },
          notEmpty: {
            msg: "Please provide an invoice number",
          },
          uniqueInvoiceNumber: async function(value) {
            // Custom validation function to check uniqueness of invoice number
            const invoice = await Invoice.findOne({
              where: {
                invoiceNumber: value,
                userId: this.userId, // `this.userId` refers to the userId associated with the current invoice
                id: { [Op.ne]: this.id } // Exclude the current invoice ID
              },
            });
            if (invoice) {
              throw new Error("The invoice number you entered already exists");
            }
          }
        },
      },
      customerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Customers",
          key: "customerId",
        },
      },
      // Virtual property for customerName
      customerName: {
        type: DataTypes.STRING,
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
      amountDue: {
        type: DataTypes.FLOAT,
      },
      paid: {
        type: DataTypes.FLOAT,
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
              if (!item.description || !item.quantity || !item.price) {
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
        defaultValue: 0,
      },
      discount: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "draft",
      },
    },
    { sequelize }
  );

  Invoice.addHook('beforeCreate', (invoice) => {
    if (!invoice.amountDue) {
      invoice.amountDue = invoice.totalAmount;
    }
  });

  Invoice.addHook('beforeCreate', (invoice) => {
    if (!invoice.paid) {
      invoice.paid = 0;
    }
  });

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
    // Tells Sequelize that a invoice can be associated with one or more payments
    Invoice.hasMany(models.Payment, {
      foreignKey: {
        fieldName: "invoiceId",
        ondDelete: "CASCADE", // Optionally define the behavior on deletion

      },
    });
  };

  return Invoice;
};
