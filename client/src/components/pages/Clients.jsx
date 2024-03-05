import { useContext, useEffect, useState } from "react";
import { api } from "../../utils/apiHelper";
import { useNavigate } from "react-router-dom";
import UserContext from "../../context/UserContext";

import {
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/20/solid";

const Clients = () => {
  const { authUser } = useContext(UserContext);
  const [clients, setClients] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(7);
  const navigate = useNavigate();

   useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api(
          `/customers?page=${page}&limit=${limit}`,
          "GET",
          null,
          authUser
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
      }
    };
    // Call fetchClients to retrieve the list of clients.
    fetchClients();
  }, [authUser, page, limit, navigate]); // Indicates that useEffect should run when 'navigate' changes.

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

  return (
    <>
      <div className="relative isolate overflow-hidden">
        {/* Secondary navigation */}
        <header className="pb-4 pt-6 sm:pb-6">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
              Clients
            </h1>
            <a
              href="#"
              className="ml-auto flex items-center gap-x-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <PlusIcon className="-ml-1.5 h-5 w-5" aria-hidden="true" />
              Add Client
            </a>
          </div>
        </header>
      </div>
      <div className="lg:border-t lg:border-t-gray-900/5">
      {clients && clients.customers && (
        <div className="mt-8 flow-root mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Phone
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
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
                <tbody className="divide-y divide-gray-200 bg-white">
                  {clients.customers.map((client) => (
                    <tr key={client.customerId}>
                      <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
                        <div className="flex items-center">
                          <div className="h-11 w-11 flex-shrink-0">
                            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full" style={{backgroundColor: `${client.color}`}}>
                              <span className="text-lg font-medium leading-none text-white">
                                {client.name.charAt(0).toUpperCase()}
                              </span>
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">
                              {client.name}
                            </div>
                            <div className="mt-1 text-gray-500">
                              {client.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                        <div className="mt-1 text-gray-500">
                          {client.phone}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                      {client.address}
                      </td>
                      <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <a
                          href="#"
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit<span className="sr-only">, {client.customerId}</span>
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
        )}
      </div>
    </>
  );
};

export default Clients;
