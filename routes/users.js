"use strict";

const express = require("express");
const { asyncHandler } = require("../middleware/async-handler");
const { User } = require("../models");
const { authenticateUser } = require("../middleware/auth-user");
const {generateToken, authenticateToken} = require('../middleware/authenticate-token');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

// Construct a router instance.
const router = express.Router();

/**
 * Users Routes
 */

// Route that returns all properties and values for the currently authenticated User
// along with a 200 HTTP status code.
router.get(
  "/users",
  authenticateUser,
  asyncHandler(async (req, res) => {
    const authenticatedUser = req.currentUser;
    const userProperties = await User.findOne({
      attributes: ["id", "firstName", "lastName", "emailAddress"],
      where: { id: authenticatedUser.id },
    });
    // Generate a token with a dynamic expiration time
    const token = generateToken(authenticatedUser.id);
    // Extract the expiration time from the generated token
    const decodedToken = jwt.decode(token);
    const expiration = decodedToken.exp * 1000; // Convert seconds to milliseconds
    // Respond with the token, expiration time, and user information
    res.status(200).json({ token, expiration, user: userProperties });
  })
);

// Route that creates a new user.
router.post(
  "/users",
  asyncHandler(async (req, res) => {
    try {
      // create a new user
     const newUser = await User.create(req.body);
     // Generate a token for the new user
     const token = generateToken(newUser.id);

     // Respond with the token and user information
      res.status(201).json({ token, user: newUser }).setHeader("Location", "/").end();
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

// Route that updates an existing user.
router.put(
  "/users/:id",
  authenticateUser,
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const authenticatedUser = req.currentUser;

    // Check if the authenticated user is the same as the user being updated
    if (authenticatedUser.id !== parseInt(userId)) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this user." });
    }

    try {
      // Find the user by ID
      let user = await User.findByPk(userId);

      // If the user is not found, return a 404 status code
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // Update user properties
      if (req.body.firstName) {
        user.firstName = req.body.firstName;
      }
      if (req.body.lastName) {
        user.lastName = req.body.lastName;
      }
      if (req.body.emailAddress) {
        user.emailAddress = req.body.emailAddress;
      }

      /**
       * Update the password if the user provides a new password (req.body.newPassword).
       * Before updating the password, check if the current password (req.body.currentPassword)
       * is correct or match the current authenticated user's password.
       */

      if (req.body.newPassword) {
        const currentPassword = req.body.currentPassword;
        const newPassword = req.body.newPassword;

        // Compare the current password with the user's password
        const passwordMatch = bcrypt.compareSync(
          currentPassword,
          authenticatedUser.password
        );

        // If the passwords match, update the user's password
        if (passwordMatch) {
          // Update the password with the new password
          user.password = newPassword; // Set the new password directly
        } else {
          return res.status(403).json({ message: "Current password is incorrect." });
        }
      }

      // Save the updated user
      await user.save();

      // Return a 200 status code with the updated user
      res.status(200).json(user);
    } catch (error) {
      console.error("Error updating user:", error);

      // Log the error object to inspect its structure
      console.log("Error object:", error);

      if (
        error.name === "SequelizeValidationError" ||
        error.name === "SequelizeUniqueConstraintError"
      ) {
        const errors = error.errors.map((err) => err.message);
        return res.status(400).json({ errors });
      } else {
        res.status(500).json({ message: "Internal Server Error." });
      }
    }
  })
);

module.exports = router;
