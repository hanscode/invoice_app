const { User } = require("../models");

const userData = [
  {
    firstName: "Hans",
    lastName: "Steffens",
    emailAddress: "hans@pricode.io",
    password: "password",
  },
  {
    firstName: "John",
    lastName: "Smith",
    emailAddress: "john23@smith.com",
    password: "password",
  },
  {
    firstName: "Sally",
    lastName: "Jones",
    emailAddress: "sally@jones.com",
    password: "password",
  },
];

const seedUsers = async () => {
  try {
    await User.bulkCreate(userData);
    console.log("Users seeded successfully");
  } catch (error) {
    console.error("Error seeding users:", error);
  }
};

const deleteUsers = async () => {
  try {
    await User.destroy({ truncate: true });
    console.log("Users deleted successfully");
  } catch (error) {
    console.error("Error deleting users:", error);
  }
};

module.exports = {
  up: seedUsers,
  down: deleteUsers,
};
