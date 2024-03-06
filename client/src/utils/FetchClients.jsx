import { api } from "./apiHelper";

const FetchClients = async (authUser) => {
    let allClients = [];
    let currentPage = 1;
    let totalPages = 1;
    while (currentPage <= totalPages) {
      try {
        const response = await api(`/customers?page=${currentPage}&limit=10`, "GET", null, authUser);
        const jsonData = await response.json();
        
        if (response.status === 200) {
          allClients = allClients.concat(jsonData.customers);
          totalPages = Math.ceil(jsonData.totalCount / 10);
          currentPage++;
        } else if (response.status === 500) {
          throw new Error("Internal Server Error");
        }
      } catch (error) {
        throw new Error(`Error fetching and parsing the data: ${error}`);
      }
    }
  
    return allClients;
}

export default FetchClients