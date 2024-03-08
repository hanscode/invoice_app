"use strict";

const express = require("express");
const { asyncHandler } = require("../middleware/async-handler");
const { User } = require("../models");
const { authenticateUser } = require("../middleware/auth-user");

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
    res.status(200).json(userProperties);
  })
);

// Route that creates a new user.
router.post(
  "/users",
  asyncHandler(async (req, res) => {
    try {
      await User.create(req.body);
      res.status(201).setHeader("Location", "/").end();
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

      // Check if a new password is provided and update it if necessary
      if (req.body.currentPassword && req.body.newPassword) {
        // Check if the provided current password matches the password stored in the database
        if (!bcrypt.compareSync(req.body.currentPassword, user.password)) {
          return res
            .status(400)
            .json({ message: "Current password is incorrect." });
        }

        // Update the password with the new password
        user.password = bcrypt.hashSync(req.body.newPassword, 10);
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
