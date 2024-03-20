import { api } from "../../utils/apiHelper";
import { useContext, useEffect, useRef, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import ErrorsDisplay from "../ErrorsDisplay";

import { Transition } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { ExclamationCircleIcon } from '@heroicons/react/20/solid'
import { XMarkIcon } from "@heroicons/react/20/solid";

import UserContext from "../../context/UserContext";
import Spinner from "../layouts/loaders/Spinner";

const UserSettings = () => {
  const { authUser } = useContext(UserContext);
  const [user, setUser] = useState();
  const [prevUser, setPrevUser] = useState(); // eslint-disable-line
  const navigate = useNavigate();
  const [newPasswordValue, setNewPasswordValue] = useState("");
  const [currentPasswordValue, setCurrentPasswordValue] = useState("");
  const [success, setSuccess] = useState(false);
  const [danger, setDanger] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get the user details
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await api(`/users`, "GET", null, authUser.token);
        const jsonData = await response.json();
        if (response.status === 200) {
          setUser(jsonData.user);
          setPrevUser(jsonData.user); // Initialize prevUser with authUser
        } else if (response.status === 500) {
          navigate(`/error`);
        }
      } catch (error) {
        console.log(`Error fetching and parsing the data`, error);
        navigate("/error");
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchUserInfo();
  }, [navigate, authUser.token]);

  // Function to handle changes in the new password field
  const handleNewPasswordChange = (event) => {
    setNewPasswordValue(event.target.value);
  };

  // Function to handle changes in the current password field
  const handleCurrentPasswordChange = (event) => {
    setCurrentPasswordValue(event.target.value);
  };

  // Refs
  const firstName = useRef(null);
  const lastName = useRef(null);
  const email = useRef(null);
  const currentPassword = useRef(null);
  const newPassword = useRef(null);
  const [errors, setErrors] = useState([]);

  // Render spinner if loading
  if (loading) {
    return <Spinner />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate form fields
    const validationErrors = {};
    if (!firstName.current.value.trim()) {
      validationErrors.firstName = "First name is required";
    }
    if (!lastName.current.value.trim()) {
      validationErrors.lastName = "Last name is required";
    }
    if (!email.current.value.trim()) {
      validationErrors.email = "Email is required";
    }

    // provide a valid email address
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.current.value.trim())) {
      validationErrors.email = "Please provide a valid email address";
    }

    if (newPasswordValue && !currentPasswordValue) {
      validationErrors.currentPassword = "Current password is required";
    }
    if (currentPasswordValue && !newPasswordValue) {
      validationErrors.newPassword = "New password field cannot be empty";
    }

    // If there are validation errors, set errors state and return
    if (Object.keys(validationErrors).length > 0) {
      setDanger(true);
      setErrors(validationErrors);
      return;
    }

    // Create an object to hold the updated user fields
    const updatedUser = {
      id: user.id, // Include the user's ID, Using the user state directly
    };

    // Check if each field has been modified and update the updatedUser object
    if (firstName.current.value !== user.firstName) {
      updatedUser.firstName = firstName.current.value;
    }
    if (lastName.current.value !== user.lastName) {
      updatedUser.lastName = lastName.current.value;
    }
    if (email.current.value !== user.emailAddress) {
      updatedUser.emailAddress = email.current.value;
    }
    if (currentPassword.current.value && newPasswordValue) {
      updatedUser.currentPassword = currentPasswordValue;
      updatedUser.newPassword = newPasswordValue;
    }
    // If the user has not made any changes, set the danger state and return
    if (Object.keys(updatedUser).length === 1) {
      setDanger(true);
      setErrors(["You have not made any changes to your account. Please update your information to save."]);
      return;
    }

    // PUT requets that will update the individual user
    try {
      const response = await api(
        `/users/${user.id}`,
        "PUT",
        updatedUser,
        authUser.token
      );
      if (response.status === 200 || response.status === 204) {
        navigate(`/app/settings`);
        // Update the user state with the new data
        setUser((prevUser) => ({
          ...prevUser,
          ...updatedUser,
        }));
        setSuccess(true);
      } else if (response.status === 403) {
        navigate(`/forbidden`);
      } else if (response.status === 500) {
        navigate(`/error`);
      } else {
        setErrors(["User update was unsuccessful"]);
      }
    } catch (error) {
      console.log(error);
      navigate(`/error`);
    }
  };

  const handleCancel = (event) => {
    event.preventDefault();
    navigate(-1);
  };

  return (
    <>
      <div className="relative isolate overflow-hidden">
        {/* Secondary navigation */}
        <header className="pb-4 pt-6 sm:pb-6">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight dark:text-slate-300">
                Account Settings
              </h2>
              <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-slate-400">
                  Manage the email address and password associated with your
                  account.
                </div>
              </div>
            </div>
            <div className="mt-4 flex md:ml-4 md:mt-0">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="editUser"
                className="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Save
              </button>
            </div>
          </div>
        </header>
      </div>

      <div className="lg:border-t lg:border-t-gray-900/5 dark:lg:border-t-gray-800">
        <div className="relative mx-auto max-w-[40rem] space-y-16 divide-y divide-slate-100">
          <div className="mt-8 px-4 sm:px-6 lg:px-8">
            <ErrorsDisplay errors={errors} />
            <form id="editUser" onSubmit={handleSubmit}>
              <div className="space-y-12">
                <div className="border-b border-gray-900/10 pb-12 dark:border-gray-800">
                  <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                    Email address
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-slate-400">
                    Update your email address associated with your account.
                  </p>

                  <div className="mt-10">
                    <div className="sm:col-span-4">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-300"
                      >
                        Email address
                      </label>
                      <div className="relative mt-2">
                        <input
                          id="email"
                          name="email"
                          type="email"
                          ref={email}
                          defaultValue={user?.emailAddress}
                          aria-invalid={errors.email ? "true" : "false"}
                          aria-describedby={errors.email ? "email-error" : null}
                          autoComplete="email"
                          className={`${
                            errors.email
                              ? "text-red-900 ring-red-300 placeholder:text-red-300 focus:ring-red-500 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20"
                              : "text-gray-900 shadow-sm ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:ring-white/10 dark:focus:ring-indigo-500"
                          } block pr-10 w-full rounded-md border-0 py-1.5 ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
                        />
                        {errors.email && (
                          <>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 h-9">
                              <ExclamationCircleIcon className="h-5 w-5 text-red-500 dark:text-red-400" aria-hidden="true"/>
                            </div>
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400" id="email-error">{errors.email}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-900/10 pb-12 dark:border-gray-800">
                  <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                    Personal Information
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-slate-400">
                    Your full name or profile name is used in your invoices and
                    receipts.
                  </p>

                  <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="first-name"
                        className="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-300"
                      >
                        First name
                      </label>
                      <div className="relative mt-2">
                        <input
                          type="text"
                          name="first-name"
                          id="first-name"
                          ref={firstName}
                          defaultValue={user?.firstName}
                          aria-invalid={errors.firstName ? "true" : "false"}
                          aria-describedby={ errors.firstName ? "firstName-error" : null}
                          autoComplete="given-name"
                          className={`${
                            errors.firstName
                              ? "text-red-900 ring-red-300 placeholder:text-red-300 focus:ring-red-500 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20"
                              : "text-gray-900 shadow-sm ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:ring-white/10 dark:focus:ring-indigo-500"
                          } block pr-10 w-full rounded-md border-0 py-1.5 ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
                        />
                        {errors.firstName && (
                          <>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 h-9">
                              <ExclamationCircleIcon className="h-5 w-5 text-red-500 dark:text-red-400" aria-hidden="true"/>
                            </div>
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400" id="firstName-error">{errors.firstName}</p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label
                        htmlFor="last-name"
                        className="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-300"
                      >
                        Last name
                      </label>
                      <div className="relative mt-2">
                        <input
                          type="text"
                          name="last-name"
                          id="last-name"
                          ref={lastName}
                          defaultValue={user?.lastName}
                          aria-invalid={errors.lastName ? "true" : "false"}
                          aria-describedby={ errors.lastName ? "lastName-error" : null}
                          autoComplete="family-name"
                          className={`${
                            errors.lastName
                              ? "text-red-900 ring-red-300 placeholder:text-red-300 focus:ring-red-500 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20"
                              : "text-gray-900 shadow-sm ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:ring-white/10 dark:focus:ring-indigo-500"
                          } block pr-10 w-full rounded-md border-0 py-1.5 ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
                        />
                        {errors.lastName && (
                          <>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 h-9">
                              <ExclamationCircleIcon className="h-5 w-5 text-red-500 dark:text-red-400" aria-hidden="true"/>
                            </div>
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400" id="lastName-error">{errors.lastName}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-900/10 pb-12 dark:border-gray-800">
                  <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                    Password
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-slate-400">
                    Update your password associated with your account.
                  </p>

                  <div className="mt-10">
                    <div className="sm:col-span-4">
                      <label
                        htmlFor="old_password"
                        className="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-300"
                      >
                        Current Password
                      </label>
                      <div className="relative mt-2">
                        <input
                          id="old_password"
                          name="old_password"
                          type="password"
                          ref={currentPassword}
                          aria-invalid={errors.currentPassword ? "true" : "false"}
                          aria-describedby={ errors.currentPassword ? "currentPassword-error" : null}
                          autoComplete="current-password"
                          //*required={newPasswordValue !== ""}
                          onChange={handleCurrentPasswordChange}
                          className={`${
                            errors.currentPassword
                              ? "text-red-900 ring-red-300 placeholder:text-red-300 focus:ring-red-500 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20"
                              : "text-gray-900 shadow-sm ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:ring-white/10 dark:focus:ring-indigo-500"
                          } block pr-10 w-full rounded-md border-0 py-1.5 ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
                        />
                        {errors.currentPassword && (
                          <>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 h-9">
                              <ExclamationCircleIcon className="h-5 w-5 text-red-500 dark:text-red-400" aria-hidden="true"/>
                            </div>
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400" id="currentPassword-error">{errors.currentPassword}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="relative mt-10">
                    <div className="sm:col-span-4">
                      <label
                        htmlFor="new_password"
                        className="block text-sm font-medium leading-6 text-gray-900 dark:text-slate-300"
                      >
                        New Password
                      </label>
                      <div className="mt-2">
                        <input
                          id="new_password"
                          name="password"
                          type="password"
                          ref={newPassword}
                          value={newPasswordValue}
                          onChange={handleNewPasswordChange}
                          aria-invalid={errors.newPassword ? "true" : "false"}
                          aria-describedby={ errors.newPassword ? "newPassword-error" : null}
                          className={`${
                            errors.newPassword
                              ? "text-red-900 ring-red-300 placeholder:text-red-300 focus:ring-red-500 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20"
                              : "text-gray-900 shadow-sm ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:ring-white/10 dark:focus:ring-indigo-500"
                          } block pr-10 w-full rounded-md border-0 py-1.5 ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
                        />
                         {errors.newPassword && (
                          <>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 h-9">
                              <ExclamationCircleIcon className="h-5 w-5 text-red-500 dark:text-red-400" aria-hidden="true"/>
                            </div>
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400" id="newPassword-error">{errors.newPassword}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-x-4">
                <button
                  onClick={handleCancel}
                  type="button"
                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Global notification live region, render this permanently at the end of the document */}

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
            enter="transform ease-out duration-300 transition"
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
                      You account settings have been updated!.
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

      {/* Danger notification */}
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
          <Transition
            show={danger}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
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
                    <ExclamationCircleIcon
                      className="h-6 w-6 text-red-400"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">
                      Something went wrong!
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Please check the form for errors and try again.
                    </p>
                  </div>
                  <div className="ml-4 flex flex-shrink-0">
                    <button
                      type="button"
                      className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={() => {
                        setDanger(false);
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

export default UserSettings;
