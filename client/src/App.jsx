import { Route, Routes } from "react-router-dom";

// Import necessary modules
import Header from "./components/Header";
import SubHeader from "./components/SubHeader";
import Home from "./components/Home";
import UnhandledError from "./components/UnhandledError";
import UserSignIn from "./components/UserSignIn";
import UserSignUp from "./components/UserSignUp";

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
          <Route path="error" element={<UnhandledError />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
