/**
 * Display validation errors returned from the REST API.
 * @param {object} errors
 * @returns List of Errors Component.
 */
const ErrorsDisplay = ({ errors }) => {
    let errorsDisplay = null;
  
    if (errors.length) {
      errorsDisplay = (
        <div className="validation--errors mb-5 flex justify-center">
          <ul>
            {errors.map((error, i) => <li className="text-sm text-red-600" key={i}>{error}</li>)}
          </ul>
        </div>
      );
    }
    return errorsDisplay;
  };
  
  export default ErrorsDisplay;