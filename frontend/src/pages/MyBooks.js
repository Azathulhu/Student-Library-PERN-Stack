import React, { useEffect, useState } from "react";
import api from "../api";
import BookCard from "./BookCard";

export default function MyBooks() {
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");

  const [queries, setQueries] = useState({ pending: "", borrowed: "", returned: "" });
  const [pages, setPages] = useState({ pending: 1, borrowed: 1, returned: 1 });
  const limit = 6;

  const fetchBooks = async () => {
    try {
      const { data } = await api.get("/books/my");
      setItems(data);
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
      fetchBooks();
    } catch (err) {
      alert(err?.response?.data?.error || "Failed");
    }
  };

  const cancelPending = async (borrowId) => {
    if (!window.confirm("Cancel this pending request?")) return;
    try {
      await api.delete(`/books/cancel-pending/${borrowId}`);
      fetchBooks();
    } catch (err) {
      alert(err?.response?.data?.error || "Failed");
    }
  };

  const deleteReturned = async (borrowId) => {
    if (!window.confirm("Delete this returned record?")) return;
    try {
      await api.delete(`/books/delete-returned/${borrowId}`);
      fetchBooks();
    } catch (err) {
      alert(err?.response?.data?.error || "Failed");
    }
  };

  // Filtering + pagination
  const filterBooks = (status) => {
    const query = queries[status].toLowerCase();
    const all = items.filter((i) => i.status === status);
    const filtered = all.filter(
      (i) =>
        i.title.toLowerCase().includes(query) ||
        (i.author && i.author.toLowerCase().includes(query))
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
    <div className="flex flex-col items-center min-h-screen p-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-6xl space-y-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-900">
          My Books
        </h1>

        {/* Tabs */}
        <div className="flex justify-center space-x-4 mb-6 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl font-semibold transition ${
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
            className="w-full p-2 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Book cards grid */}
        {shownBooks.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {shownBooks.map((i) => (
              <BookCard
                key={i.borrow_id}
                book={{
                  id: i.book_id,
                  title: i.title,
                  author: i.author,
                  photo_url: i.photo_url || null,
                  description: i.description || "",
                  available_copies: i.available_copies || 0,
                }}
                // Override actions depending on activeTab
                onRequest={
                  activeTab === "pending"
                    ? () => cancelPending(i.borrow_id)
                    : undefined
                }
                onEdit={
                  activeTab === "borrowed"
                    ? () => doReturn(i.borrow_id)
                    : undefined
                }
                onDelete={
                  activeTab === "returned"
                    ? () => deleteReturned(i.borrow_id)
                    : undefined
                }
                isAdmin={false} // student side
              />
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center">
            No {activeTab} books
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2 mt-4">
            <button
              disabled={pages[activeTab] === 1}
              onClick={() =>
                setPages({ ...pages, [activeTab]: pages[activeTab] - 1 })
              }
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
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
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
