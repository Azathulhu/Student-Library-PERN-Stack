import React, { useEffect, useState, useRef } from "react";
import api from "../api";
import BookCard from "../components/BookCard";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [books, setBooks] = useState([]);
  const [carouselBooks, setCarouselBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const limit = 12;
  const loc = useLocation();
  const query = new URLSearchParams(loc.search).get("q") || "";

  const [confirmRequest, setConfirmRequest] = useState(null);
  const [messageModal, setMessageModal] = useState(null);

  const carouselRef = useRef(null);

  const loadBooks = async (q = search || query, p = page) => {
    try {
      const { data } = await api.get(`/books/search?q=${encodeURIComponent(q)}&page=${p}&limit=${limit}`);
      setBooks(data.data);
      setTotal(data.total);

      // Random books for carousel
      const shuffled = [...data.data].sort(() => 0.5 - Math.random());
      setCarouselBooks(shuffled.slice(0, Math.min(8, shuffled.length))); // take up to 8 random books
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setPage(1);
    loadBooks(search || query, 1);
  }, [search, query]);

  useEffect(() => {
    loadBooks(search || query, page);
  }, [page]);

  const handleConfirmRequest = async (bookId) => {
    try {
      await api.post(`/books/request/${bookId}`);
      setConfirmRequest(null);
      setMessageModal({ type: "success", text: "Borrow request sent. Wait for admin approval." });
    } catch (err) {
      setConfirmRequest(null);
      setMessageModal({ type: "error", text: err?.response?.data?.error || "Failed to request." });
    }
  };

  const request = async (bookId) => {
    setConfirmRequest(bookId);
  };

  return (
    <div className="px-4 md:px-8 py-6 bg-gradient-to-b from-blue-50 to-blue-100 min-h-screen">
      {/* Title */}
      <h1 className="text-4xl font-extrabold mb-6 text-center text-blue-600 drop-shadow-lg">
        📚 Explore Books
      </h1>

      {/* Search Bar */}
      <div className="mb-8 max-w-xl mx-auto relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search books..."
          className="peer w-full px-4 py-3 rounded-full border-2 border-blue-200 bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition shadow-md"
        />
        <label className="absolute left-5 top-3 text-blue-300 text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-blue-300 peer-focus:top-[-0.5rem] peer-focus:text-blue-500 peer-focus:text-xs bg-blue-50 px-1 transition-all rounded">
          Search for a book...
        </label>
      </div>

      {/* Infinite Carousel */}
      {carouselBooks.length > 0 && (
        <div className="mb-10 overflow-hidden">
          <motion.div
            className="flex gap-6 cursor-grab"
            drag="x"
            dragConstraints={{ left: -carouselRef.current?.scrollWidth, right: 0 }}
            whileTap={{ cursor: "grabbing" }}
            ref={carouselRef}
          >
            {carouselBooks.concat(carouselBooks).map((b, idx) => (
              <motion.div
                key={`${b.id}-${idx}`}
                className="min-w-[180px] md:min-w-[200px] lg:min-w-[220px] flex-shrink-0 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 p-2"
              >
                <BookCard book={b} onRequest={request} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* No books */}
      {books.length === 0 ? (
        <div className="text-blue-300 text-center mt-12">No books found.</div>
      ) : (
        <>
          {/* Book Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((b) => (
              <div
                key={b.id}
                className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 p-2"
              >
                <BookCard book={b} onRequest={request} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-300 to-blue-400 text-white font-semibold shadow hover:from-blue-400 hover:to-blue-500 transition disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-blue-700 font-medium">Page {page} of {Math.ceil(total / limit)}</span>
            <button
              disabled={page >= Math.ceil(total / limit)}
              onClick={() => setPage(page + 1)}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-300 to-blue-400 text-white font-semibold shadow hover:from-blue-400 hover:to-blue-500 transition disabled:opacity-50"
            >
              Next
            </button>
          </div>

          {/* Message Modal */}
          {messageModal && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 px-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fadeIn border-2 border-blue-200">
                <h2 className="text-lg font-bold mb-4 text-blue-700">
                  {messageModal.type === "success" ? "✅ Success" : "❌ Error"}
                </h2>
                <p className="mb-6 text-blue-600">{messageModal.text}</p>
                <div className="flex justify-end">
                  <button
                    onClick={() => setMessageModal(null)}
                    className="px-4 py-2 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Borrow Modal */}
          {confirmRequest && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 px-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fadeIn border-2 border-blue-200">
                <h2 className="text-lg font-bold mb-4 text-blue-700">Confirm Borrow</h2>
                <p className="mb-6 text-blue-600">
                  Are you sure you want to send a borrow request for this book?
                </p>
                <div className="flex justify-end gap-3 flex-wrap">
                  <button
                    onClick={() => setConfirmRequest(null)}
                    className="px-4 py-2 border rounded-full border-blue-300 hover:bg-blue-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleConfirmRequest(confirmRequest)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-300 to-blue-400 text-white rounded-full hover:from-blue-400 hover:to-blue-500 transition"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
