import { Fragment, useContext, useRef, useState } from "react";
import { api } from "../../utils/apiHelper";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

import UserContext from "../../context/UserContext";
import ErrorsDisplay from "../ErrorsDisplay";

/**
 * CreateClient component
 * @param {boolean} open - The state of the modal
 * @param {function} setOpen - The function to set the state of the modal
 * @returns {JSX.Element} - The CreateClient component
 * @constructor - CreateClient
 */

const CreateClient = ({ open, setOpen, updateClients }) => {
  const { authUser } = useContext(UserContext);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Create a ref for each input field
  const name = useRef(null);
  const email = useRef(null);
  const phone = useRef(null);
  const address = useRef(null);
  const notes = useRef(null);
  const [errors, setErrors] = useState([]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const client = {
      name: name.current.value,
      email: email.current.value,
      phone: phone.current.value,
      address: address.current.value,
      notes: notes.current.value,
      userId: authUser.id,
    };

    // POST for creating a new client
    try {
      const response = await api("/customers", "POST", client, authUser.token);
      if (response.status === 201) {
        setSuccess(true);
        setOpen(false);
        updateClients(); // Call updateClients function passed from Clients component
        // const path = response.headers.get("Location");
        // navigate(path);
      } else if (response.status === 400) {
        const jsonData = await response.json();
        setErrors(jsonData.errors);
      } else if (response.status === 500) {
        navigate(`/error`);
      } else {
        throw new Error();
      }
    } catch (error) {
      console.log(error);
      navigate("/error");
    }
  };

  const handleCancel = (event) => {
    event.preventDefault();
    setOpen(false);
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  return (
    <>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setOpen}>
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
                      className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl"
                    >
                      <div className="h-0 flex-1 overflow-y-auto">
                        <div className="bg-indigo-700 px-4 py-6 sm:px-6">
                          <div className="flex items-center justify-between">
                            <Dialog.Title className="text-base font-semibold leading-6 text-white">
                              New Client
                            </Dialog.Title>
                            <div className="ml-3 flex h-7 items-center">
                              <button
                                type="button"
                                className="relative rounded-md bg-indigo-700 text-indigo-200 hover:text-white focus:outline-none"
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
                              Fill in the form below to create a new client.
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
                                  className="block text-sm font-medium leading-6 text-gray-900"
                                >
                                  Name
                                </label>
                                <div className="mt-2">
                                  <input
                                    type="text"
                                    name="client-name"
                                    id="client-name"
                                    ref={name}
                                    defaultValue=""
                                    placeholder="A business or person's name"
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                  />
                                </div>
                              </div>
                              <div>
                                <label
                                  htmlFor="client-email"
                                  className="block text-sm font-medium leading-6 text-gray-900"
                                >
                                  Email Address
                                </label>
                                <div className="mt-2">
                                  <input
                                    type="email"
                                    name="client-email"
                                    id="client-email"
                                    ref={email}
                                    defaultValue=""
                                    placeholder="name@email.com"
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                  />
                                </div>
                              </div>
                              <div>
                                <label
                                  htmlFor="client-phone"
                                  className="block text-sm font-medium leading-6 text-gray-900"
                                >
                                  Phone Number
                                </label>
                                <div className="mt-2">
                                  <input
                                    type="text"
                                    name="client-phone"
                                    id="client-phone"
                                    ref={phone}
                                    defaultValue=""
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    placeholder="(123) 456-7890"
                                  />
                                </div>
                              </div>
                              <div>
                                <label
                                  htmlFor="address"
                                  className="block text-sm font-medium leading-6 text-gray-900"
                                >
                                  Address
                                </label>
                                <div className="mt-2">
                                  <textarea
                                    id="address"
                                    name="address"
                                    rows={3}
                                    ref={address}
                                    placeholder="1234 Main St, Suite 200, City, State, Zip Code"
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    defaultValue={""}
                                  />
                                </div>
                              </div>
                              <div>
                                <label
                                  htmlFor="notes"
                                  className="block text-sm font-medium leading-6 text-gray-900"
                                >
                                  Notes
                                </label>
                                <div className="mt-2">
                                  <textarea
                                    id="notes"
                                    name="notes"
                                    rows={4}
                                    ref={notes}
                                    placeholder="Additional information about the client."
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    defaultValue={""}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`flex flex-shrink-0 px-4 py-4 ${
                          errors.length > 0
                            ? "justify-between items-center"
                            : "justify-end"
                        }`}
                      >
                        {errors.length > 0 && (
                          <div className="text-sm text-red-600">
                            Please fix the errors above!
                          </div>
                        )}
                        <div className="actionsButtons">
                          <button
                            type="button"
                            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            onClick={handleCancel}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="ml-4 inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          >
                            Create
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
                      A new client have been created!.
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

export default CreateClient;

CreateClient.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  updateClients: PropTypes.func,
};
