/**
 * Displays a message letting the user know an unexpected error has occured.
 * 
 * @returns An error message.
 */

const UnhandledError = () => (
    <div className="wrap">
        <h2>Unexpected Error</h2>
        <p>Sorry! There was an unexpected error on the server.</p>
    </div>
);

export default UnhandledError;