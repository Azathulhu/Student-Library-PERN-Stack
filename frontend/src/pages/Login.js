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
    <div
      className="relative w-full min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url(/schooBg.jpg)" }}
    >
      {/* Overlay gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-transparent backdrop-blur-lg"
        animate={{ opacity: [0.6, 0.9, 0.6], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Form container */}
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm sm:max-w-md p-6 sm:p-10 bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col items-center"
      >
        {/* Logo */}
        <motion.div
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-4 shadow-lg"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
        >
          <img src="/schoolLogo.jpg" alt="Logo" className="w-full h-full rounded-full object-cover" />
        </motion.div>

        {/* Text */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 text-center tracking-wide">
          Welcome Back
        </h2>
        <p className="text-gray-200 mb-6 text-center text-sm sm:text-base">
          Sign in to your BCSHS Library account
        </p>

        {/* Inputs */}
        <motion.input
          whileFocus={{ scale: 1.03, boxShadow: "0 0 20px rgba(59,130,246,0.6)" }}
          placeholder="LRN"
          value={lrn}
          onChange={(e) => setLrn(e.target.value)}
          className="w-full mb-4 px-5 py-3 rounded-xl bg-white/70 text-gray-800 shadow focus:outline-none transition"
        />
        <motion.input
          whileFocus={{ scale: 1.03, boxShadow: "0 0 20px rgba(59,130,246,0.6)" }}
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-5 py-3 rounded-xl bg-white/70 text-gray-800 shadow focus:outline-none transition"
        />

        {/* Button */}
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(59,130,246,0.8)" }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow-lg transition"
        >
          Login
        </motion.button>

        {/* Sign up */}
        <div className="mt-6 text-gray-200 text-sm text-center">
          <span>Don't have an account? </span>
          <a href="#/signup" className="text-blue-300 font-bold hover:underline">
            Sign up
          </a>
        </div>
      </motion.form>
    </div>
  );
}
