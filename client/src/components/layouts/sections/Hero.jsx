import { useContext } from "react";
import UserContext from "../../../context/UserContext";
import { PlusIcon } from "@heroicons/react/20/solid";

const HeroHome = () => {
  const { isTokenExpired } = useContext(UserContext);
  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20 dark:text-gray-300 dark:ring-gray-800 dark:hover:ring-slate-700">
              Powered by Pricode.{" "}
              <a
                href="https://pricode.io"
                target="_blank"
                className="font-semibold text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                <span className="absolute inset-0" aria-hidden="true" />
                Read more <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl dark:text-white">
              Satoshi Invoice
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-slate-300">
              The most amazing and simplest invoice system for real people!
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              {isTokenExpired() === true? (
                <>
                  <a
                    href="/signup"
                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Get started
                  </a>
                </>
              ) : (
                <>
                  <a
                    href="/app/invoices/new"
                    className="flex rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    <PlusIcon className="-ml-1.5 h-5 w-5" aria-hidden="true" />
                    New Invoice
                  </a>
                </>
              )}

              {/** <a href="#" className="text-sm font-semibold leading-6 text-gray-900">
              Learn more <span aria-hidden="true">→</span></a> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroHome;
