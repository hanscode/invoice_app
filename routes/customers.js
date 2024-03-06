"use strict";

const express = require("express");
const { asyncHandler } = require("../middleware/async-handler");
const { Customer, User } = require("../models");
const { authenticateUser } = require("../middleware/auth-user");
const { Op } = require("sequelize");

// Construct a router instance.
const router = express.Router();

const randomValue = () => Math.floor(Math.random() * 256);

function getRandomColor(value) {
  const color = `rgb( ${value()}, ${value()}, ${value()} )`;
  return color;
}

/**
 * Customers Routes
 */

// Send a GET request to /customers to return all customers for the currently authenticated user.
router.get(
  "/customers",
  authenticateUser,
  asyncHandler(async (req, res) => {
    const authenticatedUser = req.currentUser;

    // Define pagination parameters
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const offset = (page - 1) * limit;

    const customers = await Customer.findAll({
      attributes: [
        "customerId",
        "name",
        "email",
        "phone",
        "address",
        "notes",
        "userId",
        "color",
        "createdAt",
        "updatedAt"
      ],
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName", "emailAddress"],
        },
      ],
      where: { userId: authenticatedUser.id },
      offset,
      limit,
      order: [["name", "ASC"]],
    });

    const totalCount = await Customer.count({
      where: { userId: authenticatedUser.id }
    });

    res.status(200).json({customers, totalCount});
  })
);

// GET individual customer details
router.get(
  "/customers/:customerId",
  authenticateUser,
  asyncHandler(async (req, res, next) => {
    // retrieve the current authenticated user's information from the Request object's `currentUser` property:
    const user = req.currentUser;
    const customer = await Customer.findOne({
      attributes: [
        "customerId",
        "name",
        "email",
        "phone",
        "address",
        "notes",
        "color",
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
      where: { customerId: req.params.customerId },
    });
    if (customer) {
      // Confirming that the currently authenticated user is the owner of the requested customer.
      const customerOwner = customer.userId;
      const authenticatedUser = user.id;
      if (customerOwner === authenticatedUser) {
       res.status(200).json(customer);
      } else {
       res.status(403).json({message: "User is not owner of the requested customer"});
     }
    } else {
      res.status(404).json({ message: "Customer not found" });
    }
  })
);

// POST route that will create a new customer.
router.post(
  "/customers",
  authenticateUser,
  asyncHandler(async (req, res) => {
    try {
      // Generate a random color for the new customer
      const color = getRandomColor(randomValue);

      const customer = await Customer.create({
        ...req.body,
        color, // Assign the random color
      });
      res
        .status(201)
        .setHeader("Location", `/customers/${customer.customerId}`)
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

// PUT route that will update the corresponding customer and return a 204 HTTP status code and no content.
router.put(
  "/customers/:customerId",
  authenticateUser,
  asyncHandler(async (req, res) => {
    let customer;
    // retrieve the current authenticated user's information from the Request object's `currentUser` property:
    const user = req.currentUser;
    try {
      customer = await Customer.findByPk(req.params.customerId);
      if (customer) {
        // Confirming that the currently authenticated user is the owner of the requested customer.
        // This is because only the owner who created the customer should be able to update it.
        // In the future, we can add more roles and permissions to our application.
        const customerOwner = customer.userId;
        const authenticatedUser = user.id;

        if (customerOwner === authenticatedUser) {
          // update the customer object from the request body
          await customer.update(req.body);
          // Send status 204 (meaning no content == everything went OK but there's nothing to send back)
          res.status(204).end();
        } else {
          res
            .status(403)
            .json({ message: "User is not owner of the requested customer" });
        }
      } else {
        res.status(400).json({ message: "Customer not found" });
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

// DELETE route that will delete the corresponding customer and return a 204 HTTP status code and no content.
router.delete(
  "/customers/:customerId",
  authenticateUser,
  asyncHandler(async (req, res) => {
    let customer;
    // retrieve the current authenticated user's information from the Request object's `currentUser` property:
    const user = req.currentUser;
    try {
      customer = await Customer.findByPk(req.params.customerId);
      if (customer) {
        // Confirming that the currently authenticated user is the owner of the requested customer info.
        const customerOwner = customer.userId;
        const authenticatedUser = user.id;

        if (customerOwner === authenticatedUser) {
          // Delete the customer object
          await customer.destroy();
          // Send status 204 (meaning no content == everything went OK but there's nothing to send back)
          res.status(204).end();
        } else {
          res
            .status(403)
            .json({ message: "User is not owner of the requested customer" });
        }
      } else {
        res.status(400).json({ message: "Customer not found" });
      }
    } catch (error) {
      console.log("Error: ", error);
    }
  })
);

module.exports = router;
