import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import authService from "../../services/Auth";
import { logout as authLogout } from "../../app/authslice";

export default function Header() {
  const authStatus = useSelector((state) => state.auth.status);
  const role = useSelector((state) => state.role.role);
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => (pathname === path ? "text-white" : "text-slate-300");

  const navItemClass =
    "hover:text-amber-400 px-3 py-2 rounded-md text-sm font-medium transition duration-200";

  const handleLogout = async () => {
    try {
      await authService.logout();
      dispatch(authLogout());
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const showAdmin = role === "admin";

  return (
    <header className="bg-[#0f0f1c] shadow-sm border-b border-[#2d2d3f]">
      <div className="px-1 sm:px-2 lg:px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/home" className="flex items-center">
            <img
              className="m-2"
              src="/leetcode.svg"
              width="30"
              height="30"
              alt="Logo"
            />
            <p className="m-2 text-xl text-white font-bold">LeetCode Tracker</p>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-4">
            <Link to="/home" className={`${isActive("/home")} ${navItemClass}`}>
              Home
            </Link>
            <Link to="/topics" className={`${isActive("/topics")} ${navItemClass}`}>
              Topics
            </Link>
            <Link to="/companies" className={`${isActive("/companies")} ${navItemClass}`}>
              Companies
            </Link>
            <Link to="/contest" className={`${isActive("/profile")} ${navItemClass}`}>
              Contest
            </Link>
            {showAdmin && (
              <Link to="/admin" className={`${isActive("/admin")} ${navItemClass}`}>
                Admin
              </Link>
            )}
            {authStatus && (
              <button
                onClick={handleLogout}
                className="text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200"
              >
                Logout
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 hover:text-amber-400 focus:outline-none p-2"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Animated Mobile Navigation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-[#2d2d3f]">
            <Link to="/home" className={`${isActive("/home")} ${navItemClass} block`}>
              Home
            </Link>
            <Link to="/topics" className={`${isActive("/topics")} ${navItemClass} block`}>
              Topics
            </Link>
            <Link to="/companies" className={`${isActive("/companies")} ${navItemClass} block`}>
              Companies
            </Link>
            <Link to="/contest" className={`${isActive("/profile")} ${navItemClass} block`}>
              Contest
            </Link>
            {showAdmin && (
              <Link to="/admin" className={`${isActive("/admin")} ${navItemClass} block`}>
                Admin
              </Link>
            )}
            {authStatus && (
              <button
                onClick={handleLogout}
                className="w-full text-left text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}