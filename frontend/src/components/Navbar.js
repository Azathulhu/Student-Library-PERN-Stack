import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api"; // <-- need this to fetch unread count

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    window.location.reload();
  };

  // Fetch unread notifications count
  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/users/notifications/search", {
        params: { q: "", page: 1, limit: 1 }, // we only need count
      });
      const unread = data.data.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error(err);
    }
  };

  // Mark all as read when on /notifications
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

  // Initial fetch
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000); // optional: poll every 15s
    return () => clearInterval(interval);
  }, [user]);

  return (
    <nav className="bg-white/80 shadow-bubbly rounded-b-bubbly px-8 py-4 flex items-center justify-between z-50 sticky top-0 backdrop-blur-md">
      {/* Left - Logo */}
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

      {/* Center - Search */}
      {user && (
        <div className="flex-1 mx-10 max-w-lg">
          <input
            placeholder="Looking for your favorite Academic Book?"
            className="w-full rounded-bubbly px-5 py-2 text-bubbly-dark bg-bubbly-light/60 border-none shadow-bubbly focus:outline-none focus:ring-2 focus:ring-bubbly-blue transition"
            onKeyDown={(e) => {
              if (e.key === "Enter")
                navigate(`/dashboard?q=${encodeURIComponent(e.target.value)}`);
            }}
          />
        </div>
      )}

      {/* Right - Menu */}
      <div className="flex items-center space-x-4 text-base font-bold">
        {user && (
          <>
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
          </>
        )}

        {user &&
          (user.role === "admin" || user.role === "librarian") && (
            <Link
              to="/admin"
              className="px-4 py-2 rounded-bubbly bg-bubbly-blue text-white hover:bg-bubbly-deep transition"
            >
              Admin
            </Link>
          )}

        {user ? (
          <button
            onClick={logout}
            className="px-4 py-2 rounded-bubbly bg-red-400 text-white shadow hover:bg-red-500 transition"
          >
            Log Out
          </button>
        ) : (
          <>
            <Link
              to="/login"
              className="px-4 py-2 rounded-bubbly bg-bubbly-blue text-white hover:bg-bubbly-deep transition"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-bubbly bg-bubbly-light text-bubbly-dark hover:bg-bubbly-blue hover:text-white transition"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}