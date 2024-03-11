import { useContext, useEffect, useState } from "react";
import UserContext from "../../../context/UserContext";
import { FetchInvoices } from "../../../utils";

import { Fragment } from "react";
import {
  MinusCircleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
  PlusIcon,
} from "@heroicons/react/20/solid";

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

const RecentActivity = () => {
  const { authUser } = useContext(UserContext);
  const [days, setDays] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allInvoices = await FetchInvoices(authUser.token);

        const today = new Date();
        const yesterday = new Date();
        const lastWeek = new Date();

        yesterday.setDate(today.getDate() - 1);
        lastWeek.setDate(today.getDate() - 7);

        const invoicesToday = allInvoices.filter((invoice) => {
          const invoiceDate = new Date(invoice.updatedAt);
          return invoiceDate.toDateString() === today.toDateString();
        });

        const invoicesYesterday = allInvoices.filter((invoice) => {
          const invoiceDate = new Date(invoice.updatedAt);
          return invoiceDate.toDateString() === yesterday.toDateString();
        });

        const invoicesLastWeek = allInvoices.filter((invoice) => {
          const invoiceDate = new Date(invoice.updatedAt);
          return invoiceDate >= lastWeek;
        });

        const newDays = [];
        if (invoicesToday.length > 0) {
          newDays.push({
            date: "Today",
            dateTime: today.toISOString().slice(0, 10),
            transactions: invoicesToday,
          });
        }
        if (invoicesYesterday.length > 0) {
          newDays.push({
            date: "Yesterday",
            dateTime: yesterday.toISOString().slice(0, 10),
            transactions: invoicesYesterday,
          });
        }
        if (invoicesLastWeek.length > 0) {
          // Exclude invoices from InvoicesLastWeek if their id is present in invoicesYesterday or invoicesToday
          const filteredLastWeek = invoicesLastWeek.filter((invoice) => {
            const isInYesterday = invoicesYesterday.some(
              (yesterdayInvoice) => yesterdayInvoice.id === invoice.id
            );
            const isInToday = invoicesToday.some(
              (todayInvoice) => todayInvoice.id === invoice.id
            );
            return !isInYesterday && !isInToday;
          });
          if (filteredLastWeek.length > 0) {
            newDays.push({
              date: "Last Week",
              dateTime: lastWeek.toISOString().slice(0, 10),
              transactions: filteredLastWeek,
            });
          }
        }

        setDays(newDays);
      } catch (error) {
        console.error("Error fetching the invoices:", error);
      }
    };

    fetchData();
  }, [authUser]);

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mx-auto max-w-2xl text-base font-semibold leading-6 text-gray-900 lg:mx-0 lg:max-w-none">
          Recent activity
        </h2>
      </div>
      <div className="mt-6 overflow-hidden border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
            {days.length === 0 ? (
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

                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  No recent activity
                </h3>
                <p className="mt-1 text-sm text-gray-500">
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
                    New Invoice
                  </button>
                </div>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="sr-only">
                  <tr>
                    <th>Amount</th>
                    <th className="hidden sm:table-cell">Client</th>
                    <th>More details</th>
                  </tr>
                </thead>
                <tbody>
                  {days.map((day) => (
                    <Fragment key={day.dateTime}>
                      <tr className="text-sm leading-6 text-gray-900">
                        <th
                          scope="colgroup"
                          colSpan={3}
                          className="relative isolate py-2 font-semibold"
                        >
                          <time dateTime={day.dateTime}>{day.date}</time>
                          <div className="absolute inset-y-0 right-full -z-10 w-screen border-b border-gray-200 bg-gray-50" />
                          <div className="absolute inset-y-0 left-0 -z-10 w-screen border-b border-gray-200 bg-gray-50" />
                        </th>
                      </tr>
                      {/* start of day.transactions.map */}
                      {day.transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="relative py-5 pr-6">
                            <div className="flex gap-x-6">
                              {transaction.status === "paid" ? (
                                <CheckCircleIcon
                                  className="hidden h-6 w-5 flex-none text-gray-400 sm:block"
                                  aria-hidden="true"
                                />
                              ) : transaction.status === "sent" &&
                                !transaction.isOverdue ? (
                                <PaperAirplaneIcon
                                  className="hidden h-6 w-5 flex-none text-gray-400 sm:block"
                                  aria-hidden="true"
                                />
                              ) : transaction.status === "partially paid" &&
                                !transaction.isOverdue ? (
                                <MinusCircleIcon
                                  className="hidden h-6 w-5 flex-none text-gray-400 sm:block"
                                  aria-hidden="true"
                                />
                              ) : (
                                <ArrowPathIcon
                                  className="hidden h-6 w-5 flex-none text-gray-400 sm:block"
                                  aria-hidden="true"
                                />
                              )}

                              <div className="flex-auto">
                                <div className="flex items-start gap-x-3">
                                  <div className="text-sm font-medium leading-6 text-gray-900">
                                    {transaction.totalAmoun}
                                  </div>
                                  <div
                                    className={classNames(
                                      statuses[
                                        transaction.isOverdue
                                          ? "Overdue"
                                          : transaction.status ===
                                            "partially paid"
                                          ? "Partial"
                                          : transaction.status === "paid"
                                          ? "Paid"
                                          : transaction.status === "sent"
                                          ? "Sent"
                                          : "Draft"
                                      ],
                                      "capitalize rounded-md py-1 px-2 text-xs font-medium ring-1 ring-inset"
                                    )}
                                  >
                                    {transaction.isOverdue
                                      ? "overdue"
                                      : transaction.status}
                                  </div>
                                </div>
                                {transaction.tax ? (
                                  <div className="mt-1 text-xs leading-5 text-gray-500">
                                    {transaction.tax} tax
                                  </div>
                                ) : null}
                              </div>
                            </div>
                            <div className="absolute bottom-0 right-full h-px w-screen bg-gray-100" />
                            <div className="absolute bottom-0 left-0 h-px w-screen bg-gray-100" />
                          </td>
                          <td className="hidden py-5 pr-6 sm:table-cell">
                            <div className="text-sm leading-6 text-gray-900">
                              {transaction.customerName}
                            </div>
                            <div className="mt-1 text-xs leading-5 text-gray-500">
                              {transaction.items[0].description}
                            </div>
                          </td>
                          <td className="py-5 text-right">
                            <div className="flex justify-end">
                              <a
                                href={transaction.id}
                                className="text-sm font-medium leading-6 text-indigo-600 hover:text-indigo-500"
                              >
                                View
                                <span className="hidden sm:inline">
                                  {" "}
                                  transaction
                                </span>
                                <span className="sr-only">
                                  , invoice #{transaction.invoiceNumber},{" "}
                                  {transaction.customerName}
                                </span>
                              </a>
                            </div>
                            <div className="mt-1 text-xs leading-5 text-gray-500">
                              Invoice{" "}
                              <span className="text-gray-900">
                                #{transaction.invoiceNumber}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {/* end of day.transactions.map */}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
