import { useContext, useEffect, useState } from "react";
import { api } from "../../utils/apiHelper";
import { FormatDate } from "../../utils";
import { useNavigate } from "react-router-dom";
import {
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/20/solid";

import UserContext from "../../context/UserContext";
import FormatNumber from "../../utils/FormatNumber";

const statuses = {
  Paid: "text-green-700 bg-green-50 ring-green-600/20",
  Sent: "text-cyan-700 bg-cyan-50 ring-cyan-600/20",
  Draft: "text-gray-600 bg-gray-50 ring-gray-500/10",
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
  const [invoices, setInvoices] = useState({ invoices: [], totalCount: 0 });
  const [page, setPage] = useState(1);
  const [limit] = useState(7);
  const navigate = useNavigate();

  // Fetching the list of invoices from the REST-API when the component is initially rendered.
  useEffect(() => {
    // Define an asynchronous function `fetchInvoices` and call it immediately
    const fetchInvoices = async () => {
      try {
        const response = await api(
          `/invoices?page=${page}&limit=${limit}`,
          "GET",
          null,
          authUser.token
        );
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
    // Call fetchInvoices to retrieve the list of invoices.
    fetchInvoices();
  }, [authUser.token, page, limit, navigate]); // Indicates that useEffect should run when 'navigate' changes.

  const count = invoices?.totalCount;
  const paginationNumbers = [];
  let buttons;

  // A variable called `numOfPages` to calculate the number of pagination pages needed.
  const numOfPages = Math.ceil(count / limit);

  // A For loop that runs once over the number of pages needed: `numOfPages`.
  for (let i = 1; i <= numOfPages; i++) {
    if (count > limit) {
      // check if the number of pages is greater than the limit.
      paginationNumbers.push(i);
    }
  }

  buttons = paginationNumbers;

  const handlePage = (page) => {
    setPage(page);
  };

  const handleNextPage = () => {
    page === buttons.length ? setPage(page) : setPage(page + 1);
  };

  const handlePreviousPage = () => {
    setPage(Math.max(page - 1, 1));
  };

  return (
    <>
      <div className="relative isolate overflow-hidden">
        {/* Secondary navigation */}
        <header className="pb-4 pt-6 sm:pb-6">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
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
        {/* If there are invoices, render the table. Otherwise, don't render it. */}
        {invoices.invoices.length !== 0 ? (
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
                        Paid
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
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-0">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="whitespace-nowrap px-2 py-4 text-sm font-medium text-gray-900">
                          {invoice.customerName}
                        </td>
                        <td className="whitespace-nowrap px-2 py-4 text-sm text-gray-900">
                          {FormatDate(invoice.issueDate)}
                        </td>
                        <td className="whitespace-nowrap px-2 py-4 text-sm text-gray-500">
                          {FormatDate(invoice.dueDate)}
                        </td>
                        <td className="whitespace-nowrap px-2 py-4 text-sm text-gray-500">
                          $
                          <FormatNumber
                            number={
                              invoice.totalAmount !== null &&
                              invoice.totalAmount !== undefined
                                ? invoice.totalAmount
                                : 0
                            }
                          />
                        </td>
                        <td className="whitespace-nowrap px-2 py-4 text-sm text-gray-500">
                          $
                          <FormatNumber
                            number={
                              invoice.paid !== null &&
                              invoice.paid !== undefined
                                ? invoice.paid
                                : 0
                            }
                          />
                        </td>
                        <td className="whitespace-nowrap px-2 py-4 text-sm text-gray-500 flex items-start">
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
                                  : "Draft"
                              ],
                              "capitalize rounded-md py-1 px-2 text-xs font-medium ring-1 ring-inset"
                            )}
                          >
                            {invoice.isOverdue ? "Overdue" : invoice.status}
                          </div>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
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
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                <nav
                  className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                  aria-label="Pagination"
                >
                  {/* Pagination: Previous */}
                  {buttons.length > 1 && ( // If there is more than one page, render the previous button. Otherwise, don't render it.}
                    <button
                      onClick={handlePreviousPage}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  )}

                  {/* Pagination: Buttons */}
                  {buttons.map((number) => (
                    <button
                      onClick={() => handlePage(number)}
                      key={number}
                      aria-current="page"
                      className={`${
                        page === number
                          ? "relative z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          : "relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                      }`}
                    >
                      {number}
                    </button>
                  ))}

                  {/* Pagination: Next */}
                  {buttons.length > 1 && ( // If there is more than one page, render the next button. Otherwise, don't render it.
                    <button
                      onClick={handleNextPage}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRightIcon
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                    </button>
                  )}
                </nav>
              </div>
            </div>
          </div>
        ) : (
          // If there are no invoices, render the following message.
          <div className="mt-8 flow-root mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12 mt-6 border rounded-lg">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                />
              </svg>

              <h2 className="mt-2 text-base font-semibold leading-6 text-gray-900">
                Create an invoice
              </h2>
              <p className="mt-1 text-sm text-gray-500 text-center">
                You haven&apos;t added any invoice to your account yet. <br />
                Get started by creating a new invoice.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <PlusIcon
                    className="-ml-0.5 mr-1.5 h-5 w-5"
                    aria-hidden="true"
                  />
                  New invoice
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Invoices;
