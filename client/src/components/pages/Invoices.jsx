import { useContext, useEffect, useState } from "react";
import { api } from "../../utils/apiHelper";
import { useNavigate } from "react-router-dom";
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

import UserContext from "../../context/UserContext";

const statuses = {
  Paid: "text-green-700 bg-green-50 ring-green-600/20",
  Sent: "text-cyan-700 bg-cyan-50 ring-cyan-600/20",
  Withdraw: "text-gray-600 bg-gray-50 ring-gray-500/10",
  Partial: "text-amber-700 bg-amber-100 ring-amber-600/10",
  Overdue: "text-red-700 bg-red-50 ring-red-600/10",
};

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

/**
 * This component provides the "Invoices" screen by retrieving the list of invoices
 * from the REST API's /api/invoices route and rendering a list of invoices.
 *
 * Each invoice needs to link to its respective "Invoice details" screen.
 *
 * This component also renders a link to the "Create Invoice" screen.
 *
 * @returns Invoices Component.
 */

const Invoices = () => {
  const { authUser } = useContext(UserContext);
  const [invoices, setInvoices] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const navigate = useNavigate();

  // Fetching the list of invoices from the REST-API when the component is initially rendered.
  useEffect(() => {
    // Define an asynchronous function `fetchInvoices` and call it immediately
    const fetchInvoices = async () => {
      try {
        const response = await api(`/invoices?page=${page}&limit=${limit}`, "GET", null, authUser);
        const jsonData = await response.json();
        if (response.status === 200) {
          setInvoices(jsonData);
        } else if (response.status === 500) {
          navigate(`/error`);
        }
      } catch (error) {
        console.log(`Error fetching and parsing the data`, error);
        navigate("/error");
      }
    };
    // Call fetchInvoices with page and limit parameters
    fetchInvoices();
  }, [authUser, page, limit, navigate]); // Indicates that useEffect should run when 'navigate' changes.

  const newLimit = 5;
  const count = invoices?.totalCount;
  const paginationNumbers = [];
  let buttons;

  // A variable called `numOfPages` to calculate the number of pagination pages needed.
  const numOfPages = Math.ceil(count / newLimit);

   // A For loop that runs once over the number of pages needed: `numOfPages`.
   for (let i = 1; i <= numOfPages; i++) {

    if (count > newLimit) {
       /**
        * Check If there are more than the limit of books listed per page:
        * Then create the elements needed to display the pagination buttons and store them in the array `paginationNumbers`.
        * */ 
       paginationNumbers.push(i);
    }
 }

 buttons = paginationNumbers;

 const handlePage = (page) => {
  setPage(page);
};

  
  return (
    <>
      <div className="relative isolate overflow-hidden">
        {/* Secondary navigation */}
        <header className="pb-4 pt-6 sm:pb-6">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
            <h1 className="text-base font-semibold leading-7 text-gray-900">
              Invoices
            </h1>
            <a
              href="#"
              className="ml-auto flex items-center gap-x-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <PlusIcon className="-ml-1.5 h-5 w-5" aria-hidden="true" />
              New invoice
            </a>
          </div>
        </header>
      </div>
      <div className="lg:border-t lg:border-t-gray-900/5">
        {invoices && invoices.invoices && (
          <div className="mt-8 flow-root mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                      >
                        Invoice
                      </th>
                      <th
                        scope="col"
                        className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Client
                      </th>
                      <th
                        scope="col"
                        className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Issue date
                      </th>
                      <th
                        scope="col"
                        className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Due date
                      </th>
                      <th
                        scope="col"
                        className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Total
                      </th>
                      <th
                        scope="col"
                        className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Due balance
                      </th>
                      <th
                        scope="col"
                        className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="relative whitespace-nowrap py-3.5 pl-3 pr-4 sm:pr-0"
                      >
                        <span className="sr-only">Edit</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {invoices.invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm text-gray-500 sm:pl-0">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2 text-sm font-medium text-gray-900">
                          {invoice.customerName}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-900">
                          {invoice.issueDate}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">
                          {invoice.dueDate}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">
                          {invoice.totalAmount}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">
                          {invoice.dueBalance}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500 flex items-start">
                          <div
                            className={classNames(
                              statuses[
                                invoice.isOverdue
                                  ? "Overdue"
                                  : invoice.status === "paid"
                                  ? "Paid"
                                  : invoice.status === "sent"
                                  ? "Sent"
                                  : invoice.status === "partially paid"
                                  ? "Partial"
                                  : ""
                              ],
                              "capitalize rounded-md py-1 px-2 text-xs font-medium ring-1 ring-inset"
                            )}
                          >
                            {invoice.isOverdue ? "Overdue" : invoice.status}
                          </div>
                        </td>
                        <td className="relative whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <a
                            href="#"
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit<span className="sr-only">, {invoice.id}</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            {/* Pagination: Previous */}
            <button
              href="#"
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            {/* Pagination: Buttons */}
            {buttons.map((number) => (
              <button
               onClick={() => handlePage(number)}
                key={number}
                aria-current="page"
                className="relative z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {number}
              </button>
            ))}
            {/* Pagination: Next */}
            <button
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            >
              <span className="sr-only">Next</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Invoices;