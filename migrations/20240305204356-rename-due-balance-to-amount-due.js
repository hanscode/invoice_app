'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Rename the column from dueBalance to amountDue
    await queryInterface.renameColumn('Invoices', 'dueBalance', 'amountDue');
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the column name back to dueBalance
    await queryInterface.renameColumn('Invoices', 'amountDue', 'dueBalance');
  }
};
