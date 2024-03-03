// Description: This file contains the logic for logging history of actions performed by users.
const { History } = require('../models');

const logHistory = async (action, userId, invoiceId, paymentId) => {
  try {
    await History.create({
      action,
      userId,
      invoiceId,
      paymentId,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error logging history:', error);
  }
};

module.exports = { logHistory };
