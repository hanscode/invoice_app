import { useEffect, useState } from "react";
import { api } from "../../utils/apiHelper"
import { useNavigate } from "react-router-dom";
import { PlusIcon } from "@heroicons/react/20/solid";

/*const invoices = [
  {
    id: "AAPS0L",
    company: "Chase & Co.",
    share: "CAC",
    commission: "+$4.37",
    price: "$3,509.00",
    quantity: "12.00",
    netAmount: "$4,397.00",
  },
  // More invoices...
];*/

/**
 * This component provides the "Invoices" screen by retrieving the list of invoices 
 * from the REST API's /api/invoices route and rendering a list of invoices. 
 * 
 * Each invoice needs to link to its respective "Invoice details" screen. 
 * 
 * This component also renders a link to the "Create Invoice" screen.
 * 
 * @returns Invoices Component.
 */
  
const Invoices = () => {
  const [invoices, setInvoices] = useState(null);
  const navigate = useNavigate();

 // Fetching the list of invoices from the REST-API when the component is initially rendered.
  useEffect(() => {
    // Define an asynchronous function `fetchInvoices` and call it immediately
    const fetchInvoices = async () => {
      try {
        const response = await api("/invoices", "GET");
        const jsonData = await response.json();
        if (response.status === 200) {
          setInvoices(jsonData);
        } else if (response.status === 500) {
          navigate(`/error`);
        }
      } catch (error) {
        console.log(`Error fetching and parsing the data`, error);
        navigate("/error");
      }
    };
    // Call the fetchInvoices async function when the component is mounted or when the navigate function changes.
    fetchInvoices();
  }, [navigate]); // Indicates that useEffect should run when 'navigate' changes.
  return (
    <>
      <div className="relative isolate overflow-hidden">
        {/* Secondary navigation */}
        <header className="pb-4 pt-6 sm:pb-6">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
            <h1 className="text-base font-semibold leading-7 text-gray-900">
              Invoices
            </h1>
            <a
              href="#"
              className="ml-auto flex items-center gap-x-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <PlusIcon className="-ml-1.5 h-5 w-5" aria-hidden="true" />
              New invoice
            </a>
          </div>
        </header>
      </div>
{invoices}
    </>
  );
};

export default Invoices;
