'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Customers', 'color', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'rgb(107 114 128 / 1)', // Example default color
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Customers', 'color');
  }
};
