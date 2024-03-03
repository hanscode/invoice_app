"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class History extends Model {}
  History.init(
    {
      action: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.NOW,
      },
    },
    { sequelize }
  );

  History.associate = (models) => {
    History.belongsTo(models.User, {
      foreignKey: "userId",
      allowNull: false,
    });
    History.belongsTo(models.Invoice, {
      foreignKey: "invoiceId",
      allowNull: false,
    });
    History.belongsTo(models.Payment, {
      foreignKey: "paymentId",
      allowNull: true,
    });
  };

  return History;
};
