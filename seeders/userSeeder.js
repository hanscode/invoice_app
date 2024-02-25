const { User } = require("../models");

const userData = [
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

module.exports = {
  up: seedUsers,
};
