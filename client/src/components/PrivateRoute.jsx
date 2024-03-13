import { useContext } from "react";
import UserContext from "../context/UserContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";

/**
 * Higher-Order component (HOC) for configuring protected routes:
 * All App components except the home landing page and the sign-in / sign-out.
 * 
 * Grants access to protected pages when a logged-in user is authenticated, 
 * utilizing the global authentication user state.
 * 
 * @returns Navigation to allowed paths.
 */
const PrivateRoute = () => {
  const { isTokenExpired } = useContext(UserContext);
  // Save the location object of the current URL in an variable called `Location`.
  const location = useLocation();

  if (isTokenExpired() === false){
    return <Outlet />
  } else {
    // Redirects the user to the /signin route if there's not an authenticated user.
    return <Navigate to="/signin" state={{from: location.pathname }} />
  }
}

export default PrivateRoute