import { useContext, useEffect, useState } from "react";
import { FetchInvoices } from "../../../utils/FetchInvoices";
import calculateTotal from "../../../utils/calculateTotal";
import calculatePaid from "../../../utils/calculatePaid";
import calculateOverdue from "../../../utils/calculateOverdue";
import FormatNumber from "../../../utils/FormatNumber";
import UserContext from "../../../context/UserContext";

// Stats component
const Stats = () => {
  const { authUser } = useContext(UserContext);
  const [totals, setTotals] = useState(null); // State to store the calculated totals

  // Fetch all invoices and calculate totals when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const allInvoices = await FetchInvoices(authUser);
        const userInvoices = allInvoices.filter(invoice => invoice.userId === authUser.id);
        
        const overdueTotal = calculateOverdue(userInvoices, invoice => invoice.isOverdue == true);
        const billedTotal = calculateTotal(userInvoices, invoice => invoice.status !== 'paid');
        const paidTotal = calculatePaid(userInvoices, invoice => invoice.amountDue !== 0);
        const outstandingTotal = billedTotal - paidTotal;
       
        
        setTotals({ overdueTotal, outstandingTotal, paidTotal }); // Set the calculated totals in state
      } catch (error) {
        console.error("Error fetching or calculating totals:", error);
      }
    };

    fetchData(); // Call the fetchData function when the component mounts
  }, [authUser]); // Run effect when authUser changes

  // Dummy data array with the calculated totals
  const stats = [
    { name: 'Overdue invoices', value: Number(totals?.overdueTotal ?? 0) },
    { name: 'Outstanding invoices', value: Number(totals?.outstandingTotal ?? 0) },
    { name: 'Paid', value: Number(totals?.paidTotal ?? 0)},
  ];

  // Render the stats using the fetched and calculated totals
  return (
    <dl className="mx-auto max-w-7xl grid grid-cols-1 gap-px bg-gray-900/5 sm:grid-cols-1 lg:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-4 py-10 sm:px-6 xl:px-8"
        >
          <dt className="text-sm font-medium leading-6 text-gray-500">{stat.name}</dt>
          <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">
          <span className={`${stat.name === 'Paid' ? 'text-green-500': ''}`}><FormatNumber number={stat.value} /> </span>
          </dd>
        </div>
      ))}
    </dl>
  );
};

export default Stats;
