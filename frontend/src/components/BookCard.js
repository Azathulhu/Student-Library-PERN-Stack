import React from "react";

export default function BookCard({ book, onRequest, onEdit, onDelete, isAdmin }) {
  const truncate = (text, max = 100) =>
    text.length > max ? text.slice(0, max) + "…" : text;

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white rounded-2xl shadow-xl hover:shadow-2xl transition-transform transform hover:scale-105 duration-300 flex flex-col overflow-hidden">
      
      {/* Book cover */}
      <div className="h-44 bg-gradient-to-br from-blue-200 to-blue-100 rounded-t-2xl flex items-center justify-center overflow-hidden">
        {book.photo_url ? (
          <img
            src={book.photo_url}
            alt={book.title}
            className="h-full w-auto object-contain transition-transform duration-500 hover:scale-110"
          />
        ) : (
          <span className="text-sm text-blue-300 font-semibold">No Image</span>
        )}
      </div>

      {/* Book info */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-extrabold text-lg text-blue-900 mb-1">{book.title}</h3>
        <p className="text-sm text-blue-700 mb-2">{book.author}</p>

        {/* Book description */}
        {book.description && (
          <p className="text-xs text-blue-400 mb-3">{truncate(book.description, 120)}</p>
        )}

        <p className="text-xs text-blue-500 mb-4">
          Available: <span className="font-semibold">{book.available_copies}</span>
        </p>

        {/* Admin controls */}
        {isAdmin ? (
          <div className="flex gap-3 mt-auto">
            <button
              onClick={() => onEdit && onEdit(book)}
              className="bg-blue-400 text-white px-3 py-1 rounded-xl shadow hover:bg-blue-500 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete && onDelete(book.id)}
              className="bg-red-400 text-white px-3 py-1 rounded-xl shadow hover:bg-red-500 transition-colors"
            >
              Delete
            </button>
          </div>
        ) : (
          <button
            disabled={book.available_copies < 1}
            onClick={() => onRequest && onRequest(book.id)}
            className="mt-auto w-full bg-blue-300 text-white py-2 rounded-xl shadow hover:bg-blue-400 disabled:opacity-50 transition-colors"
          >
            Borrow
          </button>
        )}
      </div>
    </div>
  );
}
