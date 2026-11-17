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
    <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            Logged in as
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            <span className="text-blue-700">Welcome</span> {user && user.email}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="secondary-button"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Account;
