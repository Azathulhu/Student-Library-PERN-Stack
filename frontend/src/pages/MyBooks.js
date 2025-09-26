import React, { useEffect, useState } from "react";
import api from "../api";
import BookCard from "../components/BookCard";

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
    await api.post(`/books/return/${borrowId}`);
    fetchBooks();
  };

  const cancelPending = async (borrowId) => {
    if (!window.confirm("Cancel this pending request?")) return;
    await api.delete(`/books/cancel-pending/${borrowId}`);
    fetchBooks();
  };

  const deleteReturned = async (borrowId) => {
    if (!window.confirm("Delete this returned record?")) return;
    await api.delete(`/books/delete-returned/${borrowId}`);
    fetchBooks();
  };

  // Filter + paginate
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
    <div className="flex flex-col items-center min-h-screen p-6 bg-blue-50">
      <div className="w-full max-w-6xl space-y-6">
        <h1 className="text-3xl font-bold text-center text-blue-900">My Books</h1>

        {/* Tabs */}
        <div className="flex justify-center space-x-4">
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

        {/* Search */}
        <input
          type="text"
          placeholder={`Search ${activeTab} books...`}
          value={queries[activeTab]}
          onChange={(e) => setQueries({ ...queries, [activeTab]: e.target.value })}
          className="w-full p-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400"
        />

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shownBooks.length > 0 ? (
            shownBooks.map((i) => (
              <BookCard
                key={i.borrow_id}
                book={i} // reuse same card design
                onRequest={null}
                onEdit={null}
                onDelete={
                  activeTab === "pending"
                    ? () => cancelPending(i.borrow_id)
                    : activeTab === "borrowed"
                    ? () => doReturn(i.borrow_id)
                    : () => deleteReturned(i.borrow_id)
                }
                isAdmin={false}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">
              No {activeTab} books
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2 mt-4">
            <button
              disabled={pages[activeTab] === 1}
              onClick={() => setPages({ ...pages, [activeTab]: pages[activeTab] - 1 })}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span>
              Page {pages[activeTab]} of {totalPages}
            </span>
            <button
              disabled={pages[activeTab] === totalPages}
              onClick={() => setPages({ ...pages, [activeTab]: pages[activeTab] + 1 })}
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
