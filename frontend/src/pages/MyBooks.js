import React, { useEffect, useState } from "react";
import api from "../api";
import BookCard from "../components/BookCard";

export default function MyBooks() {
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");

  // search + pagination states for each tab
  const [queries, setQueries] = useState({
    pending: "",
    borrowed: "",
    returned: "",
  });
  const [pages, setPages] = useState({
    pending: 1,
    borrowed: 1,
    returned: 1,
  });
  const limit = 6;

  const fetchBooks = async () => {
    try {
      const { data } = await api.get("/books/my");
      // Ensure each borrow record has a "book" object
      // If backend only sends book_id, fetch book details
      const enriched = await Promise.all(
        data.map(async (item) => {
          if (item.book) return item; // already has details
          try {
            const res = await api.get(`/books/${item.book_id}`);
            return { ...item, book: res.data };
          } catch {
            return item;
          }
        })
      );
      setItems(enriched);
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
        i.book?.author?.toLowerCase().includes(query)
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
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-700 drop-shadow">
          📖 My Books
        </h1>

        {/* Tabs */}
        <div className="flex justify-center space-x-2 flex-wrap mb-6">
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
            className="w-full p-3 border rounded-full shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Grid of BookCards */}
        {shownBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {shownBooks.map((i) => (
              <div key={i.borrow_id} className="relative">
                <BookCard book={i.book} />

                {/* Action buttons */}
                {activeTab === "pending" && (
                  <button
                    onClick={() => cancelPending(i.borrow_id)}
                    className="absolute top-2 right-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-full text-sm shadow"
                  >
                    Cancel
                  </button>
                )}
                {activeTab === "borrowed" && (
                  <button
                    onClick={() => doReturn(i.borrow_id)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-sm shadow"
                  >
                    Return
                  </button>
                )}
                {activeTab === "returned" && (
                  <button
                    onClick={() => deleteReturned(i.borrow_id)}
                    className="absolute top-2 right-2 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-full text-sm shadow"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center">
            No {activeTab} books
          </div>
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
