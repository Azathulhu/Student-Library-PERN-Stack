import React, { useEffect, useState } from "react";
import api from "../api";
import BookCard from "../components/BookCard";

export default function MyBooks() {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("pending"); // pending | borrowed | returned
  const limit = 12;

  const loadBooks = async (status = tab, q = search, p = page) => {
    try {
      const res = await api.get("/books/admin-borrowed-search", {
        params: { status, q, page: p, limit },
      });
      setBooks(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setPage(1);
    loadBooks(tab, search, 1);
  }, [tab, search]);

  useEffect(() => {
    loadBooks(tab, search, page);
  }, [page]);

  const handleAction = async (bookId, action) => {
    try {
      if (action === "cancel") {
        await api.delete(`/books/cancel-pending/${bookId}`);
      } else if (action === "return") {
        await api.post(`/books/return/${bookId}`);
      } else if (action === "delete") {
        await api.delete(`/books/delete-returned/${bookId}`);
      }
      loadBooks(tab, search, page);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Action failed");
    }
  };

  return (
    <div className="px-4 md:px-8 py-6 bg-gradient-to-b from-blue-50 to-blue-100 min-h-screen">
      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-6">
        {["pending", "borrowed", "returned"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full font-semibold ${
              tab === t
                ? "bg-blue-400 text-white shadow"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6 max-w-xl mx-auto relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="peer w-full px-4 py-3 rounded-full border-2 border-blue-200 bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition shadow-md"
        />
        <label className="absolute left-5 top-3 text-blue-300 text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-blue-300 peer-focus:top-[-0.5rem] peer-focus:text-blue-500 peer-focus:text-xs bg-blue-50 px-1 transition-all rounded">
          Search
        </label>
      </div>

      {/* Books Grid */}
      {books.length === 0 ? (
        <div className="text-blue-300 text-center mt-12">No books found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((b) => (
            <BookCard
              key={b.borrow_id || b.book_id}
              book={b}
              onRequest={
                tab === "pending"
                  ? () => handleAction(b.borrow_id, "cancel")
                  : tab === "borrowed"
                  ? () => handleAction(b.borrow_id, "return")
                  : tab === "returned"
                  ? () => handleAction(b.borrow_id, "delete")
                  : null
              }
              isAdmin={false}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-300 to-blue-400 text-white font-semibold shadow hover:from-blue-400 hover:to-blue-500 transition disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-blue-700 font-medium">
          Page {page} of {Math.ceil(total / limit)}
        </span>
        <button
          disabled={page >= Math.ceil(total / limit)}
          onClick={() => setPage(page + 1)}
          className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-300 to-blue-400 text-white font-semibold shadow hover:from-blue-400 hover:to-blue-500 transition disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
/*import React, { useEffect, useState } from "react";
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
        /*<div className="flex justify-center space-x-4 mb-6">
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
        </div>*/

        {/* Search bar */}
        /*<div className="mb-4">
          <input
            type="text"
            placeholder={`Search ${activeTab} books...`}
            value={queries[activeTab]}
            onChange={(e) =>
              setQueries({ ...queries, [activeTab]: e.target.value })
            }
            className="w-full p-2 border rounded-bubbly shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>*/

        {/* List */}
        /*<div className="space-y-3">
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
        </div>*/

        {/* Pagination */}
        /*{totalPages > 1 && (
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
}*/
