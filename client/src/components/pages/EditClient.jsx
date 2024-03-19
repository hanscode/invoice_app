import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { api } from "../../utils/apiHelper";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

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
  const [clientInvoices, setClientInvoices] = useState();
  const [success, setSuccess] = useState(false);
  const [successDelete, setSuccessDelete] = useState(false);
  const [alert, setAlert] = useState(false);
  const navigate = useNavigate();
  const cancelButtonRef = useRef(null)

  // GET individual client detail.
  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await api(`/customers/${clientId}`, "GET", null, authUser.token);
        const invoicesResponse = await api(`/invoices?customerId=${clientId}`, "GET", null, authUser.token);
        const invoicesData = await invoicesResponse.json();
        const clientData = await response.json();
        if (response.status === 200) {
          setClient(clientData);
          setClientInvoices(invoicesData);
          console.log('Client:', clientData);
          console.log('Invoices:', invoicesData);
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

  // Event handler for deleting the client
  const handleDelete = async () => {
    try {
      const response = await api(`/customers/${clientId}`, "DELETE", null, authUser.token);
      if (response.status === 204) {
        navigate(`/app/clients`);
        setAlert(false);
        setSuccessDelete(true);
        setEdit(false);
        updateClients(); // Call updateClients function passed from Clients component
      } else if (response.status === 403) {
        navigate(`/forbidden`);
      } else if (response.status === 500) {
        navigate(`/error`);
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
                                  placeholder="A business or person's name"
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
                                  placeholder="name@email.com"
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
                                  placeholder="(123) 456-7890"
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
                                  placeholder="1234 Main St, Suite 200, City, State, Zip Code"
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
                                  placeholder="Additional information about the client."
                                  defaultValue={client.notes}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 px-4 py-4 justify-between items-center">
                      <div className="deleteButton">
                        {
                          clientInvoices.invoices.length > 0 ? (
                          null
                          ) : (
                          <button
                            type="button"
                            className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-400"
                            onClick={() => setAlert(true)}
                          >
                          Delete
                        </button>
                          )
                        }
                      
                      </div>
                      <div className="cancelSave">
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
                      
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>

    {/* Success notification: Client Updated */}
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

      {/* Success notification: Client Deleted */}
    <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
          <Transition
            show={successDelete}
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
                      Successfully removed!
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      The client have been removed!.
                    </p>
                  </div>
                  <div className="ml-4 flex flex-shrink-0">
                    <button
                      type="button"
                      className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={() => {
                        setSuccessDelete(false);
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

      {/* Alert notification: Client is about to be removed */}
      <Transition.Root show={alert} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setAlert}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 dark:bg-gray-900">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10 dark:bg-red-400/10 dark:ring-1 dark:ring-inset dark:ring-red-400/20">
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                        Delete Client
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                          {<>Are you sure you want to remove this client from your account? <br />
                          All data about this client will be permanently
                          removed. <br /> This action cannot be undone.</>}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 dark:bg-gray-800 dark:border-t dark:border-slate-700">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                    onClick={handleDelete}
                  >
                    Delete Client
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-700"
                    onClick={() => setAlert(false)}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
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
