import React from "react";
import Signin from "./components/Signin";
import { Route, Routes } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext";
import Admin from "./components/Profiles/Admin";
import User from "./components/Profiles/User";

function App() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-2xl border border-slate-200 bg-white/80 px-6 py-4 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                BlueDiamond BL
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                House Bill of Lading Portal
              </h1>
            </div>
            <div className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              Secure Operation Workspace
            </div>
          </div>
        </header>

        <AuthContextProvider>
          <Routes>
            <Route path="/" element={<Signin />} />
            <Route path="/user" element={<User />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </AuthContextProvider>
      </div>
    </div>
  );
}

export default App;
