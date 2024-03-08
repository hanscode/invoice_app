import { api } from "../utils/apiHelper";
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorsDisplay from "./ErrorsDisplay";

import UserContext from "../context/UserContext";

const UserSettings = () => {
  const { authUser } = useContext(UserContext);
  const [user, setUser] = useState();
  const [prevUser, setPrevUser] = useState(); // eslint-disable-line
  const navigate = useNavigate();
  const [newPasswordValue, setNewPasswordValue] = useState("");

  // Get the user details
  useEffect(() => {
    setUser(authUser);
    setPrevUser(authUser); // Initialize prevUser with authUser
  }, [authUser]);

  // Function to handle changes in the new password field
  const handleNewPasswordChange = (event) => {
    setNewPasswordValue(event.target.value);
  };

  // Refs
  const firstName = useRef(null);
  const lastName = useRef(null);
  const email = useRef(null);
  const currentPassword = useRef(null);
  const newPassword = useRef(null);
  const [errors, setErrors] = useState([]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Create an object to hold the updated user fields
    const updatedUser = {
      id: user.id, // Include the user's ID, Using the user state directly
    };

    // Check if each field has been modified and add it to the updatedUser object
    if (firstName.current.value !== user.firstName) {
      updatedUser.firstName = firstName.current.value;
    }
    if (lastName.current.value !== user.lastName) {
      updatedUser.lastName = lastName.current.value;
    }
    if (email.current.value !== user.emailAddress) {
      updatedUser.emailAddress = email.current.value;
    }
    if (currentPassword.current.value && newPassword.current.value) {
      updatedUser.currentPassword = currentPassword.current.value;
      updatedUser.newPassword = newPassword.current.value;
    }

    // PUT requets that will update the individual course.
    try {
      const response = await api(
        `/users/${user.id}`,
        "PUT",
        updatedUser,
        authUser
      );
      if (response.status === 200 || response.status === 204) {
        navigate(`/app/settings`);
        // Update the user state with the new data
        setUser((prevUser) => ({
          ...prevUser,
          ...updatedUser,
        }));
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
    navigate(`/app/`);
  };

  return (
    <>
      <div className="relative isolate overflow-hidden">
        {/* Secondary navigation */}
        <header className="pb-4 pt-6 sm:pb-6">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                Account Settings
              </h2>
              <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  Manage the email address and password associated with your
                  account.
                </div>
              </div>
            </div>
            <div className="mt-4 flex md:ml-4 md:mt-0">
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                className="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Save
              </button>
            </div>
          </div>
        </header>
      </div>

      <div className="lg:border-t lg:border-t-gray-900/5">
        <div className="relative mx-auto max-w-[40rem] space-y-16 divide-y divide-slate-100">
          <div className="mt-8 px-4 sm:px-6 lg:px-8">
            <ErrorsDisplay errors={errors} />
            <form onSubmit={handleSubmit}>
              <div className="space-y-12">
                <div className="border-b border-gray-900/10 pb-12">
                  <h2 className="text-base font-semibold leading-7 text-gray-900">
                    Email address
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Update your email address associated with your account.
                  </p>

                  <div className="mt-10">
                    <div className="sm:col-span-4">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Email address
                      </label>
                      <div className="mt-2">
                        <input
                          id="email"
                          name="email"
                          type="email"
                          ref={email}
                          defaultValue={user?.emailAddress}
                          autoComplete="email"
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-900/10 pb-12">
                  <h2 className="text-base font-semibold leading-7 text-gray-900">
                    Personal Information
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Your full name or profile name is used in your invoices and
                    receipts.
                  </p>

                  <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="first-name"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        First name
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="first-name"
                          id="first-name"
                          ref={firstName}
                          defaultValue={user?.firstName}
                          autoComplete="given-name"
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label
                        htmlFor="last-name"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Last name
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="last-name"
                          id="last-name"
                          ref={lastName}
                          defaultValue={user?.lastName}
                          autoComplete="family-name"
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-900/10 pb-12">
                  <h2 className="text-base font-semibold leading-7 text-gray-900">
                    Password
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Update your password associated with your account.
                  </p>

                  <div className="mt-10">
                    <div className="sm:col-span-4">
                      <label
                        htmlFor="old_password"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Current Password
                      </label>
                      <div className="mt-2">
                        <input
                          id="old_password"
                          name="old_password"
                          type="password"
                          ref={currentPassword}
                          defaultValue={user?.password}
                          autoComplete="current-password"
                          required={newPasswordValue !== ""}
                          onChange={handleNewPasswordChange}
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-10">
                    <div className="sm:col-span-4">
                      <label
                        htmlFor="new_password"
                        className="block text-sm font-medium leading-6 text-gray-900"
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
                          //required={currentPassword.current?.value !== ""}
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-x-4">
                <button
                  onClick={handleCancel}
                  type="button"
                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
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
    </>
  );
};

export default UserSettings;
