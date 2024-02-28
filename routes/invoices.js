"use strict";

const express = require("express");
const { asyncHandler } = require("../middleware/async-handler");
const { User, Invoice, Customer } = require("../models");
const { authenticateUser } = require("../middleware/auth-user");

// Construct a router instance.
const router = express.Router();

/**
 * Invoices Routes
 */

// Send a GET request to /invoices to return all invoices for the currently authenticated user.
router.get(
  "/invoices",
  authenticateUser,
  asyncHandler(async (req, res) => {
    const authenticatedUser = req.currentUser;
    const invoices = await Invoice.findAll({
      attributes: [
        "id",
        "invoiceNumber",
        "customerId", // Include customerId for fetching customer names.
        "issueDate",
        "dueDate",
        "totalAmount",
        "items",
        "tax",
        "discount",
        "status",
        "userId",
      ],
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName", "emailAddress"],
        },
      ],
      where: { userId: authenticatedUser.id },
    });
    // Extract unique customerIds from the fetched invoices
    const customerIds = invoices.map((invoice) => invoice.customerId);

    // Fetch customer names based on the extracted customerIds
    const customers = await Customer.findAll({
      attributes: ["customerId", "name"],
      where: { customerId: customerIds },
    });

    // Map customer names to a dictionary for easy lookup
    const customerNameMap = {};
    customers.forEach((customer) => {
      customerNameMap[customer.customerId] = customer.name;
    });

    // Prepare the response with customer names added to each invoice
    const responseInvoices = invoices.map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customerId,
      // Add customerName based on customerId lookup
      customerName: customerNameMap[invoice.customerId] || null,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      totalAmount: invoice.totalAmount,
      items: invoice.items,
      tax: invoice.tax,
      discount: invoice.discount,
      status: invoice.status,
      userId: invoice.userId,
      user: { 
        id: invoice.User.id,
        firstName: invoice.User.firstName,
        lastName: invoice.User.lastName,
        emailAddress: invoice.User.emailAddress,
      }
    }));

    res.status(200).json(responseInvoices);
  })
);

// GET individual invoice details
router.get(
  "/invoices/:id",
  authenticateUser,
  asyncHandler(async (req, res, next) => {
    const invoice = await Invoice.findOne({
      attributes: [
        "id",
        "invoiceNumber",
        "customerId",
        "issueDate",
        "dueDate",
        "totalAmount",
        "items",
        "tax",
        "discount",
        "status",
        "userId",
      ],
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName", "emailAddress"],
        },
      ],
      where: { id: req.params.id },
    });
    // Extract unique customerId from the fetched invoice
    const clientId = invoice.customerId;

    // Fetch customer name based on the extracted customerId
    const customer = await Customer.findOne({
      attributes: ["customerId", "name"],
      where: { customerId: clientId },
    });

    if (invoice) {
      // Prepare the response with customerName added to the invoice
      const responseInvoice = {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerId: invoice.customerId,
        customerName: customer.name, // Add customerName
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        totalAmount: invoice.totalAmount,
        items: invoice.items,
        tax: invoice.tax,
        discount: invoice.discount,
        status: invoice.status,
        userId: invoice.userId,
        user: { 
          id: invoice.User.id,
          firstName: invoice.User.firstName,
          lastName: invoice.User.lastName,
          emailAddress: invoice.User.emailAddress,
        }
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
  asyncHandler(async (req, res) => {
    try {
      // Fetch customer details based on the provided customerId
      const customer = await Customer.findByPk(req.body.customerId);

      if (!customer) { // If customer not found, return 400 status code with error message
        return res.status(400).json({ message: "Customer not found" });
      } 
      // Create the invoice with the provided data and customerName
      const invoice = await Invoice.create({
        ...req.body,
        customerName: customer.name, // Include customerName in the invoice
      });

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
