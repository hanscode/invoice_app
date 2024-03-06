import { useContext, useEffect, useState } from "react";
import UserContext from "../../../context/UserContext";
import { FetchInvoices } from "../../../utils";

import { Fragment } from "react";
import {
  MinusCircleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/20/solid";

const statuses = {
  Paid: "text-green-700 bg-green-50 ring-green-600/20",
  Withdraw: "text-gray-600 bg-gray-50 ring-gray-500/10",
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
        const allInvoices = await FetchInvoices(authUser);

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
          newDays.push({
            date: "Last Week",
            dateTime: lastWeek.toISOString().slice(0, 10),
            transactions: invoicesLastWeek,
          });
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
              <p>No recent activity</p>
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
                      {day.transactions.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="py-5 text-center text-gray-500"
                          >
                            No transactions for {day.date}
                          </td>
                        </tr>
                      ) : (
                        <>
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
                        </>
                      )}
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
