import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Signup({ onLogin }) {
  const [name, setName] = useState("");
  const [lrn, setLrn] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gradeLevelStrand, setGradeLevelStrand] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/register", {
        name,
        lrn,
        email,
        password,
        grade_level_strand: gradeLevelStrand,
        contact_number: contactNumber,
      });
      if (onLogin) onLogin(data.token, data.user);
      nav("/dashboard");
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err?.response?.data?.error || "Signup failed");
    }
  };

  const inputFields = [
    { placeholder: "Full Name", value: name, set: setName, type: "text" },
    { placeholder: "LRN", value: lrn, set: setLrn, type: "text" },
    { placeholder: "Email", value: email, set: setEmail, type: "email" },
    { placeholder: "Password", value: password, set: setPassword, type: "password" },
    { placeholder: "Grade Level / Strand", value: gradeLevelStrand, set: setGradeLevelStrand, type: "text" },
    { placeholder: "Contact Number", value: contactNumber, set: setContactNumber, type: "text" },
  ];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center min-h-screen w-full overflow-hidden"
      style={{
        backgroundImage: "url(/schooBg.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Animated Background Overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-transparent blur-3xl"
        animate={{ opacity: [0.6, 0.9, 0.6], scale: [1, 1.05, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Form */}
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-[90%] max-w-md h-[90vh] max-h-[700px] bg-white/20 rounded-3xl shadow-2xl px-6 py-8 flex flex-col items-center z-10 backdrop-blur-xl border border-white/30"
      >
        {/* Logo */}
        <motion.div
          className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-4 shadow-lg"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
        >
          <img
            src="/schoolLogo.jpg"
            alt="Logo"
            className="w-full h-full rounded-full"
          />
        </motion.div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2 tracking-wide text-center">
          Create Account
        </h2>
        <p className="text-gray-200 mb-4 text-center text-sm md:text-base">
          Register your BCSHS Library account
        </p>

        {/* Scrollable Inputs Container */}
        <div className="w-full flex-1 overflow-y-auto space-y-4 pr-1">
          {inputFields.map((field, idx) => (
            <motion.div key={idx} className="w-full relative">
              <motion.input
                type={field.type}
                value={field.value}
                onChange={(e) => field.set(e.target.value)}
                placeholder=" "
                whileFocus={{ scale: 1.03, boxShadow: "0 0 20px rgba(59,130,246,0.6)" }}
                className="rounded-xl px-5 pt-5 pb-2 bg-white/70 text-gray-800 border-none shadow focus:outline-none w-full transition"
              />
              <label className="absolute left-5 top-2 text-gray-500 text-sm pointer-events-none transition-all duration-200 ease-in-out">
                {field.placeholder}
              </label>
            </motion.div>
          ))}
        </div>

        {/* Signup Button */}
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(59,130,246,0.8)" }}
          whileTap={{ scale: 0.97 }}
          className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 mt-4 shadow-lg transition w-full"
        >
          Sign Up
        </motion.button>

        {/* Login Link */}
        <div className="mt-4 text-gray-200 text-sm text-center">
          <span>Already have an account? </span>
          <a href="#/login" className="text-blue-300 font-bold hover:underline">
            Login
          </a>
        </div>
      </motion.form>
    </div>
  );
}
