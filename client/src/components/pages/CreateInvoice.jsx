import { useContext, useState, useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/apiHelper";

import { Menu, Transition } from "@headlessui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FormatNumber, FetchClients  } from "../../utils";

import {
  EllipsisVerticalIcon,
  CheckIcon,
  ChevronUpDownIcon,
  PlusIcon,
} from "@heroicons/react/20/solid";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Combobox } from "@headlessui/react";

import ErrorsDisplay from "../ErrorsDisplay";
import UserContext from "../../context/UserContext";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const CreateInvoice = () => {
  const { authUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Fetch clients dynamically
  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const fetchedCustomers = await FetchClients(authUser.token);
        setCustomers(fetchedCustomers);
      } catch (error) {
        console.error("Failed to fetch clients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [authUser.token]); // Re-run the effect only if authUser.token changes

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
  //const [amountDue, setAmountDue] = useState(0);
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
    // let newAmountDue = newTotal - paid; // Initially, amount due is the same as total
    const userFrom = authUser
      ? `${authUser.firstName} ${authUser.lastName}`
      : "";
    const userEmail = authUser ? `${authUser.emailAddress}` : "";

    setFromName(userFrom);
    setFromEmail(userEmail);
    setSubtotal(newSubtotal);
    setTotal(newTotal);
    setPaid(newPaid);
    //setAmountDue(newAmountDue);
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
      const amount = (hours * rate);
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
          <ErrorsDisplay errors={errors} />
          <form onSubmit={handleSubmit}>
            {/* Invoice Header */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 pb-12 md:grid-cols-3">
              <div>
                <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  {fromName}
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-slate-400">
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
                    <Combobox.Label className="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-300">
                      Client
                    </Combobox.Label>
                    <div className="relative mt-2">
                      <Combobox.Input
                        className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:ring-white/10 dark:focus:ring-indigo-500"
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
                              key={client.customerId}
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
                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-300"
                  >
                    Issue Date
                  </label>
                  <DatePicker
                    id="issueDate"
                    placeholder="Issue Date"
                    selected={issueDate}
                    onChange={(date) => setIssueDate(date)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:ring-white/10 dark:focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="dueDate"
                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-300"
                  >
                    Due Date
                  </label>
                  <DatePicker
                    id="dueDate"
                    placeholder="Due Date"
                    selected={dueDate}
                    onChange={(date) => setDueDate(date)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:ring-white/10 dark:focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="sm:col-span-3">
                  <label
                    htmlFor="invoiceNumber"
                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-300"
                  >
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    id="invoiceNumber"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="Enter the invoice's number"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:ring-white/10 dark:focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
            </div>
            {/* End of Invoice Header */}

            <div className="mt-8 flow-root pb-5">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="narrow-cell-description py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0 dark:text-white"
                        >
                          Description
                        </th>
                        <th
                          scope="col"
                          className="narrow-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                        >
                          Total hours (qty)
                        </th>
                        <th
                          scope="col"
                          className="narrow-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                        >
                          Unit price
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                        >
                          Amount
                        </th>
                        <th
                          scope="col"
                          className="relative py-3.5 pl-3 pr-4 sm:pr-0"
                        >
                          <span className="sr-only">Remove</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {/* Input fields for invoice items */}
                      {itemFields.map((item, index) => (
                        <tr key={index}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                            <input
                              type="text"
                              value={item.description}
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:ring-white/10 dark:focus:ring-indigo-500"
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Item Description"
                            />
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={item.hours}
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:ring-white/10 dark:focus:ring-indigo-500"
                              onChange={(e) =>
                                handleItemChange(index, "hours", e.target.value)
                              }
                              placeholder="Qty"
                            />
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <div className="relative rounded-md shadow-sm">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm">
                                  $
                                </span>
                              </div>
                              <input
                                type="text"
                                inputMode="numeric"
                                name="price"
                                value={item.rate}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "rate",
                                    e.target.value
                                  )
                                }
                                className="block w-full rounded-md border-0 py-1.5 pl-7 lg:pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:ring-white/10 dark:focus:ring-indigo-500"
                                placeholder="0.00"
                                aria-describedby="price-currency"
                              />
                              <div className="hidden pointer-events-none absolute inset-y-0 right-0 lg:flex items-center pr-3">
                                <span
                                  className="text-gray-500 sm:text-sm"
                                  id="price-currency"
                                >
                                  USD
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            $
                            <FormatNumber
                              number={item.amount ? `${item.amount}` : 0}
                            />
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                            {index >= 0 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                              >
                                <TrashIcon
                                  className="-ml-1.5 h-5 w-5 text-red-500 dark:text-red-400"
                                  aria-hidden="true"
                                />{" "}
                                <span className="sr-only">Remove</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {/* End of input fields for invoice items */}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Add a new item */}
            <div className="relative mb-2">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className="w-full border-t border-gray-300 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-2 text-gray-500 dark:bg-gray-900">
                  <button type="button" onClick={handleAddItem}>
                    <PlusIcon
                      className="h-5 w-5 text-gray-500 dark:text-gray-400"
                      aria-hidden="true"
                    />
                  </button>
                </span>
              </div>
            </div>
            {/*end of add a new item */}
            <div className="mx-auto max-w-7xl pt-8 lg:flex lg:gap-x-16">
              <aside className="flex overflow-x-auto border-b border-gray-900/5 lg:block lg:w-96 lg:flex-none lg:border-0">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-700"
                >
                  Add Item
                </button>
              </aside>

              <div className="px-4 sm:px-6 lg:flex-auto lg:px-0">
                <table className="flex justify-end divide-y divide-gray-300 dark:divide-gray-800">
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    <tr className="lg:border-t lg:border-gray-200 dark:lg:border-gray-700">
                      <th
                        scope="row"
                        className="px-0 py-4 font-normal text-gray-700 sm:hidden  dark:text-slate-300"
                      >
                        Subtotal
                      </th>
                      <th
                        scope="row"
                        colSpan={3}
                        className="hidden px-0 py-4 text-left font-normal text-gray-700 sm:table-cell  dark:text-slate-300"
                      >
                        Subtotal
                      </th>
                      <td className="py-4 pl-8 pr-0 text-left tabular-nums text-gray-900  dark:text-gray-400">
                        $<FormatNumber number={subtotal} />
                      </td>
                    </tr>
                    <tr>
                      <th
                        scope="row"
                        className="py-4 font-normal text-gray-700 sm:hidden dark:text-slate-300"
                      >
                        Tax
                      </th>
                      <th
                        scope="row"
                        colSpan={3}
                        className="hidden py-4 text-left font-normal text-gray-700 sm:table-cell dark:text-slate-300"
                      >
                        Tax
                      </th>
                      <td className="pl-8 pr-0 py-4 text-left tabular-nums text-gray-900 dark:text-gray-400">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={taxRate || ""}
                          onChange={(e) =>
                            setTaxRate(parseFloat(e.target.value))
                          }
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:ring-white/10 dark:focus:ring-indigo-500"
                          placeholder="Enter tax %"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th
                        scope="row"
                        className="py-4 font-semibold text-gray-900 sm:hidden  dark:text-white"
                      >
                        Grand Total
                      </th>
                      <th
                        scope="row"
                        colSpan={3}
                        className="hidden py-4 text-left font-semibold text-gray-900 sm:table-cell dark:text-white"
                      >
                        Grand Total
                      </th>
                      <td className="py-4 pl-8 pr-0 text-left font-semibold tabular-nums text-gray-900 dark:text-white">
                        $<FormatNumber number={total} />
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Button to submit form */}
              </div>
            </div>
            <div className="flex justify-end mt-16 pt-8 lg:border-t lg:border-gray-900/10">
            <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  {loading ? "Creating..." : "Create Invoice"}
                </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateInvoice;
