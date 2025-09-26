import React, { useEffect, useState } from "react";
import api from "../api";

export default function MyBooks() {
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");

  // search + pagination states for each tab
  const [queries, setQueries] = useState({ pending: "", borrowed: "", returned: "" });
  const [pages, setPages] = useState({ pending: 1, borrowed: 1, returned: 1 });
  const limit = 5;

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
    <div
      className="flex flex-col items-center min-h-screen p-6"
      style={{
        backgroundImage:
          'url(https://scontent.fcrk2-1.fna.fbcdn.net/v/t39.30808-6/517793024_122237938226024229_2789074869652155638_n.jpg?... )',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-full max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-bubbly-deep">
          My Books
        </h1>

        {/* Tabs */}
        <div className="flex justify-center space-x-4 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-bubbly font-semibold transition ${
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
            className="w-full p-2 border rounded-bubbly shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* List */}
        <div className="space-y-3">
          {shownBooks.length > 0 ? (
            shownBooks.map((i) => (
              <div
                key={i.borrow_id}
                className={`p-4 rounded-bubbly shadow-sm flex justify-between items-center ${
                  activeTab === "pending"
                    ? "bg-yellow-100/70"
                    : activeTab === "borrowed"
                    ? "bg-white/90"
                    : "bg-green-100/70"
                }`}
              >
                <div>
                  <div className="font-bold">{i.title}</div>
                  <div className="text-sm text-bubbly-dark">
                    {activeTab === "pending" && <>Requested at: {i.requested_at}</>}
                    {activeTab === "borrowed" && <>Due: {i.due_date}</>}
                    {activeTab === "returned" && <>Returned at: {i.returned_at}</>}
                  </div>
                </div>

                {activeTab === "pending" && (
                  <button
                    onClick={() => cancelPending(i.borrow_id)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-bubbly font-bold transition"
                  >
                    Cancel
                  </button>
                )}
                {activeTab === "borrowed" && (
                  <button
                    onClick={() => doReturn(i.borrow_id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-bubbly font-bold transition"
                  >
                    Return
                  </button>
                )}
                {activeTab === "returned" && (
                  <button
                    onClick={() => deleteReturned(i.borrow_id)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-bubbly font-bold transition"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-center">
              No {activeTab} books
            </div>
          )}
        </div>

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
