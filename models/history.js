const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const History = sequelize.define("History", {
    invoiceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  return History;
};
