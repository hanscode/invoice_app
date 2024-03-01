import { Route, Routes } from "react-router-dom";

// Import App components
import Header from "./components/Header";
import SubHeader from "./components/SubHeader";
import Home from "./components/Home";
import UserSignIn from "./components/UserSignIn";
import UserSignUp from "./components/UserSignUp";

// Importing the App Error Components
import UnhandledError from "./components/UnhandledError";
import NotFound from "./components/NotFound";

function App() {
  return (
    <>
      <Header />
      <SubHeader />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          {/** Authentication Routes */}
          <Route path="signin" element={<UserSignIn />} />
          <Route path="signup" element={<UserSignUp />} />
          {/** Error routes paths for displaying user-friendly messages when things go wrong. */}
          <Route path="notfound" element={<NotFound />} />
          <Route path="error" element={<UnhandledError />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
