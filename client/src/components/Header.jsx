import { useContext } from "react";
import PropTypes from "prop-types";
import UserContext from "../context/UserContext";
import { useLocation } from "react-router-dom";
import HeaderHome from "./layouts/headers/HeaderHome";
import HeaderApp from "./layouts/headers/HeaderApp";

const Header = ({ hideHeader }) => {
  const { pathname } = useLocation();
  const { authUser } = useContext(UserContext);

  // Check if 404 error occurred, hide header if true
  if (hideHeader) {
    return null;
  }

  return pathname === "/" ? (
    <HeaderHome />
  ) : (
    <>
      {authUser === null ||
      pathname === "/signin" ||
      pathname === "/signup" ? (
        ""
      ) : (
        <HeaderApp />
      )}
    </>
  );
};

export default Header;

Header.propTypes = {
  hideHeader: PropTypes.bool,
};