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

// Send a POST request to /payments/invoice/:invoiceId to record a payment for a specific invoice.
router.post(
  "/payments/invoice/:invoiceId",
  authenticateUser,
  asyncHandler(async (req, res) => {
    let transaction;
    try {
      // Start a transaction
      transaction = await sequelize.transaction();
      // Get the authenticated user
      const authenticatedUser = req.currentUser;
      // Fetch the invoice
      const invoice = await Invoice.findByPk(req.params.invoiceId, {
        transaction,
      });

      if (invoice.userId !== authenticatedUser.id) {
        // Return a 403 response if the invoice does not belong to the authenticated user
        return res.status(403).json({
          message: "This invoice does not belong to the authenticated user",
        });
      }

      // Calculate the total amount paid for the invoice
      const totalAmountPaid = await Payment.sum("amountPaid", {
        where: { invoiceId: req.params.invoiceId },
        transaction,
      });

      // Calculate the remaining amount due on the invoice
      const remainingAmountDue = invoice.totalAmount - totalAmountPaid;

      // Check if the payment amount exceeds the remaining amount due
      const paymentAmount = parseFloat(req.body.amountPaid);
      if (paymentAmount > remainingAmountDue) {
        return res.status(400).json({
          error:
            "Payment amount exceeds the remaining amount due on the invoice",
        });
      }

      // Update the invoice status based on the total amount paid
      let status;
      if (totalAmountPaid + paymentAmount >= invoice.totalAmount) {
        status = "paid";
      } else if (totalAmountPaid + paymentAmount > 0) {
        status = "partially paid";
      } else {
        status = "unpaid";
      }

      // Update the invoice status
      await Invoice.update(
        { status },
        { where: { id: req.params.invoiceId }, transaction }
      );

      // Calculate the new dueBalance
      const newDueBalance = invoice.totalAmount - (totalAmountPaid + paymentAmount);

      // Update the dueBalance attribute in the invoice
      await Invoice.update(
        { dueBalance: newDueBalance },
        { where: { id: req.params.invoiceId }, transaction }
      );

      // Record the payment details
      const payment = await Payment.create(
        {
          invoiceId: req.params.invoiceId,
          amountPaid: paymentAmount,
          paymentDate: req.body.paymentDate,
          userId: authenticatedUser.id, 
          customerId: invoice.customerId,
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
        // Return custom error message for other errors
        res.status(500).json({ error: "Failed to record invoice payment" });
      }
    }
  })
);

// Send a GET request to /payments/invoice/:invoiceId to retrieve all payments for a specific invoice.
router.get(
  "/payments/invoice/:invoiceId",
  authenticateUser,
  asyncHandler(async (req, res) => {
    try {
      // Get the authenticated user
      const authenticatedUser = req.currentUser;
      const invoice = await Invoice.findByPk(req.params.invoiceId);
      // Fetch all payments for the invoice
      const payments = await Payment.findAll({
        where: { invoiceId: req.params.invoiceId },
      });
      if ( authenticatedUser.id !== invoice.userId){ 
        return res.status(403).json({ error: "User is not owner of the requested invoice" });
      }
      // If no payments are found, return a 404 response
      if (!payments || payments.length === 0) {
        return res
          .status(404)
          .json({ error: "No payments found for the invoice" });
      }
      res.status(200).json(payments);
    } catch (error) {
      console.error("Error: ", error);
      res
        .status(500)
        .json({ error: "Failed to retrieve payments for the invoice" });
    }
  })
);

// Send a GET request to /payments/invoice/:invoiceId/:paymentId to retrieve a specific payment for a specific invoice.
router.get(
  "/payments/invoice/:invoiceId/:paymentId",
  authenticateUser,
  asyncHandler(async (req, res) => {
    try {
      // Get the authenticated user
      const authenticatedUser = req.currentUser;
      // Find the payment with the specified paymentId and invoiceId
      const payment = await Payment.findOne({
        where: {
          id: req.params.paymentId,
          invoiceId: req.params.invoiceId,
        },
      });

      if (authenticatedUser.id !== payment.userId) {
        return res.status(403).json({
          error: "User is not owner of the requested payment",
        });
      }

      // If no payment is found, return a 404 response
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      // Return the payment
      res.status(200).json(payment);
    } catch (error) {
      console.error("Error: ", error);
      res.status(500).json({ error: "Failed to retrieve payment" });
    }
  })
);

// Send a PUT request to /payments/:paymentId to update a specific payment.
router.put(
  "/payments/invoice/:invoiceId/:paymentId",
  authenticateUser,
  asyncHandler(async (req, res) => {
    let transaction;
    try {
      transaction = await sequelize.transaction();
      const payment = await Payment.findByPk(req.params.paymentId, {
        transaction,
      });

      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      // Update payment details
      await payment.update(req.body, { transaction });

      await transaction.commit();
      res.status(200).json({
        success: true,
        message: "Payment updated successfully",
        payment,
      });
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.error("Error: ", error);
      if (
        error.name === "SequelizeValidationError" ||
        error.name === "SequelizeUniqueConstraintError"
      ) {
        const errors = error.errors.map((err) => err.message);
        res.status(400).json({ errors });
      } else {
        res.status(500).json({ error: "Failed to update payment" });
      }
    }
  })
);

// Send a DELETE request to /payments/:paymentId to delete a specific payment.
router.delete(
  "/payments/invoice/:invoiceId/:paymentId",
  authenticateUser,
  asyncHandler(async (req, res) => {
    let transaction;
    try {
      transaction = await sequelize.transaction();
      const authenticatedUser = req.currentUser;
      const payment = await Payment.findByPk(req.params.paymentId, {
        transaction,
      });

      if (authenticatedUser.id !== payment.userId) {
        return res.status(403).json({
          error: "User is not owner of the requested payment",
        });
      }

      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      await payment.destroy({ transaction });
      await transaction.commit();
      res
        .status(200)
        .json({ success: true, message: "Payment deleted successfully" });
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.error("Error: ", error);
      res.status(500).json({ error: "Failed to delete payment" });
    }
  })
);

module.exports = router;
