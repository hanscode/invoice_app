import { useState } from "react";
import { Stats, RecentActivity, RecentClients } from "../layouts/sections";
import { PlusIcon } from "@heroicons/react/20/solid";
import { Link } from "react-router-dom";

const secondaryNavigation = [
  { name: "Last 7 days", tab: "7days", current: true },
  { name: "Last 30 days", tab: "30days", current: false },
  { name: "Current Year", tab: "currentYear", current: false },
  //{ name: 'All-time', tab: 'all', current: false },
];

let currentDate = new Date();
let currentYear = currentDate.getFullYear();

const Dashboard = () => {
  const [filter, setFilter] = useState("7days");

  const handleFilter = (filter) => {
    setFilter(filter);
  };

  return (
    <>
      <div className="relative isolate overflow-hidden">
        {/* Secondary navigation */}
        <header className="pb-4 pt-6 sm:pb-6">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
            <h1 className="text-base font-semibold leading-7 text-gray-900 dark:text-slate-300">
              Cashflow
            </h1>
            <div className="order-last flex w-full gap-x-8 text-sm font-semibold leading-6 sm:order-none sm:w-auto sm:border-l sm:border-gray-200 sm:pl-6 sm:leading-7 dark:sm:border-slate-700">
              {secondaryNavigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleFilter(item.tab)}
                  className={
                    filter == item.tab
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-gray-700 hover:text-indigo-600 dark:hover:text-indigo-300 dark:text-slate-300"
                  }
                >
                  {item.name === "Current Year" ? currentYear : item.name}
                </button>
              ))}
            </div>
            <Link
              to="/app/invoices/create"
              className="ml-auto flex items-center gap-x-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <PlusIcon className="-ml-1.5 h-5 w-5" aria-hidden="true" />
              New invoice
            </Link>
          </div>
        </header>
      </div>

      <div className="relative mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8 border-b border-b-gray-900/10 border-t lg:border-t lg:border-t-gray-900/5 dark:lg:border-t-gray-800 dark:lg:border-b-slate-700">
        {/* Stats */}
        <Stats filter={filter} />
      </div>

      <div className="space-y-16 py-16 xl:space-y-20">
        {/* Recent activity table */}
        <RecentActivity />

        {/* Recent client list*/}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
            <RecentClients />
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
