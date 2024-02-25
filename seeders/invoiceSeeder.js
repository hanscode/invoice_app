const { Invoice, User, Customer } = require("../models");
const seedCustomers = require("./customerSeeder"); // Import the customer seeder
const seedUsers = require("./userSeeder"); // Import the user seeder

// Function to generate a random numeric string
const generateRandomString = (length) => {
  const characters = "0123456789"; // Numeric characters only
  let randomString = "";
  for (let i = 0; i < length; i++) {
    randomString += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return randomString;
};

// Function to generate a unique invoice number
const generateUniqueInvoiceNumber = async (userFirstName, userLastName) => {
  let uniqueInvoiceNumber;
  let isUnique = false;

  while (!isUnique) {
    // Generate the invoice number
    const invoiceNumber = generateInvoiceNumber(userFirstName, userLastName);
    // Check if the generated invoice number already exists in the database
    const existingInvoice = await Invoice.findOne({ where: { invoiceNumber } });
    // If the generated invoice number doesn't exist, it's unique
    if (!existingInvoice) {
      uniqueInvoiceNumber = invoiceNumber;
      isUnique = true;
    }
  }

  return uniqueInvoiceNumber;
};

// Function to generate a random invoice number with user initials as prefix
const generateInvoiceNumber = (userFirstName, userLastName) => {
  // Get the first letter of the first name (converted to uppercase)
  const firstNameInitial = userFirstName.charAt(0).toUpperCase();
  // Get the first letter of the last name (converted to uppercase)
  const lastNameInitial = userLastName.charAt(0).toUpperCase();
  // Generate a random numeric string
  const randomString = generateRandomString(4); // The length of the random string
  // Combine the initials and random string to form the invoice number
  return `${firstNameInitial}${lastNameInitial}-${randomString}`;
};

const invoiceData = [
  {
    issueDate: "2021-01-01",
    dueDate: "2021-01-31",
    totalAmount: 1000.0,
    items: [
      {
        description: "WordPress website development",
        quantity: 1,
        unitPrice: 1000.0,
      },
    ],
    status: "draft",
  },
  {
    issueDate: "2021-02-01",
    dueDate: "2021-02-28",
    totalAmount: 2000.0,
    items: [
      {
        description: "UX/UI design",
        quantity: 2,
        unitPrice: 1000.0,
      },
    ],
    status: "draft",
  },
  {
    issueDate: "2021-03-01",
    dueDate: "2021-03-31",
    totalAmount: 3000.0,
    items: [
      {
        description: "React web app development",
        quantity: 3,
        unitPrice: 1000.0,
      },
    ],
    status: "draft",
  },
];

const seedInvoices = async () => {
  try {
    // Check if any users exist
    const existingUsers = await User.count();
    // Check if any customers exist
    const existingCustomers = await Customer.count();

    // If no users or customers exist, seed them
    if (existingUsers === 0 || existingCustomers === 0) {
      console.log("Seeding users and customers...");
      // Seed users and customers first
      await seedUsers.up();
      await seedCustomers.up();
    } else {
      console.log("Users and customers already seeded, skipping...");
    }

    // Get all users and customers from the database
    const users = await User.findAll();
    const customers = await Customer.findAll();

    // Iterate over each invoice, generate a unique invoice number with user initials as prefix, and assign a user and customer
    const invoicesWithAssociations = await Promise.all(
      invoiceData.map(async (invoice, index) => {
        return {
          ...invoice,
          invoiceNumber: await generateUniqueInvoiceNumber(
            users[index % users.length].firstName,
            users[index % users.length].lastName
          ),
          userId: users[Math.floor(Math.random() * users.length)].id,
          customerId: customers[Math.floor(Math.random() * customers.length)].customerId,
        };
      })
    );

    // Seed invoices with associations
    await Invoice.bulkCreate(invoicesWithAssociations);
    console.log("Invoices seeded successfully");
  } catch (error) {
    console.error("Error seeding invoices:", error);
  }
};

module.exports = {
  up: seedInvoices,
};
