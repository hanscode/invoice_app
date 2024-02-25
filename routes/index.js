const express = require('express');
const usersRouter = require('./users');
const invoicesRouter = require('./invoices');
const customersRouter = require('./customers');

const router = express.Router();

// Mount routers
router.use('/users', usersRouter);
router.use('/invoices', invoicesRouter);
router.use('/customers', customersRouter);

module.exports = router;