/**
 * @param {array} invoices - An array of invoice objects
 * @param {string} property - The property to sum that is present in each invoice object
 * @param {function} condition - A function that returns true or false for each invoice
 * @returns - The sum of the property of all invoices that meet the condition
 */
const calculateAmount = (invoices, property, condition) => {
  return invoices.reduce(
    (sum, invoice) => sum + (condition(invoice) ? invoice[property] : 0),
    0
  );
};

export default calculateAmount;
