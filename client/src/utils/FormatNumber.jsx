import PropTypes from 'prop-types';

/**
 * Format a number to display with 2 decimal places
 * @param {number} number - The number to format
 * @returns {string} - The formatted number
 */
const FormatNumber = (props) => {
    return (
        <>
          {props.number.toLocaleString('en', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </>
      );
}

export default FormatNumber

FormatNumber.propTypes = {  
    number: PropTypes.number.isRequired
}