"use strict";

const express = require("express");
const { asyncHandler } = require("./middleware/async-handler");
const User = require("./models").User;
const Invoice = require("./models").Invoice;
const { authenticateUser } = require('./middleware/auth-user');

// Construct a router instance.
const router = express.Router();

/**
 * Users Routes
 */

// Route that returns all properties and values for the currently authenticated User 
// along with a 200 HTTP status code.
router.get("/users", authenticateUser, asyncHandler(async (req, res) => {
    const authenticatedUser = req.currentUser;
    const userProperties = await User.findOne({
      attributes: ['id', 'firstName', 'lastName', 'emailAddress'],
      where: { id: authenticatedUser.id }
    });
    res.status(200).json(userProperties);
    })
  );

// Route that creates a new user.
router.post("/users", asyncHandler(async (req, res) => {
    try {
      await User.create(req.body);
      res
        .status(201)
        .setHeader("Location", "/")
        .end();
    } catch (error) {
      console.log("ERROR: ", error);

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


module.exports = router;