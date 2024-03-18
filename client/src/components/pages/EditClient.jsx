import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { api } from "../../utils/apiHelper";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

import UserContext from "../../context/UserContext";
import ErrorsDisplay from "../ErrorsDisplay";
import NotFound from "../NotFound";

/**
 * EditClient component
 * @param {boolean} edit - The edit state
 * @param {function} setEdit - The setEdit function
 * @param {string} clienId - The client ID
 * @returns - The EditClient component
 */

const EditClient = ({ edit, setEdit, clientId, updateClients }) => {
  const { authUser } = useContext(UserContext);
  const [client, setClient] = useState();
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // GET individual client detail.
  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await api(
          `/customers/${clientId}`,
          "GET",
          null,
          authUser.token
        );
        const jsonData = await response.json();
        if (response.status === 200) {
          setClient(jsonData);
        } else if (response.status === 404) {
          // Redirect users to the /notfound path if the requested client isn't returned from the REST API.
          navigate(`/notfound`);
        }
      } catch (error) {
        console.log(`Error fetching and parsing the data`, error);
      }
    };

    fetchClient();
  }, [clientId, navigate, authUser.token]);

  // Refs for form inputs and errors
  const name = useRef(null);
  const email = useRef(null);
  const phone = useRef(null);
  const address = useRef(null);
  const notes = useRef(null);
  const [errors, setErrors] = useState([]);

  // Event handlers
  const handleSubmit = async (event) => {
    event.preventDefault();

    const client = {
      name: name.current.value,
      email: email.current.value,
      phone: phone.current.value,
      address: address.current.value,
      notes: notes.current.value,
    };

    // PUT requets that will update the individual client
    try {
      const response = await api(`/customers/${clientId}`, "PUT", client, authUser.token);
      if (response.status === 204) {
        navigate(`/app/clients/`);
        setSuccess(true);
        setEdit(false);
        updateClients(); // Call updateClients function passed from Clients component
      } else if (response.status === 403) {
        navigate(`/forbidden`);
      } else if (response.status === 500) {
        navigate(`/error`);
      } else {
        const data = await response.json();
        setErrors(data.errors);
      }
    } catch (error) {
      console.log(error);
      navigate("/error");
    }
  };

  const handleCancel = (event) => {
    event.preventDefault();
    setEdit(false);
    if (errors.length > 0) {
      setErrors([]);
    }
  };
  if (!client) return <NotFound />;
  return (
    <>
    <Transition.Root show={edit} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setEdit}>
      <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <form
                    onSubmit={handleSubmit}
                    className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl dark:bg-gray-900 dark:divide-gray-800"
                  >
                    <div className="h-0 flex-1 overflow-y-auto">
                      <div className="bg-indigo-700 px-4 py-6 sm:px-6">
                        <div className="flex items-center justify-between">
                          <Dialog.Title className="text-base font-semibold leading-6 text-white">
                            Edit Client
                          </Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="relative rounded-md bg-indigo-700 text-indigo-200 hover:text-white"
                              onClick={handleCancel}
                            >
                              <span className="absolute -inset-2.5" />
                              <span className="sr-only">Close panel</span>
                              <XMarkIcon
                                className="h-6 w-6"
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                        </div>
                        <div className="mt-1">
                          <p className="text-sm text-indigo-300">
                            Get started by updating the client information
                            below.
                          </p>
                        </div>
                      </div>
                      {errors.length > 0 && (
                          <div className="px-4 pt-4">
                            <ErrorsDisplay errors={errors} />
                          </div>
                        )}
                      <div className="flex flex-1 flex-col justify-between">
                        <div className="divide-y divide-gray-200 px-4 sm:px-6">
                          <div className="space-y-6 pb-5 pt-6">
                            <div>
                              <label
                                htmlFor="client-name"
                                className="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-300"
                              >
                                Name
                              </label>
                              <div className="mt-2">
                                <input
                                  type="text"
                                  name="client-name"
                                  id="client-name"
                                  ref={name}
                                  defaultValue={client.name}
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:ring-white/10 dark:focus:ring-indigo-500"
                                />
                              </div>
                            </div>
                            <div>
                              <label
                                htmlFor="client-email"
                                className="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-300"
                              >
                                Email Address
                              </label>
                              <div className="mt-2">
                                <input
                                  type="email"
                                  name="client-email"
                                  id="client-email"
                                  ref={email}
                                  defaultValue={client.email}
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:ring-white/10 dark:focus:ring-indigo-500"
                                />
                              </div>
                            </div>
                            <div>
                              <label
                                htmlFor="client-phone"
                                className="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-300"
                              >
                                Phone Number
                              </label>
                              <div className="mt-2">
                                <input
                                  type="text"
                                  name="client-phone"
                                  id="client-phone"
                                  ref={phone}
                                  defaultValue={client.phone}
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:ring-white/10 dark:focus:ring-indigo-500"
                                  placeholder="+1 (555) 987-6543"
                                />
                              </div>
                            </div>
                            <div>
                              <label
                                htmlFor="address"
                                className="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-300"
                              >
                                Address
                              </label>
                              <div className="mt-2">
                                <textarea
                                  id="address"
                                  name="address"
                                  rows={3}
                                  ref={address}
                                  defaultValue={client.address}
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:ring-white/10 dark:focus:ring-indigo-500"
                                />
                              </div>
                            </div>
                            <div>
                              <label
                                htmlFor="notes"
                                className="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-300"
                              >
                                Notes
                              </label>
                              <div className="mt-2">
                                <textarea
                                  id="notes"
                                  name="notes"
                                  rows={4}
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:ring-white/10 dark:focus:ring-indigo-500"
                                  ref={notes}
                                  defaultValue={client.notes}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 justify-end px-4 py-4">
                      <button
                        type="button"
                        className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-700"
                        onClick={handleCancel}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="ml-4 inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>

    {/* Success notification */}
    <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
          <Transition
            show={success}
            as={Fragment}
            enter="transform ease-out delay-700 duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon
                      className="h-6 w-6 text-green-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">
                      Successfully saved!
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      The client have been updated!.
                    </p>
                  </div>
                  <div className="ml-4 flex flex-shrink-0">
                    <button
                      type="button"
                      className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={() => {
                        setSuccess(false);
                      }}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </>
  );
};

export default EditClient;

EditClient.propTypes = {
  edit: PropTypes.bool,
  setEdit: PropTypes.func,
  clientId: PropTypes.string,
  updateClients: PropTypes.func,
};
