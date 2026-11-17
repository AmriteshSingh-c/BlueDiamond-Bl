import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';

const Signin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signIn } = UserAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const result = await signIn(email, password);
      const loggedInUser = result?.user || { email, role: email === 'admin@gmail.com' ? 'admin' : 'user' };

      if (loggedInUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    } catch (e) {
      setError(e.message || 'Unable to sign in.');
      console.log(e.message || e);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-between bg-gradient-to-br from-blue-700 via-blue-800 to-sky-900 p-8 text-white">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-100">
              Workflow Portal
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight">BlueDiamond BL</h2>
            <p className="mt-4 max-w-md text-sm text-blue-100/90">
              Manage shipping drafts, review unsigned jobs, and keep document workflows organized from one secure workspace.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-100">Operations</p>
            <p className="mt-2 text-lg font-semibold">Simple access. Clear actions. Better visibility.</p>
          </div>
        </div>

        <div className="p-8 sm:p-10">
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              Welcome back
            </p>
            <h3 className="mt-2 text-3xl font-bold text-slate-900">Sign in</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Email Address</label>
              <input
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="primary-button w-full"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signin;
