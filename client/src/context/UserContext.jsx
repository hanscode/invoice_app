import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import Cookies from "js-cookie";
import { api } from "../utils/apiHelper";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const UserContext = createContext(null);

/**
 * Using the React Context API for Global State Management.
 *
 * The authenticated user, user signin(), and user signout() are specified in the
 * `UserProvider` component ensuring their accessibility across the application via Context API.
 *
 * @param {object} props
 * @returns Context API Provider Component.
 */

export const UserProvider = (props) => {
  const [authUser, setAuthUser] = useState(null);
  const navigate = useNavigate();

  const signIn = async (credentials) => {
    try {
      const response = await api("/users", "GET", null, credentials);
      if (response.status === 200) {
        const data = await response.json();

        // Extract token and user data
        const { token, user, expiration } = data;

        // Store token in cookies with dynamic expiration time
        const expirationTime = new Date(expiration); // Convert expiration to Date object
        const expiresInMs = expirationTime.getTime() - Date.now(); // Calculate expiration time in milliseconds
        Cookies.set("token", token, { expires: expiresInMs }); // Set expiration time in milliseconds

        // Store password with user object to be used when creating, updating, or deleting with the api
        user.password = credentials.password;
        setAuthUser(user);
        return user;
      } else if (response.status === 401) {
        return null;
      } else if (response.status === 500) {
        navigate("/error");
      } else {
        throw new Error();
      }
    } catch (error) {
      console.log(error);
      navigate("/error");
    }
  };

  const signOut = () => {
    // Remove token from cookies
    Cookies.remove("token");
    setAuthUser(null);
  };

  // Function to check if the token is expired
  const isTokenExpired = () => {
    const token = Cookies.get("token");
    if (!token) return true; // Token is not present

    const decodedToken = jwtDecode(token);
    const expirationTime = decodedToken.exp * 1000; // Convert seconds to milliseconds
    const currentTime = Date.now();

    return currentTime > expirationTime;
  };

  useEffect(() => {
    if (isTokenExpired()) {
      // Token has expired, clear authentication state
      signOut();
    }
  }, [navigate]);

  return (
    <UserContext.Provider
      value={{
        authUser,
        token: Cookies.get("token"),
        actions: {
          signIn,
          signOut,
        },
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
};

export default UserContext;

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
