import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login as authLogin } from "../app/authslice";
import authService from "../services/Auth";
import toast, { Toaster } from "react-hot-toast";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await authService.login(username, password);
      dispatch(authLogin(user));
      navigate("/home");
    } catch (err) {
      toast.error(err.message || "Login failed. Please try again.");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const user = await authService.signup(fullName, username, password); 
      dispatch(authLogin(user));
      navigate("/home");
    } catch (err) {
      toast.error(err.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a]">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="bg-[#1a1a2e]/90 backdrop-blur-sm p-10 rounded-2xl shadow-lg w-full max-w-md border border-[#2d2d44] transition-all duration-300">
        {/* Logo */}
        <div className="text-center mb-8 flex flex-col items-center">
          <img src="/leetcode.svg" alt="LeetCode Logo" className="w-14 h-14 mb-4 drop-shadow-md" />
          <h1 className="text-3xl font-extrabold text-white tracking-wide">LeetCode Tracker</h1>
          <p className="text-slate-400 mt-1 text-sm">
            {isLogin ? "Track your coding progress" : "Create your account"}
          </p>
        </div>

        {/* Forms */}
        <form className="space-y-6" onSubmit={isLogin ? handleLogin : handleSignup}>
          {!isLogin && (
            <div>
              <label htmlFor="fullname" className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="fullname"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                required
                placeholder="Enter your full name"
                className="w-full px-4 py-2 border border-[#3c3c56] bg-[#12121c] text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
              />
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              placeholder="Enter your username"
              className="w-full px-4 py-2 border border-[#3c3c56] bg-[#12121c] text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-[#3c3c56] bg-[#12121c] text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
            />
          </div>

          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                placeholder="Re-enter your password"
                className="w-full px-4 py-2 border border-[#3c3c56] bg-[#12121c] text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition duration-200 font-semibold tracking-wide ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                {isLogin ? "Logging in..." : "Signing up..."}
              </div>
            ) : isLogin ? (
              "Login"
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        {/* Toggle Button */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setPassword("");
                setConfirmPassword("");
              }}
              className="text-orange-400 hover:underline font-medium"
            >
              {isLogin ? "Sign up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}