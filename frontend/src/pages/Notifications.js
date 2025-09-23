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
      <h1 className="text-2xl font-bold mb-4">Mail</h1>

      <input
        type="text"
        placeholder="Search messages..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-4 p-2 border rounded w-full focus:outline-none focus:ring focus:ring-blue-200"
      />

      <div className="space-y-4">
        {notes.map((n) => (
          <div
            key={n.id}
            className="bg-white border rounded-xl shadow p-4 hover:shadow-lg transition-shadow relative"
          >
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>FROM: {n.from_user || "@ADMIN_theonlylibrarian"}</span>
              <span>{new Date(n.created_at).toLocaleString()}</span>
            </div>
            <div className="font-bold text-gray-800">{n.title}</div>
            <p className="mt-2 text-gray-700">{n.message}</p>

            {/* Delete button moved below the card content */}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setConfirmDelete(n.id)}
                className="text-white bg-red-500 hover:bg-red-600 px-4 py-1 rounded shadow transition-colors"
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
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-2 py-1">
            {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete this message? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}