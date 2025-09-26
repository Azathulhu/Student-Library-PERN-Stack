import React from "react";

export default function BookCard({ book, onRequest, onEdit, onDelete, isAdmin }) {
  const truncate = (text, max = 100) =>
    text.length > max ? text.slice(0, max) + "…" : text;

  return (
    <div
      className="
        bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200
        rounded-2xl shadow-lg hover:shadow-2xl
        transform hover:scale-105 transition-transform duration-300
        flex flex-col
        w-60 md:w-64 lg:w-72
        m-4
      "
    >
      {/* Book cover */}
      <div className="h-48 bg-white rounded-t-2xl flex items-center justify-center overflow-hidden">
        {book.photo_url ? (
          <img
            src={book.photo_url}
            alt={book.title}
            className="h-full w-full object-cover rounded-t-2xl"
          />
        ) : (
          <span className="text-xs text-gray-400">No Image</span>
        )}
      </div>

      {/* Book info */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-lg text-gray-800 mb-1">{book.title}</h3>
        <p className="text-sm text-gray-600 mb-2">{book.author}</p>
        {book.description && (
          <p className="text-xs text-gray-500 mb-2">{truncate(book.description)}</p>
        )}
        <p className="text-xs text-gray-500 mb-3">
          Available: {book.available_copies}
        </p>

        {/* Admin controls */}
        {isAdmin ? (
          <div className="flex gap-2 mt-auto">
            <button
              onClick={() => onEdit && onEdit(book)}
              className="bg-blue-400 hover:bg-blue-500 text-white px-3 py-1 rounded-full transition-colors duration-200"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete && onDelete(book.id)}
              className="bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded-full transition-colors duration-200"
            >
              Delete
            </button>
          </div>
        ) : (
          <button
            disabled={book.available_copies < 1}
            onClick={() => onRequest && onRequest(book.id)}
            className="mt-auto w-full bg-blue-400 hover:bg-blue-500 text-white py-2 rounded-full shadow transition-colors duration-200 disabled:opacity-50"
          >
            Borrow
          </button>
        )}
      </div>
    </div>
  );
}
