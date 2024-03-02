'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Invoices', 'tax', {
      type: Sequelize.FLOAT,
      defaultValue: 0
    });
    
    await queryInterface.changeColumn('Invoices', 'discount', {
      type: Sequelize.FLOAT,
      defaultValue: 0
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Invoices', 'tax', {
      type: Sequelize.FLOAT
    });

    await queryInterface.changeColumn('Invoices', 'discount', {
      type: Sequelize.FLOAT
    });
  }
};
