'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Invoices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      invoiceNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      customerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Customers",
          key: "customerId",
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      customerName: {
        type: Sequelize.STRING,
      },
      issueDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      dueDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      totalAmount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      dueBalance: {
        type: Sequelize.FLOAT,
      },
      items: {
        type: Sequelize.ARRAY(Sequelize.JSONB),
        allowNull: false,
        defaultValue: [],
      },
      tax: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      discount: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'draft'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    // Drop the Invoices table
    await queryInterface.dropTable('Invoices');
  }
};