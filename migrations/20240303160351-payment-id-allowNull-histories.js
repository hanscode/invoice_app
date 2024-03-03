'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Histories', 'paymentId', {
      type: Sequelize.INTEGER, // Adjust the data type as needed
      allowNull: true, // Allow null values
      // Other column options...
    });
  },
  down: async (queryInterface, Sequelize) => {
    // Add logic to revert the change if necessary
    // This is important for rollbacks
  }
};
