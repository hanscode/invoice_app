"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Payment extends Model {}

  Payment.init(
    {
      amountPaid: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      paymentDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    },
    { sequelize }
  );

  Payment.associate = (models) => {
    Payment.belongsTo(models.User, {
      foreignKey: {
        fieldName: "userId",
        allowNull: false,
      },
    });
    Payment.belongsTo(models.Customer, {
      foreignKey: {
        fieldName: "customerId",
        allowNull: false,
      },
    });
    Payment.belongsTo(models.Invoice, {
      foreignKey: {
        fieldName: "invoiceId",
        allowNull: false,
      },
    });
  };

  return Payment;
};
