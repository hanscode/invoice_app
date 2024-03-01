import { useContext} from 'react';
import UserContext from '../context/UserContext';
import { useLocation } from "react-router-dom";
import HeaderHome from './layouts/home/HeaderHome';
import HeaderApp from './layouts/app/HeaderApp';

const Header = () => {
  const { pathname } = useLocation();
  const { authUser } = useContext(UserContext);

  return pathname === "/" ? (
    <HeaderHome />
  ) : (
    <>
   { authUser === null || pathname === '/signin' || pathname === '/signup' ? '' : <HeaderApp />}
    </>
  )
}

export default Header