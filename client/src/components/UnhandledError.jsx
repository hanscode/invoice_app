import { useContext } from "react";
import UserContext from "../context/UserContext";
/**
 * Displays a message letting the user know an unexpected error has occured.
 *
 * @returns An error message.
 */

const UnhandledError = () => {
  const { isTokenExpired } = useContext(UserContext);
  return (
    <>
        <div className="text-center grid min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8">
          <p className="text-base font-semibold text-indigo-600">
            Unexpected Error
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Internal Server Error
          </h1>
          <p className="mt-6 text-base leading-7 text-gray-600">
            Sorry! There was an unexpected error on the server
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
              className="text-sm font-semibold text-gray-900"
            >
              Contact support <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
    </>
  );
};

export default UnhandledError;
