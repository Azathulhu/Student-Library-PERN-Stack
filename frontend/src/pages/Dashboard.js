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
    <div className="px-4 md:px-8 py-6">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
        Explore Books
      </h1>

      {/* Unique Search Bar */}
      <div className="mb-6 relative max-w-xl mx-auto">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search books..."
          className="peer w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
        />
        <label
          className="absolute left-4 top-3 text-gray-400 text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-focus:top-[-0.5rem] peer-focus:text-blue-500 peer-focus:text-xs transition-all bg-white px-1"
        >
          Search for a book...
        </label>
      </div>

      {books.length === 0 ? (
        <div className="text-gray-500 text-center mt-12">No books found.</div>
      ) : (
        <>
          {/* Interactive Book Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((b) => (
              <div
                key={b.id}
                className="transform transition duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1"
              >
                <BookCard book={b} onRequest={request} />
              </div>
            ))}
          </div>

          {/* Pagination + Convenience */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-gray-700 font-medium">Page {page} of {Math.ceil(total / limit)}</span>
            <button
              disabled={page >= Math.ceil(total / limit)}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50"
            >
              Next
            </button>
          </div>

          {/* Modals */}
          {messageModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 px-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-fadeIn">
                <h2 className="text-lg font-bold mb-4">
                  {messageModal.type === "success" ? "Success" : "Error"}
                </h2>
                <p className="mb-6">{messageModal.text}</p>
                <div className="flex justify-end">
                  <button
                    onClick={() => setMessageModal(null)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {confirmRequest && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 px-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-fadeIn">
                <h2 className="text-lg font-bold mb-4">Confirm Borrow</h2>
                <p className="mb-6">
                  Are you sure you want to send a borrow request for this book?
                </p>
                <div className="flex justify-end gap-3 flex-wrap">
                  <button
                    onClick={() => setConfirmRequest(null)}
                    className="px-4 py-2 border rounded hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleConfirmRequest(confirmRequest)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
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
