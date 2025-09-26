import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login({ onLogin }) {
  const [lrn, setLrn] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/login", { lrn, password });
      if (onLogin) onLogin(data.token, data.user);
      nav("/dashboard");
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err?.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center">
      {/* Fully responsive background */}
      <div className="absolute inset-0">
        <img
          src="/schoolBg.jpg"
          alt="Background"
          className="w-full h-full object-cover object-center"
        />
        {/* Optional overlay for readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Centered login form */}
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm sm:max-w-md md:max-w-lg bg-white/20 backdrop-blur-xl rounded-2xl p-6 sm:p-10 flex flex-col items-center"
      >
        {/* Logo */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 rounded-full overflow-hidden shadow-lg">
          <img
            src="/schoolLogo.jpg"
            alt="Logo"
            className="w-full h-full object-cover"
          />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 text-center">
          Welcome Back
        </h2>
        <p className="text-gray-200 mb-6 text-center text-sm sm:text-base">
          Sign in to your BCSHS Library account
        </p>

        {/* Inputs */}
        <input
          placeholder="LRN"
          value={lrn}
          onChange={(e) => setLrn(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded-xl bg-white/70 text-gray-800 border-none shadow focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base transition"
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded-xl bg-white/70 text-gray-800 border-none shadow focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base transition"
        />

        {/* Button */}
        <button
          type="submit"
          className="w-full py-2 sm:py-3 mt-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow-lg hover:scale-105 transform transition"
        >
          Login
        </button>

        <div className="mt-6 text-gray-200 text-xs sm:text-sm text-center">
          <span>Don't have an account? </span>
          <a href="#/signup" className="text-blue-300 font-bold hover:underline">
            Sign up
          </a>
        </div>
      </motion.form>
    </div>
  );
}
