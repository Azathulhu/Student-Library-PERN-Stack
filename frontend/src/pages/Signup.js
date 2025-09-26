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

  const inputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, type: "spring", stiffness: 80 },
    }),
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center min-h-screen w-full overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: "url(/schooBg.jpg)" }}
    >
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-transparent blur-3xl"
        animate={{ opacity: [0.6, 0.9, 0.6], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-[90%] sm:w-[450px] md:w-[500px] bg-white/10 rounded-3xl shadow-2xl px-6 sm:px-10 py-10 sm:py-12 flex flex-col items-center z-10 backdrop-blur-xl border border-white/20"
      >
        {/* Logo */}
        <motion.div
          className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-6 shadow-xl"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, type: "spring", stiffness: 100 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <img src="/schoolLogo.jpg" alt="Logo" className="w-full h-full rounded-full" />
        </motion.div>

        <h2 className="text-3xl font-extrabold text-white mb-1 tracking-wide text-center">
          Create Account
        </h2>
        <p className="text-gray-200 mb-8 text-center">
          Register your BCSHS Library account
        </p>

        {/* Animated inputs with floating labels */}
        {[
          { label: "Full Name", value: name, setter: setName },
          { label: "LRN", value: lrn, setter: setLrn },
          { label: "Email", value: email, setter: setEmail, type: "email" },
          { label: "Password", value: password, setter: setPassword, type: "password" },
          { label: "Grade Level / Strand", value: gradeLevelStrand, setter: setGradeLevelStrand },
          { label: "Contact Number", value: contactNumber, setter: setContactNumber },
        ].map((input, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={inputVariants}
            initial="hidden"
            animate="visible"
            className="w-full relative mb-5"
          >
            <motion.input
              type={input.type || "text"}
              value={input.value}
              onChange={(e) => input.setter(e.target.value)}
              placeholder=" "
              className="peer rounded-xl px-5 pt-5 pb-3 w-full text-gray-900 bg-white/80 border-none shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              whileFocus={{ scale: 1.03, boxShadow: "0 0 20px rgba(59,130,246,0.6)" }}
            />
            <label className="absolute left-5 top-3 text-gray-500 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-blue-500 peer-focus:text-sm pointer-events-none">
              {input.label}
            </label>
          </motion.div>
        ))}

        {/* Sign Up Button */}
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(59,130,246,0.8)" }}
          whileTap={{ scale: 0.97 }}
          className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 mt-2 shadow-lg transition w-full"
        >
          Sign Up
        </motion.button>

        <div className="mt-6 text-gray-200 text-sm text-center">
          <span>Already have an account? </span>
          <a href="#/login" className="text-blue-300 font-bold hover:underline">
            Login
          </a>
        </div>
      </motion.form>
    </div>
  );
}
