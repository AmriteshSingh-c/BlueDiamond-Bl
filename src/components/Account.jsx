import React from "react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";

const Account = () => {
  const { user, logout } = UserAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      console.log("You are logged out");
    } catch (e) {
      console.log(e.message);
    }
  };

  return (
    <div className="w-full flex flex-row justify-around my-16 p-4">
      <p className="font-bold">
        <span className="text-3xl text-blue-800">WELCOME </span>
        <span className="font-extrabold">{user && user.email}</span>
      </p>

      <button
        onClick={handleLogout}
        className="font-bold border-2 bg-blue-500 px-6 py-2 my-4"
      >
        Logout
      </button>
    </div>
  );
};

export default Account;
