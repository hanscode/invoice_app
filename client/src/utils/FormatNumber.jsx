import PropTypes from 'prop-types';

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