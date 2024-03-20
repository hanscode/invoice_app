import propTypes from "prop-types";

const DaysOld = ({ dueDate, isClosed }) => {
  // Current date
  const currentDate = new Date();

  // Convert dueDate to a Date object
  const dueDateObj = new Date(dueDate);

  // Calculate the difference in milliseconds
  const differenceInMilliseconds = currentDate - dueDateObj;

  // Convert milliseconds to days
  const daysOld = Math.floor(
    Math.abs(differenceInMilliseconds) / (1000 * 60 * 60 * 24)
  );

  // Calculate days remaining
  const daysRemaining = Math.ceil(
    (dueDateObj - currentDate) / (1000 * 60 * 60 * 24)
  );

  return (
    <div>
      {!isClosed && currentDate <= dueDateObj ? (
        <span>{`${daysRemaining} day${
          daysRemaining !== 1 ? "s" : ""
        } remaining until due date.`}</span>
      ) : (
        <>
          {isClosed ? (
            <span>{`Invoice is ${daysOld} day${
              daysOld !== 1 ? "s" : ""
            } old.`}</span>
          ) : (
            <span>{`Invoice is overdue and pending payment.`}</span>
          )}
        </>
      )}
    </div>
  );
};

export default DaysOld;

// set propTypes for DaysOld for the dueDate prop
DaysOld.propTypes = {
  dueDate: propTypes.instanceOf(Date).isRequired,
  isClosed: propTypes.bool.isRequired,
};
