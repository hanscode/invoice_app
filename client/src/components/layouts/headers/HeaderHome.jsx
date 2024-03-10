import { useState, useContext } from "react";
import { Dialog } from "@headlessui/react";
import { Link } from "react-router-dom";
import { Bars3Icon, XMarkIcon, ArrowLeftEndOnRectangleIcon } from "@heroicons/react/24/outline";
import UserContext from "../../../context/UserContext";
import Images from "../../Images";

const navigation = [
  { name: "Dashboard", path: "/app" },
  { name: "Invoices", path: "/app/invoices" },
  { name: "Clients", path: "/app/clients" },
  { name: "Settings", path: "/app/settings" },
];

const HeaderHome = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { authUser } = useContext(UserContext);
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav
        className="flex items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Satoshi Invoice</span>
            <img
              className="h-10 w-auto"
              src={Images.logoDarkBrand}
              alt=""
            />
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {authUser === null
            ? ""
            : navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  {item.name}
                </Link>
              ))}
        </div>
        <div className="hidden lg:flex gap-4 lg:flex-1 items-center lg:justify-end">
          {authUser === null ? (
            <>
              <Link
                to="/signin"
                className="text-sm flex items-center gap-1 font-semibold leading-6 text-gray-900"
              >
                <ArrowLeftEndOnRectangleIcon className="h-4 w-4" aria-hidden="true" /> Sign In
              </Link>
              <Link
                to="/signup"
                className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Get access <span aria-hidden="true">&rarr;</span>
              </Link>
            </>
          ) : (
            <>
              <a
                href="/signout"
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                Sign Out <span aria-hidden="true">&rarr;</span>
              </a>
            </>
          )}
        </div>
      </nav>
      <Dialog
        as="div"
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-50" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">Satoshi Invoice</span>
              <img
                className="h-10 w-auto"
                src={Images.logoDarkBrand}
                alt=""
              />
            </a>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              <div className="py-6">
              {authUser === null ? (
                <>
                <a
                  href="/signin"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  Sign in
                </a>
                <a
                href="/signup"
                className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
              >
                Sign up
              </a>
              </>
              ):(
                <a
                  href="/signout"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  Sign out
                </a>
              )}
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
};

export default HeaderHome;
