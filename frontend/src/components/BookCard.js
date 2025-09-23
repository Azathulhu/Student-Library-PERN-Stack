import React from "react";

export default function BookCard({ book, onRequest, onEdit, onDelete, isAdmin }) {
  // Limit description length for display
  const truncate = (text, max = 100) =>
    text.length > max ? text.slice(0, max) + "…" : text;

  return (
    <div
      className="bg-white rounded-xl shadow hover:shadow-lg transition-transform transform hover:scale-105 duration-200 flex flex-col"
    >
      {/* Book cover */}
      <div className="h-40 bg-gray-100 rounded-t-xl flex items-center justify-center overflow-hidden">
        {book.photo_url ? (
          <img src={book.photo_url} alt={book.title} className="h-full" />
        ) : (
          <span className="text-xs text-gray-500">No Image</span>
        )}
      </div>

      {/* Book info */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-lg text-gray-800">{book.title}</h3>
        <p className="text-sm text-gray-600">{book.author}</p>

        {/* Book description */}
        {book.description && (
          <p className="text-xs text-gray-500 mt-2">{truncate(book.description)}</p>
        )}

        <p className="text-xs text-gray-500 mt-2">
          Available: {book.available_copies}
        </p>

        {/* Admin controls */}
        {isAdmin ? (
          <div className="flex gap-2 mt-auto">
            <button
              onClick={() => onEdit && onEdit(book)}
              className="bg-blue-500 text-white px-2 py-1 rounded"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete && onDelete(book.id)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              Delete
            </button>
          </div>
        ) : (
          <button
            disabled={book.available_copies < 1}
            onClick={() => onRequest && onRequest(book.id)}
            className="mt-auto w-full bg-blue-600 text-white py-2 rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
          >
            Borrow
          </button>
        )}
      </div>
    </div>
  );
}