import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    window.location.reload();
  };

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/users/notifications/search", {
        params: { q: "", page: 1, limit: 1 },
      });
      const unread = data.data.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (location.pathname === "/notifications" && unreadCount > 0) {
      const markRead = async () => {
        try {
          await api.patch("/users/notifications/mark-read");
          setUnreadCount(0);
        } catch (err) {
          console.error(err);
        }
      };
      markRead();
    }
  }, [location.pathname, unreadCount]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      navigate(`/dashboard?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-bubbly rounded-b-bubbly px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-12 h-12 rounded-full bg-bubbly-blue flex items-center justify-center shadow-bubbly overflow-hidden">
          <img
            src="/schoolLogo.jpg"
            alt="Logo"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <span className="text-bubbly-deep font-extrabold text-2xl tracking-wide select-none">
          BCSHS Library
        </span>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex flex-1 mx-10 items-center gap-4">
        {user && (
          <>
            <input
              type="text"
              placeholder="Looking for your favorite Academic Book?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="flex-1 px-4 py-2 rounded-bubbly bg-bubbly-light/60 text-bubbly-dark focus:outline-none focus:ring-2 focus:ring-bubbly-blue transition"
            />

            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-bubbly bg-bubbly-light text-bubbly-dark hover:bg-bubbly-blue hover:text-white transition"
            >
              Home
            </Link>
            <Link
              to="/mybooks"
              className="px-4 py-2 rounded-bubbly bg-bubbly-light text-bubbly-dark hover:bg-bubbly-blue hover:text-white transition"
            >
              My Books
            </Link>
            <div className="relative">
              <Link
                to="/notifications"
                className="px-4 py-2 rounded-bubbly bg-bubbly-light text-bubbly-dark hover:bg-bubbly-blue hover:text-white transition"
              >
                Mail
              </Link>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 transform translate-x-2 -translate-y-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </div>
            <Link
              to="/profile"
              className="px-4 py-2 rounded-bubbly bg-bubbly-light text-bubbly-dark hover:bg-bubbly-blue hover:text-white transition"
            >
              Profile
            </Link>
            {(user.role === "admin" || user.role === "librarian") && (
              <Link
                to="/admin"
                className="px-4 py-2 rounded-bubbly bg-bubbly-blue text-white hover:bg-bubbly-deep transition"
              >
                Admin
              </Link>
            )}
            <button
              onClick={logout}
              className="px-4 py-2 rounded-bubbly bg-red-400 text-white shadow hover:bg-red-500 transition"
            >
              Log Out
            </button>
          </>
        )}
      </div>

      {/* Mobile Hamburger */}
      <div className="md:hidden flex items-center gap-2">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex flex-col justify-between w-6 h-5"
        >
          <span
            className={`block h-0.5 w-full bg-bubbly-dark transform transition duration-300 ${
              menuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          ></span>
          <span
            className={`block h-0.5 w-full bg-bubbly-dark transition duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          ></span>
          <span
            className={`block h-0.5 w-full bg-bubbly-dark transform transition duration-300 ${
              menuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          ></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-md shadow-bubbly flex flex-col items-center gap-4 py-4 z-40 md:hidden"
          >
            <input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-11/12 px-4 py-2 rounded-bubbly bg-bubbly-light/60 text-bubbly-dark focus:outline-none focus:ring-2 focus:ring-bubbly-blue transition"
            />
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="px-4 py-2 rounded-bubbly hover:bg-bubbly-blue hover:text-white transition">
                  Home
                </Link>
                <Link to="/mybooks" onClick={() => setMenuOpen(false)} className="px-4 py-2 rounded-bubbly hover:bg-bubbly-blue hover:text-white transition">
                  My Books
                </Link>
                <Link to="/notifications" onClick={() => setMenuOpen(false)} className="px-4 py-2 rounded-bubbly hover:bg-bubbly-blue hover:text-white transition">
                  Mail {unreadCount > 0 && <span className="ml-1 text-red-500 font-bold">{unreadCount}</span>}
                </Link>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="px-4 py-2 rounded-bubbly hover:bg-bubbly-blue hover:text-white transition">
                  Profile
                </Link>
                {(user.role === "admin" || user.role === "librarian") && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className="px-4 py-2 rounded-bubbly bg-bubbly-blue text-white hover:bg-bubbly-deep transition">
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="px-4 py-2 rounded-bubbly bg-red-400 text-white shadow hover:bg-red-500 transition"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="px-4 py-2 rounded-bubbly bg-bubbly-blue text-white hover:bg-bubbly-deep transition">
                  Login
                </Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)} className="px-4 py-2 rounded-bubbly bg-bubbly-light text-bubbly-dark hover:bg-bubbly-blue hover:text-white transition">
                  Sign Up
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
