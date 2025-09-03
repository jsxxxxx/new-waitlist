import React, { useState } from "react";
import LoginForm from "./components/LoginForm";
import WaitlistViewer from "./components/WaitlistViewer";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div>
      {isLoggedIn ? (
        <WaitlistViewer />
      ) : (
        <LoginForm onLoginSuccess={() => setIsLoggedIn(true)} />
      )}
    </div>
  );
};

export default App;
