import React from "react";
import Signin from "./components/Signin";

import { Route, Routes } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext";
import img from "./banner.jpg";
import Admin from "./components/Profiles/Admin";
import User from "./components/Profiles/User";

function App() {
  return (
    <div>
      <div className="w-full flex flex-col justify-center items-center">
        <img src={img} className="w-[75%] max-h-[200px]" alt="unable"></img>
      </div>

      <AuthContextProvider>
        <Routes>
          <Route path="/" element={<Signin />} />

          {/* <Route path='/signup' element={<Signup />} /> */}
          <Route path="/user" element={<User />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </AuthContextProvider>
    </div>
  );
}

export default App;
