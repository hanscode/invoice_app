"use strict";

require("dotenv").config(); // Load environment variables from .env file

const auth = require("basic-auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

/**
 * Middleware to authenticate the request using Basic Authentication.
 * @param {Request} req - The Express Request object.
 * @param {Response} res - The Express Response object.
 * @param {Function} next - The function to call to pass execution to the next middleware.
 */
exports.authenticateUser = async (req, res, next) => {
  let message; // store the message to display

  // Check if the token is provided in the Authorization header
  const authHeader = req.headers.authorization;

  // If the token is provided in the header
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1]; // Extract the token
    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

      // Find the user associated with the token
      const user = await User.findByPk(decoded.userId);

      // If the user is not found, return an error
      if (!user) {
        return res
          .status(401)
          .json({ message: "Access Denied. Invalid token." });
      }

      // Store the user object on the request object for later use
      req.currentUser = user;

      // If the token is valid, call the next middleware
      return next();
    } catch (error) {
      console.error("Error authenticating user:", error);
      return res.status(401).json({ message: "Access Denied. Invalid token." });
    }
  }

  // If the token is not provided, fall back to Basic Authentication
  // Parse the user's credentials from the Authorization header.
  const credentials = auth(req);

  if (!credentials) {
    return res
      .status(401)
      .json({ message: "Access Denied. Authorization header not found." });
  }

  // Attempt to retrieve the user from the data store
  const user = await User.findOne({
    where: { emailAddress: credentials.name },
  });

  // If a user was successfully retrieved from the data store...
  if (!user) {
    return res.status(401).json({ message: "Access Denied. User not found." });
  }

  // Use bcrypt to compare the user's password to the password from the request
  const authenticated = bcrypt.compareSync(credentials.pass, user.password);

  if (!authenticated) {
    return res
      .status(401)
      .json({ message: "Access Denied. Invalid credentials." });
  }

  // Store the retrieved user object on the request object
  req.currentUser = user;

  // If authentication succeeds, call the next middleware
  next();
};