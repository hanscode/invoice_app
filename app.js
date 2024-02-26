// load modules
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');

// Routes
const users = require('./routes/users');
const invoices = require('./routes/invoices');
const customers = require('./routes/customers');

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();
const PORT = process.env.PORT || 8888;

// importing db instance of sequlize from model/index.js
const db = require("./models"); // Accessing all Sequelizes methods and functionality

// Test connection to the DB
// async IIFE
(async () => {
    try {
      await db.sequelize.authenticate();
      console.log("Connection to the database successful!");
      db.sequelize.sync();
      console.log("Sychronized the model with the db");
    } catch (error) {
      console.error("Error connecting to the database: ", error);
    }
})();

// Enable All CORS Requests
app.use(cors());

// Setup request body JSON parsing.
app.use(express.json());

// setup morgan which gives us http request logging
app.use(morgan('dev'));

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API for the Invoice App!',
  });
});;

// Add routes.
app.use('/api', users);
app.use('/api', invoices);
app.use('/api', customers);

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

app.listen(PORT, () => {
  console.log(`Express app listening at http://localhost:${PORT}`);
});