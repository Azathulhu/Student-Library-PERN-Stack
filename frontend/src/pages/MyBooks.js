import React, { useEffect, useState } from "react";
import api from "../api";
import BookCard from "../components/BookCard";

export default function MyBooks() {
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");

  // search + pagination states for each tab
  const [queries, setQueries] = useState({ pending: "", borrowed: "", returned: "" });
  const [pages, setPages] = useState({ pending: 1, borrowed: 1, returned: 1 });
  const limit = 6;

  // Fetch my borrowed records + expand to full books
  const fetchBooks = async () => {
    try {
      const { data } = await api.get("/books/my"); // returns borrow records
      // expand into full books
      const expanded = await Promise.all(
        data.map(async (rec) => {
          try {
            const res = await api.get(`/books/${rec.book_id}`);
            return {
              ...rec,
              book: res.data, // full book object with description, photo_url, etc.
            };
          } catch (err) {
            console.error("Failed to fetch book details", err);
            return rec; // fallback
          }
        })
      );
      setItems(expanded);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Actions
  const doReturn = async (borrowId) => {
    if (!window.confirm("Return this book?")) return;
    try {
      await api.post(`/books/return/${borrowId}`);
      alert("Returned.");
      fetchBooks();
    } catch (err) {
      alert(err?.response?.data?.error || "Failed");
    }
  };

  const cancelPending = async (borrowId) => {
    if (!window.confirm("Cancel this pending request?")) return;
    try {
      await api.delete(`/books/cancel-pending/${borrowId}`);
      alert("Pending request canceled.");
      fetchBooks();
    } catch (err) {
      alert(err?.response?.data?.error || "Failed");
    }
  };

  const deleteReturned = async (borrowId) => {
    if (!window.confirm("Delete this returned record?")) return;
    try {
      await api.delete(`/books/delete-returned/${borrowId}`);
      alert("Deleted returned record.");
      fetchBooks();
    } catch (err) {
      alert(err?.response?.data?.error || "Failed");
    }
  };

  // Filter + paginate
  const filterBooks = (status) => {
    const query = queries[status].toLowerCase();
    const all = items.filter((i) => i.status === status);
    const filtered = all.filter(
      (i) =>
        i.book?.title?.toLowerCase().includes(query) ||
        (i.book?.author && i.book.author.toLowerCase().includes(query))
    );

    const page = pages[status];
    const start = (page - 1) * limit;
    const end = start + limit;
    return { data: filtered.slice(start, end), total: filtered.length };
  };

  const tabs = [
    { key: "pending", label: "Pending Books" },
    { key: "borrowed", label: "Borrowed Books" },
    { key: "returned", label: "Returned Books" },
  ];

  const { data: shownBooks, total } = filterBooks(activeTab);
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="w-full max-w-6xl space-y-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600 drop-shadow-md">
          📖 My Books
        </h1>

        {/* Tabs */}
        <div className="flex justify-center flex-wrap gap-3 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                activeTab === tab.key
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder={`Search ${activeTab} books...`}
            value={queries[activeTab]}
            onChange={(e) =>
              setQueries({ ...queries, [activeTab]: e.target.value })
            }
            className="w-full p-2 border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Book Grid */}
        {shownBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {shownBooks.map((i) => (
              <div
                key={i.borrow_id}
                className="relative transform transition hover:scale-105"
              >
                <BookCard book={i.book} />
                {/* Action buttons */}
                <div className="absolute top-2 right-2">
                  {activeTab === "pending" && (
                    <button
                      onClick={() => cancelPending(i.borrow_id)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-bold"
                    >
                      Cancel
                    </button>
                  )}
                  {activeTab === "borrowed" && (
                    <button
                      onClick={() => doReturn(i.borrow_id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold"
                    >
                      Return
                    </button>
                  )}
                  {activeTab === "returned" && (
                    <button
                      onClick={() => deleteReturned(i.borrow_id)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-bold"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center">No {activeTab} books</div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2 mt-6">
            <button
              disabled={pages[activeTab] === 1}
              onClick={() =>
                setPages({ ...pages, [activeTab]: pages[activeTab] - 1 })
              }
              className="px-3 py-1 bg-gray-200 rounded-full disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-3 py-1">
              Page {pages[activeTab]} of {totalPages}
            </span>
            <button
              disabled={pages[activeTab] === totalPages}
              onClick={() =>
                setPages({ ...pages, [activeTab]: pages[activeTab] + 1 })
              }
              className="px-3 py-1 bg-gray-200 rounded-full disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
