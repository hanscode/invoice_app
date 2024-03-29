import { useContext, useEffect, useState, useCallback } from "react";
import { api } from "../../utils/apiHelper";
import { useNavigate } from "react-router-dom";
import UserContext from "../../context/UserContext";
import CreateClient from "./CreateClient";
import EditClient from "./EditClient";
import Spinner from "../layouts/loaders/Spinner";
import { EmptyState } from "../layouts/sections";

import {
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/20/solid";

const Clients = () => {
  const { authUser } = useContext(UserContext);
  const [clients, setClients] = useState({ customers: [], totalCount: 0 });
  const [isCreateClientOpen, setIsCreateClientOpen] = useState(false);
  const [isEditClientOpen, setIsEditClientOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(7);
  const navigate = useNavigate();

  
  const fetchClients = useCallback(async () => {
    try {
      const response = await api(
        `/customers?page=${page}&limit=${limit}`,
        "GET",
        null,
        authUser.token
      );
      const jsonData = await response.json();
      if (response.status === 200) {
        setClients(jsonData);
      } else if (response.status === 500) {
        navigate(`/error`);
      }
    } catch (error) {
      console.log(`Error fetching and parsing the data`, error);
      navigate("/error");
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  }, [authUser.token, page, limit, navigate]); // useCallback dependencies

  useEffect(() => {
    if (!isEditClientOpen) {
      setEditingClientId('');
    }
  }, [isEditClientOpen]); // cleanup editingClientId

  useEffect(() => {
    // Call fetchClients to retrieve the list of clients.
    fetchClients();
  }, [fetchClients]);

  // Render spinner if loading
  if (loading) {
    return <Spinner />;
  }


  const count = clients?.totalCount;
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

  const handleEditClientClick = (clientId) => {
    // Set the editing client ID
  setEditingClientId(clientId);
  // Open the edit client panel
  setIsEditClientOpen(true);
  };

  // Function to update clients state after new client creation or after new client update.
  const updateClients = async () => {
    // Call fetchClients to update the list of clients after creating a new client.
    await fetchClients();
  };
  

  return (
    <>
      <div className="relative isolate overflow-hidden">
        {/* Secondary navigation */}
        <header className="pb-4 pt-6 sm:pb-6">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-slate-300">
              Clients
            </h1>
            <button
              onClick={() => setIsCreateClientOpen(true)}
              className="ml-auto flex items-center gap-x-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <PlusIcon className="-ml-1.5 h-5 w-5" aria-hidden="true" />
              Add Client
            </button>
          </div>
        </header>
      </div>
      <div className="lg:border-t lg:border-t-gray-900/5 dark:lg:border-t-gray-800">
        {clients.customers.length !== 0 ? (
          <div className="mt-8 flow-root mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0 dark:text-white"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                      >
                        Phone
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                      >
                        Address
                      </th>

                      <th
                        scope="col"
                        className="relative py-3.5 pl-3 pr-4 sm:pr-0"
                      >
                        <span className="sr-only">Edit</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:bg-gray-900 dark:divide-gray-800">
                    {clients.customers.map((client) => (
                      <tr key={client.customerId}>
                        <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
                          <div className="flex items-center">
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
                            <div className="ml-4">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {client.name}
                              </div>
                              <div className="mt-1 truncate text-xs leading-5 text-gray-500 dark:text-gray-400">
                                {client.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-50">
                          <div className="mt-1 text-gray-500 dark:text-gray-300">
                            {client.phone}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500 dark:text-gray-300">
                          {client.address}
                        </td>
                        <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <button
                            onClick={() =>
                              handleEditClientClick(client.customerId.toString())
                            }
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            Edit
                            <span className="sr-only">
                              , {client.customerId}
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 dark:bg-gray-900 dark:border-gray-700">
                <nav
                  className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                  aria-label="Pagination"
                >
                  {/* Pagination: Previous */}
                  {buttons.length > 1 && ( // If there is more than one page, render the previous button. Otherwise, don't render it.}
                    <button
                      onClick={handlePreviousPage}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:bg-slate-800 dark:ring-slate-700 dark:hover:bg-slate-700 dark:focus-visible:outline-slate-700"
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
                          ? "relative z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500"
                          : "relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:text-slate-300 dark:bg-slate-800 dark:ring-slate-700 dark:hover:bg-slate-700 dark:focus-visible:outline-slate-700"
                      }`}
                    >
                      {number}
                    </button>
                  ))}

                  {/* Pagination: Next */}
                  {buttons.length > 1 && ( // If there is more than one page, render the next button. Otherwise, don't render it.
                    <button
                      onClick={handleNextPage}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:bg-slate-800 dark:ring-slate-700 dark:hover:bg-slate-700 dark:focus-visible:outline-slate-700"
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
          <div className="mt-8 flow-root mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <EmptyState 
            svg={
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
            }
              title="Add clients"
              description={
                <>
                  You haven&apos;t added any client to your account yet. <br />
                  Get started by creating a new client.
                </>
              }
              action={
                <button
              onClick={() => setIsCreateClientOpen(true)}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <PlusIcon className="-ml-1.5 h-5 w-5" aria-hidden="true" />
              Add Client
            </button>
              }
            />
          </div>
        )}
      </div>

      {/* Create Client */}
      <CreateClient open={isCreateClientOpen} setOpen={setIsCreateClientOpen} updateClients={updateClients} />

      {/* Edit Client */}
      {/* Render EditClient only when editingClientId is not null */}
      {editingClientId !== null && (
        <EditClient
          edit={isEditClientOpen}
          setEdit={setIsEditClientOpen}
          clientId={editingClientId}
          updateClients={updateClients}
        />
      )}
    </>
  );
};

export default Clients;
