"use strict";

const express = require("express");
const { asyncHandler } = require("../middleware/async-handler");
const { User, Invoice, Customer, History } = require("../models");
const { authenticateUser } = require("../middleware/auth-user");
const { authenticateToken } = require("../middleware/authenticate-token");
const { logHistory } = require("../utils/historyLogger");

// Construct a router instance.
const router = express.Router();

/**
 * Invoices Routes
 */

// Send a GET request to /invoices to return all invoices for the currently authenticated user.
router.get(
  "/invoices",
  authenticateUser,
  authenticateToken,
  asyncHandler(async (req, res) => {
    const authenticatedUser = req.currentUser;

    // Retrieve the customer ID from the query parameters
    const customerId = req.query.customerId;

    // Define pagination parameters
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const offset = page ? limit * (page - 1) : 0;

    // Define the where clause for filtering invoices by customer ID
    const whereClause = { userId: authenticatedUser.id };
    if (customerId) {
      whereClause.customerId = customerId;
    }

    const invoices = await Invoice.findAll({
      attributes: [
        "id",
        "invoiceNumber",
        "customerId",
        "customerName",
        "issueDate",
        "dueDate",
        "totalAmount",
        "amountDue",
        "paid",
        "items",
        "tax",
        "discount",
        "status",
        "createdAt",
        "updatedAt",
        "userId",
      ],
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName", "emailAddress"],
        },
      ],
      where: whereClause,
      offset,
      limit,
      order: [["issueDate", "DESC"]],
    });

    // Query total count of invoices (without pagination)
    const totalCount = await Invoice.count({
      where: whereClause,
    });

    // Prepare the response with customer names added to each invoice
    const responseInvoices = invoices.map((invoice) => ({
      ...invoice.dataValues,
      isOverdue:
        new Date(invoice.dueDate) < new Date() && invoice.status !== "paid",
    }));

    res.status(200).json({ invoices: responseInvoices, totalCount });
  })
);

// GET individual invoice details
router.get(
  "/invoices/:id",
  authenticateUser,
  authenticateToken,
  asyncHandler(async (req, res, next) => {
    const invoice = await Invoice.findOne({
      attributes: [
        "id",
        "invoiceNumber",
        "customerId",
        "customerName",
        "issueDate",
        "dueDate",
        "totalAmount",
        "paid",
        "amountDue",
        "items",
        "tax",
        "discount",
        "status",
        "createdAt",
        "updatedAt",
        "userId",
      ],
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName", "emailAddress"],
        },
        {
          model: History, // Include the History model
        },
      ],
      where: { id: req.params.id },
    });

    if (invoice) {
      // Prepare the response with isOverdue checker added to the invoice
      const responseInvoice = {
        ...invoice.dataValues,
        isOverdue:
          new Date(invoice.dueDate) < new Date() && invoice.status !== "paid",
      };
      res.status(200).json(responseInvoice);
    } else {
      res.status(404).json({ message: "Invoice not found" });
    }
  })
);

// POST route that will create a new invoice.
router.post(
  "/invoices",
  authenticateUser,
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      // retrieve the current authenticated user's information from the Request object's `currentUser` property:
      const authenticatedUser = req.currentUser;
      // Fetch customer details based on the provided customerId
      const customer = await Customer.findByPk(req.body.customerId);
      // Extract the customerUserId from the customer object
      const customerUserId = customer ? customer.userId : null;

      if (!customer) {
        // If customer not found, return 400 status code with error message
        return res.status(400).json({ message: "Customer not found" });
      }

      if (customerUserId !== authenticatedUser.id) {
        // If the customer does not belong to the authenticated user, return 403 status code with error message
        return res.status(403).json({
          message: "Customer does not belong to the authenticated user",
        });
      }

      // Create the invoice with the provided data and customerName
      const invoice = await Invoice.create({
        ...req.body,
        customerName: customer.name, // Include customerName in the invoice
      });
      // Log history for creating an invoice
      await logHistory("Created", authenticatedUser.id, invoice.id, null);

      res
        .status(201)
        .setHeader("Location", `/invoices/${invoice.id}`)
        /** For clients to be able to access `Location` header,
         * the server must list it using the HTTP `Access-Control-Expose-Headers` header. */
        .setHeader("Access-Control-Expose-Headers", "Location")
        .end();
    } catch (error) {
      console.log("Error: ", error);

      // checking the error
      if (
        error.name === "SequelizeValidationError" ||
        error.name === "SequelizeUniqueConstraintError"
      ) {
        const errors = error.errors.map((err) => err.message);
        res.status(400).json({ errors });
      } else {
        // error caught in the asyncHandler's catch block
        throw error;
      }
    }
  })
);

// PUT route that will update the corresponding invoice and return a 204 HTTP status code and no content.
router.put(
  "/invoices/:id",
  authenticateUser,
  authenticateToken,
  asyncHandler(async (req, res) => {
    let invoice;
    // retrieve the current authenticated user's information from the Request object's `currentUser` property:
    const user = req.currentUser;
    try {
      invoice = await Invoice.findByPk(req.params.id);
      if (invoice) {
        // Confirming that the currently authenticated user is the owner of the requested invoice.
        // This is because only the owner of the invoice should be able to update it.
        // In the future, we can add more roles and permissions to our application.
        const invoiceOwner = invoice.userId;
        const authenticatedUser = user.id;

        if (invoiceOwner === authenticatedUser) {
          // Fetch customer details based on the provided customerId
          const customer = await Customer.findByPk(req.body.customerId);
          if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
          }
          // Update the invoice object from the request body, including customerName
          await invoice.update({
            ...req.body,
            customerName: customer.name, // Include customerName in the update
          });

          // Log history for updating an invoice
          await logHistory("Updated", invoiceOwner, invoice.id, null);

          // Send status 204 (meaning no content == everything went OK but there's nothing to send back)
          res.status(204).end();
        } else {
          res
            .status(403)
            .json({ message: "User is not owner of the requested invoice" });
        }
      } else {
        res.status(400).json({ message: "Invoice not found" });
      }
    } catch (error) {
      if (
        error.name === "SequelizeValidationError" ||
        error.name === "SequelizeUniqueConstraintError"
      ) {
        const errors = error.errors.map((err) => err.message);
        res.status(400).json({ errors });
      } else {
        throw error;
      }
    }
  })
);

// DELETE route that will delete the corresponding invoice and return a 204 HTTP status code and no content.
router.delete(
  "/invoices/:id",
  authenticateUser,
  authenticateToken,
  asyncHandler(async (req, res) => {
    let invoice;
    // retrieve the current authenticated user's information from the Request object's `currentUser` property:
    const user = req.currentUser;
    try {
      invoice = await Invoice.findByPk(req.params.id);
      if (invoice) {
        // Confirming that the currently authenticated user is the owner of the requested invoice.
        const invoiceOwner = invoice.userId;
        const authenticatedUser = user.id;

        if (invoiceOwner === authenticatedUser) {
          // Delete the invoice object
          await invoice.destroy();
          // Send status 204 (meaning no content == everything went OK but there's nothing to send back)
          res.status(204).end();
        } else {
          res
            .status(403)
            .json({ message: "User is not owner of the requested invoice" });
        }
      } else {
        res.status(400).json({ message: "Invoice not found" });
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  })
);

module.exports = router;
