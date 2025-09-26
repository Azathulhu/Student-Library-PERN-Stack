import React from "react";

// ---- BookCard Component ----
function BookCard({ book, onRequest, onEdit, onDelete, isAdmin }) {
  // Limit description length for display
  const truncate = (text, max = 100) =>
    text.length > max ? text.slice(0, max) + "…" : text;

  return (
    <div
      className="w-full bg-gradient-to-br from-blue-100 via-blue-200 to-blue-50 
                 rounded-2xl shadow-lg hover:shadow-xl 
                 transition-transform transform hover:scale-105 duration-300 
                 flex flex-col overflow-hidden border border-blue-50"
    >
      {/* Book cover */}
      <div className="h-44 sm:h-40 bg-blue-50 rounded-t-2xl flex items-center justify-center overflow-hidden">
        {book.photo_url ? (
          <img
            src={book.photo_url}
            alt={book.title}
            className="h-full w-auto object-cover transition-transform transform hover:scale-110 duration-300"
          />
        ) : (
          <span className="text-xs text-blue-300">No Image</span>
        )}
      </div>

      {/* Book info */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-lg text-blue-900">{book.title}</h3>
        <p className="text-sm text-blue-700">{book.author}</p>

        {book.description && (
          <p className="text-xs text-blue-500 mt-2">{truncate(book.description)}</p>
        )}

        <p className="text-xs text-blue-400 mt-2">
          Available: {book.available_copies}
        </p>

        {/* Admin controls */}
        {isAdmin ? (
          <div className="flex gap-2 mt-auto">
            <button
              onClick={() => onEdit && onEdit(book)}
              className="bg-gradient-to-r from-blue-300 to-blue-400 text-white px-3 py-1 rounded-full shadow hover:brightness-110 transition duration-200"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete && onDelete(book.id)}
              className="bg-gradient-to-r from-red-300 to-red-400 text-white px-3 py-1 rounded-full shadow hover:brightness-110 transition duration-200"
            >
              Delete
            </button>
          </div>
        ) : (
          <button
            disabled={book.available_copies < 1}
            onClick={() => onRequest && onRequest(book.id)}
            className="mt-auto w-full bg-gradient-to-r from-blue-300 to-blue-400 
                       text-white py-2 rounded-2xl shadow-lg 
                       hover:brightness-110 disabled:opacity-50 transition duration-200"
          >
            Borrow
          </button>
        )}
      </div>
    </div>
  );
}

// ---- BooksGrid Component (wrapper for all cards) ----
export default function BooksGrid({ books, onRequest, onEdit, onDelete, isAdmin }) {
  return (
    <div className="p-4 grid gap-6
                    grid-cols-1 
                    sm:grid-cols-2 
                    md:grid-cols-3 
                    lg:grid-cols-4">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onRequest={onRequest}
          onEdit={onEdit}
          onDelete={onDelete}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
}
