import { Fragment, useContext } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link, useLocation } from "react-router-dom";
import UserContext from "../../../context/UserContext";
import { getGravatar } from "../../../utils";
import Images from "../../Images";

const navigation = [
  { name: "Dashboard", path: "/app" },
  { name: "Invoices", path: "/app/invoices" },
  { name: "Clients", path: "/app/clients" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const HeaderApp = () => {
  const { authUser } = useContext(UserContext);
  const { pathname } = useLocation();
  return (
    <Disclosure as="nav" className="bg-white dark:bg-gray-800 shadow">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-white">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <Link to="/app">
                    <img
                      className="h-10 w-auto hidden dark:block"
                      src={Images.logoDarkBrand}
                      alt="Satoshi Invoice"
                    />
                    <img
                      className="h-10 w-auto block dark:hidden"
                      src={Images.logoLightBrand}
                      alt="Satoshi Invoice"
                    />
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:block">
                <div className="flex space-x-4">
                  {/* Current: "border-indigo-500 text-gray-900", Default: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700" */}
                  {navigation.map((item, itemIdx) => (
                    <Link
                      key={itemIdx}
                      to={item.path}
                      className={classNames(
                        item.path === pathname
                          ? "bg-indigo-50 border-none text-indigo-700 dark:text-white dark:bg-gray-900"
                          : "border-transparent text-gray-500 hover:bg-gray-100 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white dark:hover:bg-gray-700",
                        "rounded-md px-3 py-2 text-sm font-medium"
                      )}
                      aria-current={item.path === pathname ? "page" : undefined}
                    >
                      {item.name}
                    </Link>
                  ))}
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="relative flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">Open user menu</span>
                      <img
                        className="h-8 w-8 rounded-full"
                        src={getGravatar(authUser.emailAddress)}
                        alt=""
                      />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item className="border-b-[1px]">
                        <p className={classNames("truncate px-3.5 py-3")}>
                          <span
                            className={classNames(
                              "block text-xs text-gray-500"
                            )}
                            role="none"
                          >
                            Signed in as
                          </span>
                          <span
                            className={classNames(
                              "mt-0.5 font-semibold text-sm"
                            )}
                            role="none"
                          >
                            {authUser.emailAddress}
                          </span>
                        </p>
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="app/settings"
                            className={classNames(
                              active ? "bg-gray-100" : "",
                              "block px-4 py-2 text-sm text-gray-700"
                            )}
                          >
                            Account Settings
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/"
                            className={classNames(
                              active ? "bg-gray-100" : "",
                              "block px-4 py-2 text-sm text-gray-700"
                            )}
                          >
                            Home
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="/signout"
                            className={classNames(
                              active ? "bg-gray-100" : "",
                              "block px-4 py-2 text-sm text-gray-700"
                            )}
                          >
                            Sign out
                          </a>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {/* Current: "bg-indigo-50 border-indigo-500 text-indigo-700", Default: "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700" */}
              {navigation.map((item, itemIdx) => (
                <Disclosure.Button
                  key={itemIdx}
                  as="a"
                  href={item.path}
                  className={classNames(
                    item.path === pathname
                      ? "bg-indigo-50 border-none text-indigo-700 dark:bg-gray-900 dark:text-white"
                      : "border-transparent text-gray-500 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white",
                    "block rounded-md py-2 px-3 text-base font-medium"
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default HeaderApp;
