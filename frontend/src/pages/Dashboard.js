import React, { useEffect, useState } from "react";
import api from "../api";
import BookCard from "../components/BookCard";
import { useLocation } from "react-router-dom";

export default function Dashboard() {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const limit = 12;
  const loc = useLocation();
  const query = new URLSearchParams(loc.search).get("q") || "";

  const [confirmRequest, setConfirmRequest] = useState(null);
  const [messageModal, setMessageModal] = useState(null);

  const loadBooks = async (q = search || query, p = page) => {
    try {
      const { data } = await api.get(`/books/search?q=${encodeURIComponent(q)}&page=${p}&limit=${limit}`);
      setBooks(data.data);
      setTotal(data.total);
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
    <div className="px-4 md:px-8 py-6 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 min-h-screen">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 animate-gradient-x">
        Discover Your Next Read
      </h1>

      {/* Interactive Search Bar */}
      <div className="mb-8 flex justify-center">
        <div className="relative w-full max-w-xl">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search books..."
            className="peer w-full px-5 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-800 shadow-lg transition-all duration-300 hover:scale-105"
          />
          <label className="absolute left-5 top-3 text-gray-400 text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-focus:top-[-0.6rem] peer-focus:text-blue-500 peer-focus:text-xs transition-all bg-white px-1">
            Search for a book...
          </label>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="text-gray-500 text-center mt-12 text-lg animate-pulse">
          No books found 😔
        </div>
      ) : (
        <>
          {/* Interactive Book Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((b) => (
              <div
                key={b.id}
                className="group perspective cursor-pointer"
              >
                <div className="relative w-full h-full transition-transform duration-500 transform-style-preserve-3d group-hover:rotate-y-180">
                  {/* Front */}
                  <BookCard book={b} onRequest={request} />
                  {/* Back */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-300 text-white rounded-xl shadow-xl p-4 flex flex-col justify-center items-center rotate-y-180 backface-hidden">
                    <h3 className="font-bold text-lg mb-2">{b.title}</h3>
                    <p className="text-sm mb-4">{b.description || "No description available"}</p>
                    <p className="text-xs">Available: {b.available_copies}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 text-white font-semibold hover:scale-110 transition-transform disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-gray-700 font-medium">Page {page} of {Math.ceil(total / limit)}</span>
            <button
              disabled={page >= Math.ceil(total / limit)}
              onClick={() => setPage(page + 1)}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 text-white font-semibold hover:scale-110 transition-transform disabled:opacity-50"
            >
              Next
            </button>
          </div>

          {/* Modals */}
          {messageModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
              <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-fadeIn">
                <h2 className="text-xl font-bold mb-4">{messageModal.type === "success" ? "Success" : "Error"}</h2>
                <p className="mb-6">{messageModal.text}</p>
                <div className="flex justify-end">
                  <button
                    onClick={() => setMessageModal(null)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-400 to-pink-500 text-white rounded-full hover:scale-105 transition-transform"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {confirmRequest && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
              <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-fadeIn">
                <h2 className="text-xl font-bold mb-4">Confirm Borrow</h2>
                <p className="mb-6">
                  Are you sure you want to send a borrow request for this book?
                </p>
                <div className="flex justify-end gap-3 flex-wrap">
                  <button
                    onClick={() => setConfirmRequest(null)}
                    className="px-4 py-2 border rounded-full hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleConfirmRequest(confirmRequest)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-400 to-pink-500 text-white rounded-full hover:scale-105 transition-transform"
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
