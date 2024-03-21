import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/apiHelper";

import ErrorsDisplay from "../ErrorsDisplay";
import UserContext from "../../context/UserContext";

const CreateInvoice = () => {
  const { authUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [itemFields, setItemFields] = useState([
    { description: "", hours: "", rate: "", amount: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [taxRate, setTaxRate] = useState(0);
  // Define state for subtotal, total with tax, and amount due
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [amountDue, setAmountDue] = useState(0);
  const [paid, setPaid] = useState(0);

  // Calculate subtotal, total with tax, and amount due
  useEffect(() => {
    let newSubtotal = itemFields.reduce(
      (total, item) => total + parseFloat(item.amount || 0),
      0
    );
    let taxValue = 0;
    if (taxRate > 0) {
      taxValue = newSubtotal * (taxRate / 100);
    }
    
    let newTotal = newSubtotal + taxValue;
    let newPaid = 0; // Initially, paid is 0
    let newAmountDue = newTotal - paid ; // Initially, amount due is the same as total

    setSubtotal(newSubtotal);
    setTotal(newTotal);
    setPaid(newPaid);
    setAmountDue(newAmountDue);

  }, [itemFields, taxRate, paid]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...itemFields];
    newItems[index][field] = value;
    setItemFields(newItems);
    // Recalculate amount only if hours or rate is changed
    if (field === "hours" || field === "rate") {
      if (!newItems[index].hours || !newItems[index].rate) {
        newItems[index].amount = 0;
        setItemFields(newItems);
      } else {
        handleAmountChange(index);
      }
    }
  };

  const handleAmountChange = (index) => {
    const hours = parseFloat(itemFields[index].hours);
    const rate = parseFloat(itemFields[index].rate);

    if (!isNaN(hours) && !isNaN(rate)) {
      const amount = (hours * rate).toFixed(2);
      const newItems = [...itemFields];
      newItems[index].amount = amount;
      setItemFields(newItems);
    }
  };

  const handleAddItem = () => {
    setItemFields((prevState) => [
      ...prevState,
      { description: "", hours: "", rate: "", amount: "" },
    ]);
  };

  const handleRemoveItem = (index) => {
    setItemFields((prevState) => {
      const newItems = [...prevState];
      newItems.splice(index, 1);
      return newItems;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const invoiceData = {
      invoiceNumber,
      issueDate,
      dueDate,
      from,
      to,
      items: itemFields.map(({ description, hours, rate, amount }) => ({
        description,
        hours: parseFloat(hours),
        rate: parseFloat(rate),
        amount: parseFloat(amount) || 0,
      })),
    };

    try {
      const response = await api(
        "/invoices",
        "POST",
        invoiceData,
        authUser.token
      );
      if (response.status === 201) {
        const newInvoice = await response.json();
        navigate(`/invoices/${newInvoice.id}`);
      } else if (response.status === 400) {
        const errorData = await response.json();
        setErrors(errorData.errors);
      } else if (response.status === 500) {
        navigate(`/error`);
      } else {
        throw new Error();
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1>Create Invoice</h1>
      <ErrorsDisplay errors={errors} />
      <form onSubmit={handleSubmit}>
        {/* Input fields for invoice data */}
        <input
          type="text"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
          placeholder="Invoice Number"
          required
        />
        <input
          type="date"
          value={issueDate}
          onChange={(e) => setIssueDate(e.target.value)}
          placeholder="Issue Date"
          required
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          placeholder="Due Date"
          required
        />
        <input
          type="text"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder="From"
          required
        />
        <input
          type="text"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="To"
          required
        />

        {/* Input fields for invoice items */}
        {itemFields.map((item, index) => (
          <div key={index}>
            <input
              type="text"
              value={item.description}
              onChange={(e) =>
                handleItemChange(index, "description", e.target.value)
              }
              placeholder="Item Description"
            />
            <input
              type="number"
              value={item.hours}
              onChange={(e) => handleItemChange(index, "hours", e.target.value)}
              placeholder="Item Hours"
            />
            <input
              type="number"
              value={item.rate}
              onChange={(e) => handleItemChange(index, "rate", e.target.value)}
              placeholder="Item Rate"
            />
            <input
              type="number"
              value={item.amount}
              readOnly
              placeholder="Item Amount"
            />
            {index > 0 && (
              <button type="button" onClick={() => handleRemoveItem(index)}>
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={handleAddItem}>
          Add Item
        </button>
        <br />
        <input
          type="number"
          value={taxRate || ""}
          onChange={(e) => setTaxRate(parseFloat(e.target.value))}
          placeholder="Tax Rate (%)"
        />

        {/* Totals */}
        <p>SubTotal: {subtotal.toFixed(2)}</p>
        <p>Total: {total.toFixed(2)}</p>
        <p>Paid: {paid.toFixed(2)}</p>
        <p>Amount Due: {amountDue.toFixed(2)}</p>

        {/* Button to submit form */}
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Invoice"}
        </button>
      </form>
    </>
  );
};

export default CreateInvoice;
