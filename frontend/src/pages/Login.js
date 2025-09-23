import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login({ setUser }) {
  const [lrn, setLrn] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/login", { lrn, password });
      localStorage.setItem("token", data.token);
      nav("/dashboard");
      window.location.reload();
    } catch (err) {
      alert(err?.response?.data?.error || "Login failed");
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center min-h-screen w-full overflow-hidden"
      style={{
        backgroundImage:
          "url(/schooBg.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Floating glow background effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-transparent blur-3xl"
        animate={{ opacity: [0.6, 0.9, 0.6], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Login card */}
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full max-w-md bg-white/20 rounded-2xl shadow-2xl 
                   px-8 py-10 flex flex-col items-center z-10 backdrop-blur-xl border border-white/30"
      >
        <motion.div
          className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-4 shadow-lg"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
        >
          <img
            src="/schoolLogo.jpg"
            alt="Logo"
            className="w-full h-full rounded-full"
          />
        </motion.div>

        <h2 className="text-3xl font-extrabold text-white mb-2 tracking-wide">
          Welcome Back
        </h2>
        <p className="text-gray-200 mb-6 text-center">
          Sign in to your BCSHS Library account
        </p>

        <motion.input
          whileFocus={{ scale: 1.03, boxShadow: "0 0 20px rgba(59,130,246,0.6)" }}
          placeholder="LRN"
          value={lrn}
          onChange={(e) => setLrn(e.target.value)}
          className="rounded-xl px-5 py-3 bg-white/70 text-gray-800 border-none 
                     shadow focus:outline-none transition w-full mb-4"
        />
        <motion.input
          whileFocus={{ scale: 1.03, boxShadow: "0 0 20px rgba(59,130,246,0.6)" }}
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl px-5 py-3 bg-white/70 text-gray-800 border-none 
                     shadow focus:outline-none transition w-full mb-4"
        />
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(59,130,246,0.8)" }}
          whileTap={{ scale: 0.97 }}
          className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 mt-2 
                     shadow-lg transition w-full"
        >
          Login
        </motion.button>

        <div className="mt-6 text-gray-200 text-sm text-center">
          <span>Don't have an account? </span>
          <a href="/signup" className="text-blue-300 font-bold hover:underline">
            Sign up
          </a>
        </div>
      </motion.form>
    </div>
  );
}