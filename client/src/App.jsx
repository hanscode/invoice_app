import { Route, Routes } from "react-router-dom";

// Import App components
import Home from "./components/Home";
import Header from "./components/Header";
import Dashboard from "./components/pages/Dashboard";
import Clients from "./components/pages/Clients";
import Invoices from "./components/pages/Invoices";
import PrivateRoute from "./components/PrivateRoute";

import UserSignIn from "./components/UserSignIn";
import UserSignUp from "./components/UserSignUp";
import UserSignOut from "./components/UserSignOut";
import Footer from "./components/Footer";

// Importing the App Error Components
import UnhandledError from "./components/UnhandledError";
import NotFound from "./components/NotFound";
import Forbidden from "./components/Forbidden";

function App() {

  return (
    <>
   <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          {/** Authentication Routes */}
          <Route path="signin" element={<UserSignIn />} />
          <Route path="signup" element={<UserSignUp />} />
          <Route path="signout" element={<UserSignOut />} />
          {/** Private Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/app" element={<Dashboard />} />
            <Route path='/app/clients' element={<Clients />} />
            <Route path='/app/invoices' element={<Invoices />} />
          </Route>

          {/** Error routes paths for displaying user-friendly messages when things go wrong. */}
          <Route path="notfound" element={<NotFound  />} />
          <Route path="forbidden" element={<Forbidden />} />
          <Route path="error" element={<UnhandledError />} />
          <Route path="*" element={<NotFound  />} />
        </Routes>
      </main>
    <Footer />
    </>
  );
}

export default App;