import { useContext, useState, useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/apiHelper";

import { Menu, Transition } from "@headlessui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
  EllipsisVerticalIcon,
  CheckIcon,
  ChevronUpDownIcon,
} from "@heroicons/react/20/solid";
import { Combobox } from "@headlessui/react";

import ErrorsDisplay from "../ErrorsDisplay";
import UserContext from "../../context/UserContext";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const customers = [
  { id: 1, name: "Marketing Done Right, LLC" },
  { id: 2, name: "Hidden Forces, LLC" },
  { id: 3, name: "Chella Industries, Inc." },
  { id: 4, name: "Permalink, Inc." },
  { id: 5, name: "Numeric Computer Systems, Inc." },
  { id: 5, name: "The Design Booth, LLC." },
];

const CreateInvoice = () => {
  const { authUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const filteredCustomers =
    query === ""
      ? customers
      : customers.filter((customer) => {
          return customer.name.toLowerCase().includes(query.toLowerCase());
        });

  const [itemFields, setItemFields] = useState([
    { description: "", hours: "", rate: "", amount: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  //const [to, setTo] = useState("");
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
    let newAmountDue = newTotal - paid; // Initially, amount due is the same as total
    const userFrom = authUser ? `${authUser.firstName} ${authUser.lastName}` : "";
    const userEmail = authUser ? `${authUser.emailAddress}` : "";

    setFromName(userFrom);
    setFromEmail(userEmail);
    setSubtotal(newSubtotal);
    setTotal(newTotal);
    setPaid(newPaid);
    setAmountDue(newAmountDue);
  }, [itemFields, taxRate, paid, authUser]);

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
      selectedCustomer,
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
      <header className="relative isolate lg:border-b lg:border-b-gray-900/5 dark:lg:border-b-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-x-8 lg:mx-0 lg:max-w-none">
            <div className="flex items-center gap-x-6">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-slate-300">
                New Invoice
              </h1>
            </div>
            <div className="flex items-center gap-x-4 sm:gap-x-6">
              <button
                type="button"
                className="hidden text-sm font-semibold leading-6 text-indigo-600 hover:text-indigo-500 sm:block dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Cancel
              </button>
              <a
                href="#"
                className="hidden text-sm font-semibold leading-6 text-gray-900 hover:text-gray-600 sm:block dark:text-white dark:hover:text-slate-400"
              >
                Save as Draft
              </a>
              <a
                href="#"
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sent
              </a>

              <Menu as="div" className="relative sm:hidden">
                <Menu.Button className="-m-3 block p-3">
                  <span className="sr-only">More</span>
                  <EllipsisVerticalIcon
                    className="h-5 w-5 text-gray-500"
                    aria-hidden="true"
                  />
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-0.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          type="button"
                          className={classNames(
                            active ? "bg-gray-50" : "",
                            "block w-full px-3 py-1 text-left text-sm leading-6 text-gray-900"
                          )}
                        >
                          Cancel
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          type="button"
                          className={classNames(
                            active ? "bg-gray-50" : "",
                            "block px-3 py-1 text-sm leading-6 text-gray-900"
                          )}
                        >
                          Save as Draft
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="-mx-4 px-4 py-8 shadow-sm ring-1 ring-gray-900/5 dark:ring-slate-700 sm:mx-0 sm:rounded-lg sm:px-8 sm:pb-14 lg:col-span-2 lg:row-span-2 lg:row-end-2 xl:px-16 xl:pb-20 xl:pt-16">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
            <div>
            <h2 className="text-base font-semibold leading-7 text-gray-900">{fromName}</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
             {fromEmail}
            </p>
            </div>

            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
            <div className="sm:col-span-6">
                  <Combobox
                    as="div"
                    value={selectedCustomer}
                    onChange={setSelectedCustomer}
                  >
                    <Combobox.Label className="block text-sm font-medium leading-6 text-gray-900">
                      Client
                    </Combobox.Label>
                    <div className="relative mt-2">
                      <Combobox.Input
                        className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        onChange={(event) => setQuery(event.target.value)}
                        displayValue={(customer) => customer?.name}
                      />
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                        <ChevronUpDownIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </Combobox.Button>

                      {filteredCustomers.length > 0 && (
                        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {filteredCustomers.map((client) => (
                            <Combobox.Option
                              key={client.id}
                              value={client}
                              className={({ active }) =>
                                classNames(
                                  "relative cursor-default select-none py-2 pl-3 pr-9",
                                  active
                                    ? "bg-indigo-600 text-white"
                                    : "text-gray-900"
                                )
                              }
                            >
                              {({ active, selected }) => (
                                <>
                                  <span
                                    className={classNames(
                                      "block truncate",
                                      selected && "font-semibold"
                                    )}
                                  >
                                    {client.name}
                                  </span>

                                  {selected && (
                                    <span
                                      className={classNames(
                                        "absolute inset-y-0 right-0 flex items-center pr-4",
                                        active
                                          ? "text-white"
                                          : "text-indigo-600"
                                      )}
                                    >
                                      <CheckIcon
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                      />
                                    </span>
                                  )}
                                </>
                              )}
                            </Combobox.Option>
                          ))}
                        </Combobox.Options>
                      )}
                    </div>
                  </Combobox>
                </div>
                <div className="sm:col-span-3">
                  <label
                    htmlFor="issueDate"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Issue Date
                  </label>
                  <DatePicker
                  id="issueDate"
                    placeholder="Issue Date"
                    selected={issueDate}
                    onChange={(date) => setIssueDate(date)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    required
                  />
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="dueDate"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Due Date
                  </label>
                  <DatePicker
                    id="dueDate"
                    placeholder="Due Date"
                    selected={dueDate}
                    onChange={(date) => setDueDate(date)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    required
                  />
                </div>
                <div className="sm:col-span-3">
                  <label
                    htmlFor="invoiceNumber"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    id="invoiceNumber"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="Enter the invoice's number"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    required
                  />
                </div>
            </div>

        </div>

          <h1>Create Invoice</h1>

          <ErrorsDisplay errors={errors} />
          <form onSubmit={handleSubmit}>
            {/* Display initial inputs */}

            {/* end of initial inputs */}

            {/* Input fields for invoice data */}
            {/* <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="Invoice Number"
              required
            /> */}
            {/* <input
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
            /> */}
            {/* <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="To"
              required
            /> */}

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
                  onChange={(e) =>
                    handleItemChange(index, "hours", e.target.value)
                  }
                  placeholder="Item Hours"
                />
                <input
                  type="number"
                  value={item.rate}
                  onChange={(e) =>
                    handleItemChange(index, "rate", e.target.value)
                  }
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
        </div>
      </div>
    </>
  );
};

export default CreateInvoice;
