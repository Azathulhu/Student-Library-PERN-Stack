import React, { useEffect, useState } from "react";
import api from "../api";
import BookCard from "../components/BookCard";
import { useLocation } from "react-router-dom";

export default function Dashboard() {
  const [books, setBooks] = useState([]);
  const [carouselBooks, setCarouselBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const limit = 12;
  const loc = useLocation();
  const query = new URLSearchParams(loc.search).get("q") || "";

  const [confirmRequest, setConfirmRequest] = useState(null);
  const [messageModal, setMessageModal] = useState(null);
  const [animatedText, setAnimatedText] = useState("");

  const marketingTexts = [
    "Searching for your favorite book has never been easier!",
    "Discover hidden gems in our collection 📚",
    "Swipe through books you didn't know you needed!",
    "Books you’ll love are just a scroll away!",
    "Endless stories, infinite possibilities..."
  ];

  // Rotate marketing text every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedText(marketingTexts[Math.floor(Math.random() * marketingTexts.length)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Fetch all books for carousel randomly
  const loadAllBooksForCarousel = async () => {
    try {
      const { data } = await api.get(`/books/search?page=1&limit=100`);
      if (data.data.length > 0) {
        const shuffled = data.data.sort(() => 0.5 - Math.random());
        setCarouselBooks(shuffled.slice(0, 10)); // pick 10 random books
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadBooks = async (q = search || query, p = page) => {
    try {
      const { data } = await api.get(`/books/search?q=${encodeURIComponent(q)}&page=${p}&limit=${limit}`);
      setBooks(data.data);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setPage(1);
    loadBooks(search || query, 1);
    loadAllBooksForCarousel();
  }, [search, query]);

  useEffect(() => {
    loadBooks(search || query, page);
  }, [page]);

  const handleConfirmRequest = async (bookId) => {
    try {
      await api.post(`/books/request/${bookId}`);
      setConfirmRequest(null);
      setMessageModal({ type: "success", text: "Borrow request sent. Wait for admin approval." });
    } catch (err) {
      setConfirmRequest(null);
      setMessageModal({ type: "error", text: err?.response?.data?.error || "Failed to request." });
    }
  };

  const request = async (bookId) => {
    setConfirmRequest(bookId);
  };

  return (
    <div className="px-4 md:px-8 py-6 bg-gradient-to-b from-blue-50 to-blue-100 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-2 text-center text-blue-600 drop-shadow-lg">
        📚 Explore Books
      </h1>

      {/* Animated Marketing Text */}
      <p className="text-center text-blue-500 font-semibold mb-6 animate-pulse">
        {animatedText}
      </p>

      {/* Search */}
      <div className="mb-10 max-w-xl mx-auto relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search books..."
          className="peer w-full px-4 py-3 rounded-full border-2 border-blue-200 bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition shadow-md"
        />
        <label className="absolute left-5 top-3 text-blue-300 text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-blue-300 peer-focus:top-[-0.5rem] peer-focus:text-blue-500 peer-focus:text-xs bg-blue-50 px-1 transition-all rounded">
          Search for a book...
        </label>
      </div>

      {/* Infinite Smooth Carousel */}
      {carouselBooks.length > 0 && (
        <div className="overflow-hidden relative mb-12">
          <div className="flex animate-scroll whitespace-nowrap">
            {[...carouselBooks, ...carouselBooks].map((b, idx) => (
              <div key={idx} className="inline-block w-56 mx-4">
                <div className="transform transition-all duration-300 hover:scale-105 hover:shadow-2xl rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 p-4">
                  <BookCard book={b} onRequest={request} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tailwind Scroll Animation */}
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          display: flex;
          animation: scroll 25s linear infinite; /* faster smooth scroll */
        }
      `}</style>

      {/* Book Grid */}
      {books.length === 0 ? (
        <div className="text-blue-300 text-center mt-12">No books found.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((b) => (
              <div
                key={b.id}
                className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 p-4"
              >
                <BookCard book={b} onRequest={request} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-300 to-blue-400 text-white font-semibold shadow hover:from-blue-400 hover:to-blue-500 transition disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-blue-700 font-medium">Page {page} of {Math.ceil(total / limit)}</span>
            <button
              disabled={page >= Math.ceil(total / limit)}
              onClick={() => setPage(page + 1)}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-300 to-blue-400 text-white font-semibold shadow hover:from-blue-400 hover:to-blue-500 transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
