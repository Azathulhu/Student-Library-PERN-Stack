import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import MyBooks from "./pages/MyBooks";
import Navbar from "./components/Navbar";
import api from "./api";
import "./index.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      (async () => {
        try {
          const { data } = await api.get("/users/me");
          setUser(data);
        } catch (err) {
          console.error(err);
          localStorage.removeItem("token");
          setUser(null);
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bubbly-bg">
        <div className="text-bubbly-deep text-xl font-bold animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen font-nunito bg-bubbly-bg">
      <div className="bubbly-bg"></div>
      {/* Show navbar only when logged in */}
      {user && <Navbar user={user} />}
      <div className="container mx-auto px-4 py-8 z-10 relative">
        <Routes>
          {/* Auth routes */}
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/dashboard" /> : <Signup />}
          />

          {/* User routes */}
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />}
          />
          <Route
            path="/notifications"
            element={user ? <Notifications /> : <Navigate to="/login" />}
          />
          <Route
            path="/mybooks"
            element={user ? <MyBooks /> : <Navigate to="/login" />}
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              user && (user.role === "admin" || user.role === "librarian") ? (
                <Admin />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />

          {/* Default route */}
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;