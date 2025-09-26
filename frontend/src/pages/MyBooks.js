import React, { useEffect, useState } from "react";
import api from "../api";
import BookCard from "../components/BookCard";

export default function MyBooks() {
  const [activeTab, setActiveTab] = useState("pending");

  // Pending
  const [pending, setPending] = useState([]);
  const [pendingSearch, setPendingSearch] = useState("");
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingTotal, setPendingTotal] = useState(0);

  // Borrowed
  const [borrowed, setBorrowed] = useState([]);
  const [borrowedSearch, setBorrowedSearch] = useState("");
  const [borrowedPage, setBorrowedPage] = useState(1);
  const [borrowedTotal, setBorrowedTotal] = useState(0);

  // Returned
  const [returned, setReturned] = useState([]);
  const [returnedSearch, setReturnedSearch] = useState("");
  const [returnedPage, setReturnedPage] = useState(1);
  const [returnedTotal, setReturnedTotal] = useState(0);

  const limit = 8;

  // Fetchers
  const fetchPending = async () => {
    try {
      const { data } = await api.get(
        `/mybooks/pending?q=${encodeURIComponent(pendingSearch)}&page=${pendingPage}&limit=${limit}`
      );
      setPending(data.data);
      setPendingTotal(data.total);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBorrowed = async () => {
    try {
      const { data } = await api.get(
        `/mybooks/borrowed?q=${encodeURIComponent(borrowedSearch)}&page=${borrowedPage}&limit=${limit}`
      );
      setBorrowed(data.data);
      setBorrowedTotal(data.total);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReturned = async () => {
    try {
      const { data } = await api.get(
        `/mybooks/returned?q=${encodeURIComponent(returnedSearch)}&page=${returnedPage}&limit=${limit}`
      );
      setReturned(data.data);
      setReturnedTotal(data.total);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPending();
  }, [pendingSearch, pendingPage]);

  useEffect(() => {
    fetchBorrowed();
  }, [borrowedSearch, borrowedPage]);

  useEffect(() => {
    fetchReturned();
  }, [returnedSearch, returnedPage]);

  // Helper UI
  const renderBooks = (books, search, setSearch, page, setPage, total) => (
    <div>
      {/* Search Bar */}
      <div className="mb-6 max-w-md mx-auto relative">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search books..."
          className="peer w-full px-4 py-3 rounded-full border-2 border-blue-200 bg-blue-50 
                     focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-400 
                     transition shadow-md"
        />
        <label className="absolute left-5 top-3 text-blue-300 text-sm 
                          peer-placeholder-shown:top-3 peer-placeholder-shown:text-blue-300 
                          peer-focus:top-[-0.5rem] peer-focus:text-blue-500 peer-focus:text-xs 
                          bg-blue-50 px-1 transition-all rounded">
          Search for a book...
        </label>
      </div>

      {books.length === 0 ? (
        <div className="text-blue-300 text-center mt-12">No books found.</div>
      ) : (
        <>
          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((b) => (
              <div
                key={b.id}
                className="transform transition-all duration-300 hover:scale-105 
                           hover:shadow-xl hover:-translate-y-1 rounded-xl 
                           bg-gradient-to-br from-blue-100 to-blue-200 p-2"
              >
                <BookCard book={b} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-300 to-blue-400 
                         text-white font-semibold shadow hover:from-blue-400 hover:to-blue-500 
                         transition disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-blue-700 font-medium">
              Page {page} of {Math.ceil(total / limit) || 1}
            </span>
            <button
              disabled={page >= Math.ceil(total / limit)}
              onClick={() => setPage(page + 1)}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-300 to-blue-400 
                         text-white font-semibold shadow hover:from-blue-400 hover:to-blue-500 
                         transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="px-4 md:px-8 py-6 bg-gradient-to-b from-blue-50 to-blue-100 min-h-screen">
      {/* Title */}
      <h1 className="text-4xl font-extrabold mb-6 text-center text-blue-600 drop-shadow-lg">
        📖 My Books
      </h1>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-8">
        {["pending", "borrowed", "returned"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full font-semibold transition shadow 
              ${activeTab === tab
                ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white"
                : "bg-blue-100 text-blue-600 hover:bg-blue-200"
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "pending" &&
        renderBooks(pending, pendingSearch, setPendingSearch, pendingPage, setPendingPage, pendingTotal)}
      {activeTab === "borrowed" &&
        renderBooks(borrowed, borrowedSearch, setBorrowedSearch, borrowedPage, setBorrowedPage, borrowedTotal)}
      {activeTab === "returned" &&
        renderBooks(returned, returnedSearch, setReturnedSearch, returnedPage, setReturnedPage, returnedTotal)}
    </div>
  );
}
