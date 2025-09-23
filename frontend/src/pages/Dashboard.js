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

  const [confirmRequest, setConfirmRequest] = React.useState(null);
  const [messageModal, setMessageModal] = React.useState(null); 

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
      setConfirmRequest(null); // close the confirm modal
      setMessageModal({ type: "success", text: "Borrow request sent. Wait for admin approval." });
    } catch (err) {
      setConfirmRequest(null); // close confirm modal
      setMessageModal({ type: "error", text: err?.response?.data?.error || "Failed to request." });
    }
  };

  const request = async (bookId) => {
    setConfirmRequest(bookId);
  };

  return (
    <div className="px-8 py-6">
      <h1 className="text-2xl font-bold mb-6">Book Lists</h1>

      {books.length === 0 ? (
        <div className="text-gray-500">No books found.</div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-6">
            {books.map((b) => (
              <BookCard key={b.id} book={b} onRequest={request} />
            ))}
          </div>
          <div className="flex justify-center gap-4 mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 transition"
            >
              Prev
            </button>
            <span>Page {page} of {Math.ceil(total / limit)}</span>
            <button
              disabled={page >= Math.ceil(total / limit)}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 transition"
            >
              Next
            </button>
            {/* Message Modal */}
            {messageModal && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                <div className={`bg-white rounded-xl p-6 w-96 shadow-lg`}>
                  <h2 className="text-lg font-bold mb-4">
                    {messageModal.type === "success" ? "Success" : "Error"}
                  </h2>
                  <p className="mb-6">{messageModal.text}</p>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setMessageModal(null)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>     
            {/* Request Confirmation Modal */}
            {confirmRequest && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
                  <h2 className="text-lg font-bold mb-4">Confirm Borrow</h2>
                  <p className="mb-6">
                    Are you sure you want to send a borrow request for this book?
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setConfirmRequest(null)}
                      className="px-4 py-2 border rounded hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleConfirmRequest(confirmRequest)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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