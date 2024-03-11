import { createContext, useState } from "react";
import PropTypes from "prop-types";
import Cookies from "js-cookie";
import { api } from "../utils/apiHelper";
import { useNavigate } from "react-router-dom";

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
  const cookie = Cookies.get("authenticatedUser");
  const [authUser, setAuthUser] = useState(cookie ? JSON.parse(cookie) : null);
  const navigate = useNavigate();

  const signIn = async (credentials) => {
    try {
      const response = await api("/users", "GET", null, credentials);
      if (response.status === 200) {
        const data = await response.json();

        // Extract token and user data
        const { token, user } = data;

        // Store token in cookies
        Cookies.set("token", token, { expires: 1 });

        // Store password with user object to be used when creating, updating, or deleting with the api
        // Also, store the authenticated user data in browser cookies for 1 day.
        user.password = credentials.password;
        setAuthUser(user);
        Cookies.set("authenticatedUser", JSON.stringify(user), { expires: 1 });
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
    Cookies.remove("authenticatedUser");
  };

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
