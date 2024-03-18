import { useContext } from "react";
import UserContext from "../context/UserContext";
/**
 * Displays a message letting the user know they can't access the requested page.
 * @returns A forbidden "permissions denied" message.
 */

const Forbidden = () => {
  const { isTokenExpired } = useContext(UserContext);
    return (
      <>
          <div className="text-center grid min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8">
            <p className="text-base font-semibold text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300">Oh My Goodness!</p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-slate-300">
            Forbidden
            </h1>
            <p className="mt-6 text-base leading-7 text-gray-600 dark:text-slate-400">
            You don&apos;t have permission to access this resource.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href={isTokenExpired() === true ? "/" : "/app"}
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Go back home
              </a>
              <a
                href="https://pricode.io/contact"
                className="text-sm font-semibold text-gray-900 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Contact support <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
       
      </>
    );
  };
  
  export default Forbidden;
  