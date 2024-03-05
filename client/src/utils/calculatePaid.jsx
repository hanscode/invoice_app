const calculatePaid = (invoices, condition) => {
    return (
        invoices.reduce((sum, invoice) => sum + (condition(invoice) ? invoice.paid : 0), 0)
      )
}

export default calculatePaid