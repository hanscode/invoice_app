import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UserContext from "../../../context/UserContext";
import {
  FetchInvoices,
  FetchClients,
  FormatDate,
  FormatNumber,
} from "../../../utils";

import { PlusIcon } from "@heroicons/react/20/solid";
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";

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

const RecentClients = () => {
  const { authUser } = useContext(UserContext);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allInvoices = await FetchInvoices(authUser);
        const allClients = await FetchClients(authUser);

        // Filter clients with at least one invoice
        const clientsWithInvoices = allClients.filter((client) =>
          allInvoices.some(
            (invoice) => invoice.customerId === client.customerId
          )
        );

        // Sort clients based on the issue date of their last invoice
        const sortedClients = clientsWithInvoices.sort((a, b) => {
          const lastInvoiceA = allInvoices
            .filter((invoice) => invoice.customerId === a.customerId)
            .sort((x, y) => new Date(y.createdAt) - new Date(x.createdAt))[0];
          const lastInvoiceB = allInvoices
            .filter((invoice) => invoice.customerId === b.customerId)
            .sort((x, y) => new Date(y.createdAt) - new Date(x.createdAt))[0];
          return (
            new Date(lastInvoiceB.createdAt) - new Date(lastInvoiceA.createdAt)
          );
        });

        // Take the first three clients
        const recentClients = sortedClients.slice(0, 3);

        // Get the last invoice for each recent client
        const clientsInvoices = recentClients.map((client) => {
          const clientInvoices = allInvoices.filter(
            (invoice) => invoice.customerId === client.customerId
          );
          const lastInvoice = clientInvoices.sort(
            (a, b) => new Date(b.issueDate) - new Date(a.issueDate)
          )[0];
          return {
            id: client.customerId,
            name: client.name,
            color: client.color,
            lastInvoice: lastInvoice
              ? {
                  issueDate: FormatDate(lastInvoice.issueDate),
                  dueDate: lastInvoice.dueDate,
                  totalAmount: lastInvoice.totalAmount,
                  status: lastInvoice.isOverdue
                    ? "overdue"
                    : lastInvoice.status,
                }
              : null,
          };
        });

        setClients(clientsInvoices);
      } catch (error) {
        console.error("Error fetching the invoices:", error);
      }
    };

    fetchData();
  }, [authUser]);

  return (
    <>
    {clients.length === 0 ? (
      <div className="mt-8 flow-root mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="text-center py-12 mt-6 border rounded-lg">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286M30 14a6 6 0 11-12 0 6 6 0 0112 0zm12 6a4 4 0 11-8 0 4 4 0 018 0zm-28 0a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>

        <h2 className="mt-2 text-base font-semibold leading-6 text-gray-900">
          Add clients
        </h2>
        <p className="mt-1 text-sm text-gray-500 text-center">
          You haven&apos;t added any client to your account yet. <br />
          Get started by creating a new client.
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
            Add client
          </button>
        </div>
      </div>
    </div>
    ) : (
      <>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold leading-7 text-gray-900">
          Recent clients
        </h2>
        <Link to="clients" className="text-sm font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
          View all<span className="sr-only">, clients</span>
        </Link>
      </div>
      <ul
        role="list"
        className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8"
      >
        {clients.map((client) => (
          <li
            key={client.id}
            className="overflow-hidden rounded-xl border border-gray-200"
          >
            <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
              <span
                className="inline-flex h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: `${client.color}` }}
              >
                <span className="text-lg font-medium leading-none text-white">
                  {client.name.charAt(0).toUpperCase()}
                </span>
              </span>
              <div className="text-sm font-medium leading-6 text-gray-900">
                {client.name}
              </div>
              <Menu as="div" className="relative ml-auto">
                <Menu.Button className="-m-2.5 block p-2.5 text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Open options</span>
                  <EllipsisHorizontalIcon
                    className="h-5 w-5"
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
                        <a
                          href="#"
                          className={classNames(
                            active ? "bg-gray-50" : "",
                            "block px-3 py-1 text-sm leading-6 text-gray-900"
                          )}
                        >
                          View<span className="sr-only">, {client.name}</span>
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            active ? "bg-gray-50" : "",
                            "block px-3 py-1 text-sm leading-6 text-gray-900"
                          )}
                        >
                          Edit<span className="sr-only">, {client.name}</span>
                        </a>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
            <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Last invoice</dt>
                <dd className="text-gray-700">
                  <time dateTime={client.lastInvoice.issueDate}>
                    {client.lastInvoice.issueDate}
                  </time>
                </dd>
              </div>
              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Amount</dt>
                <dd className="flex items-start gap-x-2">
                  <div className="font-medium text-gray-900">
                    $<FormatNumber number={client.lastInvoice.totalAmount} />
                  </div>
                  <div
                    className={classNames(
                      statuses[
                        client.lastInvoice.status === "overdue"
                          ? "Overdue"
                          : client.lastInvoice.status === "partially paid"
                          ? "Partial"
                          : client.lastInvoice.status === "paid"
                          ? "Paid"
                          : client.lastInvoice.status === "sent"
                          ? "Sent"
                          : "Draft"
                      ],
                      "rounded-md capitalize py-1 px-2 text-xs font-medium ring-1 ring-inset"
                    )}
                  >
                    {client.lastInvoice.status}
                  </div>
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
      </>
    )}
    </>
  );
};

export default RecentClients;
