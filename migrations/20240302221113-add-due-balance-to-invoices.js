'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Invoices', 'dueBalance', {
      type: Sequelize.FLOAT,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Invoices', 'dueBalance');
  }
};
