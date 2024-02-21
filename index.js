const express = require('express');
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

app.get('/', (req, res) => {
  res.send('Hello World Hans!');
});

app.listen(PORT, () => {
  console.log(`Express app listening at http://localhost:${PORT}`);
});