import { useContext, Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/20/solid";
import { ThemeContext } from "../context/ThemeContext";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const ThemeSwitcher = () => {
  const { theme, handleThemeChange } = useContext(ThemeContext);

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="flex items-center rounded-ful text-gray-400 hover:text-gray-600 focus:outline-none">
          <span className="sr-only">Open options</span>
          {theme === "light" ? (
            <SunIcon className="h-6 w-6 text-indigo-600" />
          ) : theme === "dark" ? (
            <MoonIcon className="h-6 w-6 dark:text-indigo-400 dark:hover:text-indigo-300" />
          ) : (
            <MoonIcon className="h-6 w-6 text-gray-500 hover:text-gray-400" />
          )}
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-36 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-slate-700">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => handleThemeChange("light")}
                  className={classNames(
                    active
                      ? "bg-gray-100 text-slate-700 dark:bg-gray-700 dark:text-white"
                      : "text-slate-700 dark:text-slate-300",
                    "group w-full flex items-center px-4 py-2 text-sm"
                  )}
                >
                  <SunIcon
                    className={`mr-3 h-5 w-5 text-gray-400 group-hover:text-indigo-400 ${
                      theme === "light" && "text-indigo-600"
                    }`}
                    aria-hidden="true"
                  />
                  Light
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => handleThemeChange("dark")}
                  className={classNames(
                    active
                      ? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-white"
                      : "text-gray-700 dark:text-slate-300",
                    "group w-full flex items-center px-4 py-2 text-sm"
                  )}
                >
                  <MoonIcon
                    className={`mr-3 h-5 w-5 text-gray-400 group-hover:text-indigo-400 ${
                      theme === "dark" &&
                      "dark:text-indigo-400 dark:hover:text-indigo-300"
                    }`}
                    aria-hidden="true"
                  />
                  Dark
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => handleThemeChange("system")}
                  className={classNames(
                    active
                      ? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-white"
                      : "text-gray-700 dark:text-slate-300",
                    "group w-full flex items-center px-4 py-2 text-sm"
                  )}
                >
                  <ComputerDesktopIcon
                    className={`mr-3 h-5 w-5 text-gray-400 group-hover:text-indigo-400 ${
                      theme === "system" &&
                      "dark:text-indigo-400 dark:hover:text-indigo-300"
                    }`}
                    aria-hidden="true"
                  />
                  System
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default ThemeSwitcher;
