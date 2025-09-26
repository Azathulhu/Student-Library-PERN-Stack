import React, { useEffect, useState } from "react";
import api from "../api";

export default function Notifications() {
  const [notes, setNotes] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const limit = 5;

  const fetchNotes = async () => {
    try {
      const { data } = await api.get("/users/notifications/search", {
        params: { q: query, page, limit },
      });
      setNotes(data.data);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [page, query]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/notifications/${id}`);
      setConfirmDelete(null);
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="px-8 py-6">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">Mail</h1>

      <input
        type="text"
        placeholder="🔍 Search messages..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-4 p-2 rounded-lg w-full border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
      />

      <div className="space-y-4">
        {notes.map((n) => (
          <div
            key={n.id}
            className="bg-white border border-blue-100 rounded-xl shadow-md hover:shadow-xl transition-shadow relative p-4"
          >
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>FROM: {n.from_user || "@ADMIN_theonlylibrarian"}</span>
              <span>{new Date(n.created_at).toLocaleString()}</span>
            </div>
            <div className="font-bold text-gray-800">{n.title}</div>
            <p className="mt-2 text-gray-700">{n.message}</p>

            {/* Delete button */}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setConfirmDelete(n.id)}
                className="px-4 py-1 rounded-lg shadow text-white bg-red-400 hover:bg-red-500 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {notes.length === 0 && (
          <div className="text-gray-500">No mail yet.</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded-lg shadow-sm hover:bg-blue-100 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-2 py-1 text-blue-700 font-semibold">
            {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded-lg shadow-sm hover:bg-blue-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 w-96 shadow-2xl transform transition-all scale-100 animate-fadeInGlow">
            <h2 className="text-lg font-bold mb-4 text-blue-800">
              Confirm Delete
            </h2>
            <p className="mb-6 text-gray-700">
              Are you sure you want to delete this message? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-lg border border-blue-200 bg-white hover:bg-blue-50 shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="px-4 py-2 bg-red-400 text-white rounded-lg shadow hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Glow animation */}
      <style>
        {`
          @keyframes fadeInGlow {
            0% { opacity: 0; transform: scale(0.9); box-shadow: 0 0 0 rgba(59,130,246,0); }
            100% { opacity: 1; transform: scale(1); box-shadow: 0 0 25px rgba(59,130,246,0.3); }
          }
          .animate-fadeInGlow {
            animation: fadeInGlow 0.3s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
}
