import { useContext } from "react";
import PropTypes from "prop-types";
import UserContext from "../../../context/UserContext";
import { useLocation } from "react-router-dom";
import HeaderHome from "./HeaderHome";
import HeaderApp from "./HeaderApp";

const Header = () => {
  const { pathname } = useLocation();
  const { isTokenExpired} = useContext(UserContext);

  return pathname === "/" ? (
    <HeaderHome />
  ) : (
    <>
      {isTokenExpired() === true ||
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