"use strict";

const express = require("express");
const { asyncHandler } = require("../middleware/async-handler");
const { User, Invoice} = require("../models");
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
        "customerName",
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
    res.status(200).json(invoices);
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
        "customerName",
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
    if (invoice) {
      res.status(200).json(invoice);
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
      const invoice = await Invoice.create(req.body);
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
          // update the invoice object from the request body
          await invoice.update(req.body);
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
