const calculateTotal = (invoices, condition) => {
  return (
    invoices.reduce((sum, invoice) => sum + (condition(invoice) ? invoice.totalAmount : 0), 0)
  )
}

export default calculateTotal