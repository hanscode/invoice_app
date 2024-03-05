
const calculateOverdue = (invoices, condition) => {
    return (
        invoices.reduce((sum, invoice) => sum + (condition(invoice) ? invoice.amountDue : 0), 0)
      )
}

export default calculateOverdue