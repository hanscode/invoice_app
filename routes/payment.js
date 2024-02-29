"use strict";

const express = require("express");
const { asyncHandler } = require("../middleware/async-handler");
const { Invoice, Payment } = require("../models");
const { authenticateUser } = require("../middleware/auth-user");
const { sequelize } = require("../models/index");

// Construct a router instance.
const router = express.Router();

/**
 * Payment Routes
 */

router.post(
  "/payments/invoice/:invoiceId",
  authenticateUser,
  asyncHandler(async (req, res) => {
    let transaction;
    try {
      // Start a transaction
      transaction = await sequelize.transaction();

      // Update the invoice record to mark it as paid
      await Invoice.update(
        { status: "paid" },
        { where: { id: req.params.invoiceId }, transaction }
      );

      // Record the payment details
      const payment = await Payment.create(
        {
          invoiceId: req.params.invoiceId,
          amountPaid: req.body.amountPaid, // Extract amountPaid from request body
          paymentDate: req.body.paymentDate, // Extract paymentDate from request body
        },
        { transaction }
      );

      // Commit the transaction if all operations succeed
      await transaction.commit();
      
      // Send response
      res
        .status(201)
        .setHeader("Location", `/payments/invoice/${req.params.invoiceId}`)
        .setHeader("Access-Control-Expose-Headers", "Location")
        .json({
          success: true,
          message: "Invoice payment recorded successfully",
          payment,
        });
    } catch (error) {
      // Rollback the transaction if any error occurs
      if (transaction) await transaction.rollback();
      console.error("Error: ", error);

      // Handle Sequelize validation errors or unique constraint errors
      if (
        error.name === "SequelizeValidationError" ||
        error.name === "SequelizeUniqueConstraintError"
      ) {
        const errors = error.errors.map((err) => err.message);
        res.status(400).json({ errors });
      } else {
        // Return internal server error for other errors
        res.status(500).json({ error: "Internal server error" });
      }
    }
  })
);

module.exports = router;
