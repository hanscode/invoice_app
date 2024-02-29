"use strict";
const { Model, DataTypes, Op } = require("sequelize");

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
        unique: true,
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
          uniqueEmailPerUser: async function(value)  {
            // Custom validation function to check uniqueness customer email per user
            const customer = await Customer.findOne({
              where: {
                email: value,
                userId: this.userId, // `this.userId` refers to the userId associated with the current customer
                customerId: { [Op.ne]: this.customerId } // Exclude the current customer
              },
            });
            if (customer) {
              throw new Error(
                "The email you entered already exists for another customer of this user. Please enter a different email."
              );
            }
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
      scope: {
        userId: sequelize.col("userId"), // Only select invoices where the userId matches the userId of the customer
      },
    });
    // Tells Sequelize that a customer can be associated with one or more payments
    Customer.hasMany(models.Payment, {
      foreignKey: 'customerId',
      onDelete: 'CASCADE', // Optionally define the behavior on deletion
    });
  };

  return Customer;
};
