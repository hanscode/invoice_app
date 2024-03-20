import { useContext, useEffect } from "react";
import UserContext from "../../context/UserContext";
import { Navigate } from "react-router-dom";

/**
 *  Logs out the authenticated user and redirect them to the invoices list.
 * 
 * @returns Navigation to the default route `Invoices` Component.
 */

const UserSignOut = () => {
  const { actions } = useContext(UserContext);

  useEffect(() => actions.signOut());

  return <Navigate to="/" replace />;
};

export default UserSignOut;
 