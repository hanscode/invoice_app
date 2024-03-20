import { Fragment, useEffect, useState, useContext } from "react";
import { api } from "../../utils/apiHelper";
import { FormatDate, FormatNumber, TimeAgo, DaysOld } from "../../utils";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";

import UserContext from "../../context/UserContext";
import NotFound from "../NotFound";
import Spinner from "../layouts/loaders/Spinner";

import {
  CalendarDaysIcon,
  InformationCircleIcon,
  EllipsisVerticalIcon,
  UserCircleIcon,
} from "@heroicons/react/20/solid";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const statuses = {
  Paid: "text-green-700 bg-green-50 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20",
  Sent: "text-cyan-700 bg-cyan-50 ring-cyan-600/20 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30",
  Draft:
    "text-gray-600 bg-gray-50 ring-gray-500/10 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20",
  Partial:
    "text-amber-700 bg-amber-100 ring-amber-600/10 dark:bg-yellow-400/10 dark:text-yellow-500 dark:ing-yellow-400/20",
  Overdue:
    "text-red-700 bg-red-50 ring-red-600/10 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20",
};

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const InvoiceDetails = () => {
  const { authUser } = useContext(UserContext);
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [client, setClient] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchInvoiceDetail = async () => {
      try {
        const invoiceResponse = await api(
          `/invoices/${id}`,
          "GET",
          null,
          authUser.token
        );
        const invoiceData = await invoiceResponse.json();
        //console.log(invoiceData)
        const clientResponse = await api(
          `/customers/${invoiceData.customerId}`,
          "GET",
          null,
          authUser.token
        );
        const clientData = await clientResponse.json();
        console.log(clientData);
        if (invoiceResponse.status === 200) {
          setInvoice(invoiceData);
          setActivity(invoiceData.Histories);
          setClient(clientData);
        } else if (invoiceResponse.status === 404) {
          // redirects users to the /notfound path if the requested invoice isn't returned from the REST API.
          navigate(`/notfound`);
        } else if (invoiceResponse.status === 500) {
          //navigate(`/error`);
        }
      } catch (error) {
        console.log(`Error fetching and parsing the data`, error);
        navigate("/error");
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };
    fetchInvoiceDetail();
  }, [id, navigate, authUser.token]);

  // Render spinner if loading
  if (loading) {
    return <Spinner />;
  }

  if (invoice) {
    return (
      <>
        <header className="relative isolate lg:border-b lg:border-b-gray-900/5 dark:lg:border-b-gray-800">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-2xl items-center justify-between gap-x-8 lg:mx-0 lg:max-w-none">
              <div className="flex items-center gap-x-6">
                <div className="h-11 w-11 flex-shrink-0">
                  <span
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${client.color}` }}
                  >
                    <span className="text-lg font-medium leading-none text-white">
                      {client.name.charAt(0).toUpperCase()}
                    </span>
                  </span>
                </div>
                <h1>
                  <div className="text-sm leading-6 text-gray-500 dark:text-indigo-300">
                    Invoice{" "}
                    <span className="text-gray-700 dark:text-slate-300">
                      {invoice.invoiceNumber}
                    </span>
                  </div>
                  <div className="mt-1 text-base font-semibold leading-6 text-gray-900 dark:text-slate-300">
                    {invoice.customerName}
                  </div>
                </h1>
              </div>
              <div className="flex items-center gap-x-4 sm:gap-x-6">
                <button
                  type="button"
                  className="hidden text-sm font-semibold leading-6 text-gray-900 sm:block dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Record Payment
                </button>
                <a
                  href="#"
                  className="hidden text-sm font-semibold leading-6 text-gray-900 sm:block dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Edit
                </a>
                <a
                  href="#"
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Send
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
                            Record Payment
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to={`/invoices/${id}/update`}
                            className={classNames(
                              active ? "bg-gray-50" : "",
                              "block px-3 py-1 text-sm leading-6 text-gray-900"
                            )}
                          >
                            Edit
                          </Link>
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
          <div className="mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {/* Invoice summary */}
            <div className="lg:col-start-3 lg:row-end-1">
              <h2 className="sr-only">Summary</h2>
              <div className="rounded-lg bg-gray-50 shadow-sm ring-1 ring-gray-900/5 dark:ring-slate-700 dark:bg-gray-900">
                <dl className="flex flex-wrap">
                  <div className="flex-auto pl-6 pt-6">
                    <dt className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                      Amount Paid
                    </dt>
                    <dd className="mt-1 text-base font-semibold leading-6 text-gray-900 dark:text-white">
                      $<FormatNumber number={invoice.paid} />
                    </dd>
                  </div>
                  <div className="flex-none self-end px-6 pt-4">
                    <dt className="sr-only">Status</dt>
                    <dd
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
                    </dd>
                  </div>
                  <div className="mt-6 flex w-full flex-none gap-x-4 border-t border-gray-900/5 px-6 pt-6 dark:border-white/5">
                    <dt className="flex-none">
                      <span className="sr-only">Client</span>
                      <UserCircleIcon
                        className="h-6 w-5 text-gray-400 dark:text-slate-400"
                        aria-hidden="true"
                      />
                    </dt>
                    <dd className="text-sm font-medium leading-6 text-gray-900 dark:text-white">
                       {invoice.customerName}
                    </dd>
                  </div>
                  <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
                    <dt className="flex-none">
                      <span className="sr-only">Due date</span>
                      <CalendarDaysIcon
                        className="h-6 w-5 text-gray-400 dark:text-slate-400"
                        aria-hidden="true"
                      />
                    </dt>
                    <dd className="text-sm leading-6 text-gray-500 dark:text-slate-400">
                      <time dateTime="2023-01-31">{FormatDate(invoice.dueDate)}</time>
                    </dd>
                  </div>
                  <div className="mt-4 flex w-full flex-none gap-x-4 px-6">
                    <dt className="flex-none">
                      <span className="sr-only">Status</span>
                      <InformationCircleIcon
                        className="h-6 w-5 text-gray-400 dark:text-slate-400"
                        aria-hidden="true"
                      />
                    </dt>
                    <dd className="text-sm leading-6 text-gray-500 dark:text-slate-400">
                      {<DaysOld dueDate={new Date(invoice.dueDate)} />}
                    </dd>
                  </div>
                </dl>
                <div className="mt-6 border-t border-gray-900/5 px-6 py-6 dark:border-white/5">
                  <a
                    href="#"
                    className="text-sm font-semibold leading-6 text-gray-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Download receipt <span aria-hidden="true">&rarr;</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Invoice */}
            <div className="-mx-4 px-4 py-8 shadow-sm ring-1 ring-gray-900/5 dark:ring-slate-700 sm:mx-0 sm:rounded-lg sm:px-8 sm:pb-14 lg:col-span-2 lg:row-span-2 lg:row-end-2 xl:px-16 xl:pb-20 xl:pt-16">
              <h2 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                Invoice
              </h2>
              <span className="text-gray-500 text-sm dark:text-indigo-300">{invoice.invoiceNumber}</span>
              <dl className="mt-6 grid grid-cols-1 text-sm leading-6 sm:grid-cols-2">
                <div className="sm:pr-4">
                  <dt className="inline text-gray-500 dark:text-slate-400">Issued on</dt>{" "}
                  <dd className="inline text-gray-700 dark:text-white">
                    <time dateTime="2023-23-01">
                      {" "}
                      {FormatDate(invoice.issueDate)}
                    </time>
                  </dd>
                </div>
                <div className="mt-2 sm:mt-0 sm:pl-4">
                  <dt className="inline text-gray-500 dark:text-slate-400">Due on</dt>{" "}
                  <dd className="inline text-gray-700 dark:text-white">
                    <time dateTime="2023-31-01">
                      {" "}
                      {FormatDate(invoice.dueDate)}
                    </time>
                  </dd>
                </div>
                <div className="mt-6 border-t border-gray-900/5 pt-6 sm:pr-4 dark:border-gray-800">
                  <dt className="font-semibold text-gray-900 dark:text-white">From</dt>
                  <dd className="mt-2 text-gray-500 dark:text-slate-400">
                    <span className="font-medium text-gray-900 dark:text-slate-300">{`${invoice.User.firstName} ${invoice.User.lastName}`}</span>
                    <br />
                    {invoice.User.emailAddress}
                  </dd>
                </div>
                <div className="mt-8 sm:mt-6 sm:border-t sm:border-gray-900/5 sm:pl-4 sm:pt-6 dark:border-gray-800">
                  <dt className="font-semibold text-gray-900 dark:text-white">To</dt>
                  <dd className="mt-2 text-gray-500 dark:text-slate-400">
                    <span className="font-medium text-gray-900 dark:text-slate-300">
                      {invoice.customerName}
                    </span>
                    <br />
                    {client.address}
                  </dd>
                </div>
              </dl>
              <table className="mt-16 w-full whitespace-nowrap text-left text-sm leading-6">
                <colgroup>
                  <col className="w-full" />
                  <col />
                  <col />
                  <col />
                </colgroup>
                <thead className="border-b border-gray-200 text-gray-900 dark:text-white dark:border-gray-800">
                  <tr>
                    <th scope="col" className="px-0 py-3 font-semibold">
                      Description
                    </th>
                    <th
                      scope="col"
                      className="hidden py-3 pl-8 pr-0 text-right font-semibold sm:table-cell"
                    >
                      Hours
                    </th>
                    <th
                      scope="col"
                      className="hidden py-3 pl-8 pr-0 text-right font-semibold sm:table-cell"
                    >
                      Rate
                    </th>
                    <th
                      scope="col"
                      className="py-3 pl-8 pr-0 text-right font-semibold"
                    >
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="max-w-0 px-0 py-5 align-top">
                        <div className="truncate font-medium text-gray-900 dark:text-slate-300">
                          {item.title}
                        </div>
                        <div className="truncate text-gray-500 dark:text-slate-400">
                          {item.description}
                        </div>
                      </td>
                      <td className="hidden py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 sm:table-cell dark:text-slate-300">
                        {item.quantity}
                      </td>
                      <td className="hidden py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 sm:table-cell dark:text-slate-300">
                        $<FormatNumber number={item.price} />
                      </td>
                      <td className="py-5 pl-8 pr-0 text-right align-top tabular-nums text-gray-700 dark:text-slate-300">
                        $<FormatNumber number={item.amount} />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th
                      scope="row"
                      className="px-0 pb-0 pt-6 font-normal text-gray-700 sm:hidden dark:text-slate-400"
                    >
                      Subtotal
                    </th>
                    <th
                      scope="row"
                      colSpan={3}
                      className="hidden px-0 pb-0 pt-6 text-right font-normal text-gray-700 sm:table-cell dark:text-slate-400"
                    >
                      Subtotal
                    </th>
                    <td className="pb-0 pl-8 pr-0 pt-6 text-right tabular-nums text-gray-900 dark:text-slate-300">
                      $<FormatNumber number={invoice.totalAmount} />
                    </td>
                  </tr>
                  <tr>
                    <th
                      scope="row"
                      className="pt-4 font-normal text-gray-700 sm:hidden dark:text-slate-400"
                    >
                      Tax
                    </th>
                    <th
                      scope="row"
                      colSpan={3}
                      className="hidden pt-4 text-right font-normal text-gray-700 sm:table-cell dark:text-slate-400"
                    >
                      Tax
                    </th>
                    <td className="pb-0 pl-8 pr-0 pt-4 text-right tabular-nums text-gray-900 dark:text-slate-300">
                      $<FormatNumber number={invoice.tax} />
                    </td>
                  </tr>
                  <tr>
                    <th
                      scope="row"
                      className="pt-4 font-semibold text-gray-900 sm:hidden dark:text-white"
                    >
                      Total
                    </th>
                    <th
                      scope="row"
                      colSpan={3}
                      className="hidden pt-4 text-right font-semibold text-gray-900 sm:table-cell dark:text-white"
                    >
                      Total
                    </th>
                    <td className="pb-0 pl-8 pr-0 pt-4 text-right tabular-nums text-gray-900 dark:text-slate-300">
                      $<FormatNumber number={invoice.totalAmount} />
                    </td>
                  </tr>
                  <tr>
                    <th
                      scope="row"
                      className="pt-4 font-semibold text-gray-900 sm:hidden dark:text-white"
                    >
                      Paid
                    </th>
                    <th
                      scope="row"
                      colSpan={3}
                      className="hidden pt-4 text-right font-semibold text-gray-900 sm:table-cell dark:text-white"
                    >
                      Paid
                    </th>
                    <td className="pb-0 pl-8 pr-0 pt-4 text-right tabular-nums font-semibold text-green-600 dark:text-green-400">
                      $<FormatNumber number={invoice.paid} />
                    </td>
                  </tr>
                  <tr>
                    <th
                      scope="row"
                      className="pt-4 font-semibold text-gray-900 sm:hidden dark:text-whit"
                    >
                      Amount Due
                    </th>
                    <th
                      scope="row"
                      colSpan={3}
                      className="hidden pt-4 text-right font-semibold text-gray-900 sm:table-cell dark:text-white"
                    >
                      Amount Due
                    </th>
                    <td className="pb-0 pl-8 pr-0 pt-4 text-right font-semibold tabular-nums text-gray-900 dark:text-white">
                      $<FormatNumber number={invoice.amountDue} />
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="lg:col-start-3">
              {/* Activity feed */}
              <h2 className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                Activity
              </h2>
              <ul role="list" className="mt-6 space-y-6">
                {activity.map((activityItem, activityItemIdx) => (
                  <li key={activityItem.id} className="relative flex gap-x-4">
                    <div
                      className={classNames(
                        activityItemIdx === activity.length - 1
                          ? "h-6"
                          : "-bottom-6",
                        "absolute left-0 top-0 flex w-6 justify-center"
                      )}
                    >
                      <div className="w-px bg-gray-200 dark:bg-slate-700" />
                    </div>

                    <>
                      <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-white dark:bg-gray-900">
                        {activityItem.paymentId !== null ? (
                          <CheckCircleIcon
                            className="h-6 w-6 text-indigo-600 dark:text-green-400"
                            aria-hidden="true"
                          />
                        ) : (
                          <div className="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300 dark:ring-slate-700 dark:bg-gray-800" />
                        )}
                      </div>
                      <p className="flex-auto py-0.5 text-xs leading-5 text-gray-500 dark:text-slate-400">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {activityItem.userId === authUser.id ? `${invoice.User.firstName}`: ""}
                        </span>{" "}
                        {activityItem.paymentId === null ? `${activityItem.action.toLowerCase()} the invoice` : `${activityItem.action.toLowerCase()}`} 
                      </p>
                      <time
                        dateTime={activityItem.timestamp}
                        className="flex-none py-0.5 text-xs leading-5 text-gray-500 dark:text-slate-300"
                      >
                        <TimeAgo date={new Date(activityItem.timestamp)} />
                      </time>
                    </>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </>
    );
  } else {
    return (
      /** Not Invoice Found */
      <NotFound />
    );
  }
};

export default InvoiceDetails;
