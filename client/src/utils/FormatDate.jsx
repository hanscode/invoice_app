/**
 * @param {string} dateString - A date string in the format "YYYY-MM-DD"
 * @returns - A formatted date string in the format "Month Day, Year"
 */
const FormatDate = (dateString) => {
   // Parse the dateString into a Date object
   const date = new Date(dateString);
  
   // Array of month names
   const months = [
     "January", "February", "March", "April", "May", "June",
     "July", "August", "September", "October", "November", "December"
   ];
   
   // Get the month, day, and year from the Date object
   const month = months[date.getMonth()];
   const day = date.getDate();
   const year = date.getFullYear();
   
   // Construct the formatted date string
   const formattedDate = `${month} ${day}, ${year}`;
   
   return formattedDate;
}

export default FormatDate