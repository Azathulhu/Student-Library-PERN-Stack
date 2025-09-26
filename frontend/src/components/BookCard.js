import React from "react";

export default function BookCard({ book, onRequest, onEdit, onDelete, isAdmin }) {
  // Limit description length for display
  const truncate = (text, max = 100) =>
    text.length > max ? text.slice(0, max) + "…" : text;

  return (
    <div
      className="
        bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 
        rounded-2xl shadow-md hover:shadow-xl transition-transform transform hover:scale-105 duration-300
        flex flex-col
        w-full sm:w-64
        m-2
      "
    >
      {/* Book cover */}
      <div className="h-48 bg-blue-50 rounded-t-2xl flex items-center justify-center overflow-hidden">
        {book.photo_url ? (
          <img
            src={book.photo_url}
            alt={book.title}
            className="h-full w-full object-cover rounded-t-2xl"
          />
        ) : (
          <span className="text-xs text-blue-300">No Image</span>
        )}
      </div>

      {/* Book info */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-lg text-blue-800">{book.title}</h3>
        <p className="text-sm text-blue-600">{book.author}</p>

        {book.description && (
          <p className="text-xs text-blue-500 mt-2">{truncate(book.description)}</p>
        )}

        <p className="text-xs text-blue-500 mt-2">
          Available: {book.available_copies}
        </p>

        {/* Admin controls */}
        {isAdmin ? (
          <div className="flex gap-2 mt-auto">
            <button
              onClick={() => onEdit && onEdit(book)}
              className="bg-blue-400 text-white px-3 py-1 rounded-full hover:bg-blue-500 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete && onDelete(book.id)}
              className="bg-red-400 text-white px-3 py-1 rounded-full hover:bg-red-500 transition-colors"
            >
              Delete
            </button>
          </div>
        ) : (
          <button
            disabled={book.available_copies < 1}
            onClick={() => onRequest && onRequest(book.id)}
            className="mt-auto w-full bg-blue-500 text-white py-2 rounded-full shadow hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            Borrow
          </button>
        )}
      </div>
    </div>
  );
}
