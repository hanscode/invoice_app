'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add the new column 'paid' to the 'Invoices' table
    await queryInterface.addColumn('Invoices', 'paid', {
      type: Sequelize.FLOAT,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the 'paid' column from the 'Invoices' table
    await queryInterface.removeColumn('Invoices', 'paid');
  }
};
