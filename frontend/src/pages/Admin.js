import React, { useEffect, useState } from 'react';
import api from '../api';
import { motion, AnimatePresence } from "framer-motion";

export default function Admin() {
  const [books, setBooks] = useState([]);
  const [pending, setPending] = useState([]);
  const [form, setForm] = useState({ title: '', author: '', description: '', total_copies: 1 });
  const [mail, setMail] = useState({ user_id: "", title: "", message: "" });
  const [editingBook, setEditingBook] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [borrowed, setBorrowed] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const [pendingSearch, setPendingSearch] = useState('');
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingTotal, setPendingTotal] = useState(0);

  const [borrowedSearch, setBorrowedSearch] = useState('');
  const [borrowedPage, setBorrowedPage] = useState(1);
  const [borrowedTotal, setBorrowedTotal] = useState(0);

  const [activeTab, setActiveTab] = useState("add");

  const tabs = [
    { id: "add", label: "Add Book" },
    { id: "pending", label: "Pending Requests" },
    { id: "borrowed", label: "Currently Borrowed" },
    { id: "search", label: "Search Books" },
    { id: "mail", label: "Send Mail" },
  ];

  const handlePendingSearch = async (q = pendingSearch, p = pendingPage) => {
    try {
      const { data } = await api.get(`/books/admin-borrowed-search?q=${encodeURIComponent(q)}&page=${p}&limit=${limit}&status=pending`);
      setPending(data.data);
      setPendingTotal(data.total);
    } catch (err) { console.error(err); }
  };

  const handleBorrowedSearch = async (q = borrowedSearch, p = borrowedPage) => {
    try {
      const { data } = await api.get(`/books/admin-borrowed-search?q=${encodeURIComponent(q)}&page=${p}&limit=${limit}&status=borrowed`);
      setBorrowed(data.data);
      setBorrowedTotal(data.total);
    } catch (err) { console.error(err); }
  };

  // Call initially and on page change
  useEffect(() => { handlePendingSearch(); }, [pendingPage]);
  useEffect(() => { handleBorrowedSearch(); }, [borrowedPage]);

  const loadBorrowed = async () => {
    try {
      const { data } = await api.get('/books/borrowed');
      setBorrowed(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadPending = async () => {
    try {
      const { data } = await api.get('/books/pending');
      setPending(data);
    } catch (err) {
      console.error(err);
    }
  };

  const searchBooks = async (q = search, p = page) => {
    try {
      const { data } = await api.get(`/books/admin-search?q=${encodeURIComponent(q)}&page=${p}&limit=${limit}`);
      setBooks(data.data);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    }
  };

  const add = async () => {
    try {
      await api.post('/books', form);
      setForm({ title: '', author: '', description: '', total_copies: 1 });
      setPage(1);
      searchBooks(search, 1);
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed');
    }
  };

  const handleEdit = (book) => {
    setEditingBook(book.id);
    setEditForm({ 
      title: book.title, 
      author: book.author, 
      description: book.description || '', 
      total_copies: book.total_copies, 
      photo_url: book.photo_url || '' 
    });
  };

  const handleEditSubmit = async (id) => {
    await api.put(`/books/${id}`, editForm);
    setEditingBook(null);
    setEditForm({});
    searchBooks(search, page);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this book?')) {
      await api.delete(`/books/${id}`);
      if (books.length === 1 && page > 1) {
        setPage(page - 1);
        searchBooks(search, page - 1);
      } else {
        searchBooks(search, page);
      }
    }
  };

  const approve = async (borrowId) => {
    try {
      await api.post(`/books/approve/${borrowId}`, { due_days: 7 });
      loadPending();
      loadBorrowed();
      searchBooks(search, page);
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed');
    }
  };

  const cancel = async (borrowId) => {
  try {
    await api.delete(`/books/cancel-pending/${borrowId}`);
    loadPending();
    loadBorrowed();
    searchBooks(search, page);
  } catch (err) {
    alert(err?.response?.data?.error || 'Failed to cancel request');
  }
};

  const handleForceReturn = async (borrowId) => {
    if (window.confirm('Force return this book?')) {
      try {
        await api.post(`/books/force-return/${borrowId}`);
        loadBorrowed();
        searchBooks(search, page);
      } catch (err) {
        alert(err?.response?.data?.error || "Failed to force return");
      }
    }
  };

  const sendMail = async () => {
    try {
      await api.post(`/users/${mail.user_id}/notify`, { title: mail.title, message: mail.message });
      alert("Mail sent!");
      setMail({ user_id: "", title: "", message: "" });
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to send");
    }
  };

  useEffect(() => {
    loadPending();
    loadBorrowed();
  }, []);

  useEffect(() => {
    searchBooks(search, page);
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    searchBooks(search, 1);
  };
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Tabs */}
      <div className="mb-4">
        {/* Mobile dropdown for very small screens */}
        <div className="sm:hidden mb-2">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-blue-100 text-blue-800 font-semibold shadow-md focus:ring-2 focus:ring-blue-300 transition-colors"
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.label}
              </option>
            ))}
          </select>
        </div>
      
        {/* Scrollable horizontal tabs for small to large screens */}
        <div className="hidden sm:flex gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-shrink-0 whitespace-nowrap px-5 py-2 rounded-2xl font-bold transition-all
                shadow-md hover:shadow-xl hover:scale-105
                focus:outline-none focus:ring-2 focus:ring-blue-200
                ${
                  activeTab === tab.id
                    ? "bg-blue-200 text-blue-900 ring-2 ring-blue-300"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-150"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sections with animation */}
      <AnimatePresence exitBeforeEnter>
        {activeTab === "add" && (
          <motion.section
            key="add"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-6 bg-white/90 backdrop-blur-sm p-5 sm:p-6 rounded-bubbly shadow-bubbly max-w-lg mx-auto"
          >
            {/* Add Book */}
            <section className="mb-6 bg-white/90 backdrop-blur-sm p-5 sm:p-6 rounded-bubbly shadow-bubbly max-w-lg mx-auto">
              <h2 className="font-bold text-bubbly-deep mb-4 text-lg">Add Book</h2>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full mb-3 px-4 py-2 rounded-bubbly shadow-bubbly border-none focus:ring-2 focus:ring-bubbly-blue transition" />
              <input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} placeholder="Author" className="w-full mb-3 px-4 py-2 rounded-bubbly shadow-bubbly border-none focus:ring-2 focus:ring-bubbly-blue transition" />
              <input value={form.photo_url} onChange={e => setForm({ ...form, photo_url: e.target.value })} placeholder="Photo URL" className="w-full mb-3 px-4 py-2 rounded-bubbly shadow-bubbly border-none focus:ring-2 focus:ring-bubbly-blue transition" />
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" className="w-full mb-3 px-4 py-2 rounded-bubbly shadow-bubbly border-none focus:ring-2 focus:ring-bubbly-blue transition" />
              <input value={form.total_copies} type="number" onChange={e => setForm({ ...form, total_copies: parseInt(e.target.value || '1') })} placeholder="Copies" className="w-full mb-3 px-4 py-2 rounded-bubbly shadow-bubbly border-none focus:ring-2 focus:ring-bubbly-blue transition" />
              <button onClick={add} className="w-full bg-bubbly-blue hover:bg-bubbly-deep text-white py-2 rounded-bubbly font-bold transition">Add</button>
            </section>
          </motion.section>
        )}

        {activeTab === "pending" && (
          <motion.section
            key="pending"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-6 max-w-5xl mx-auto"
          >
            {/* Pending Requests Section */}
            {/* Your existing Pending Requests JSX goes here */}
            {/* Pending Requests with Search & Pagination */}
            <section className="mb-6 max-w-5xl mx-auto">
              <h2 className="font-bold text-bubbly-deep mb-3 text-lg">Pending Requests</h2>
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <input
                  value={pendingSearch}
                  onChange={e => setPendingSearch(e.target.value)}
                  placeholder="Search by user or book"
                  className="flex-1 px-4 py-2 rounded-bubbly shadow-bubbly border-none focus:ring-2 focus:ring-bubbly-blue transition"
                  onKeyDown={e => { if (e.key === 'Enter') handlePendingSearch(); }}
                />
                <button
                  onClick={handlePendingSearch}
                  className="bg-bubbly-blue hover:bg-bubbly-deep text-white px-4 py-2 rounded-bubbly font-bold transition"
                >Search</button>
              </div>
              <div className="space-y-3">
                {pending.map(p => (
                  <div key={p.borrow_id} className="bg-white/90 backdrop-blur-sm p-3 rounded-bubbly shadow-bubbly flex justify-between items-center">
                    <div>
                      <div className="font-bold">{p.title}</div>
                      <div className="text-xs text-bubbly-dark">User: {p.name} ({p.lrn})</div>
                      <div className="text-xs text-bubbly-dark">Requested: {new Date(p.requested_at).toLocaleString()}</div>
                      <div className="text-xs text-bubbly-dark">User ID: {p.user_id} ({p.user_id})</div>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <button onClick={() => approve(p.borrow_id)} className="bg-bubbly-blue hover:bg-bubbly-deep text-white px-3 py-1 rounded-bubbly transition">Approve</button>
                      <button onClick={() => cancel(p.borrow_id)} className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded-bubbly transition">Cancel</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-4 mt-4 text-bubbly-dark">
                <button disabled={pendingPage === 1} onClick={() => setPendingPage(pendingPage - 1)} className="px-3 py-1 rounded-bubbly bg-gray-200 hover:bg-gray-300 transition">Prev</button>
                <span>Page {pendingPage} of {Math.ceil(pendingTotal / limit) || 1}</span>
                <button disabled={pendingPage >= Math.ceil(pendingTotal / limit)} onClick={() => setPendingPage(pendingPage + 1)} className="px-3 py-1 rounded-bubbly bg-gray-200 hover:bg-gray-300 transition">Next</button>
              </div>
            </section>

          </motion.section>
        )}

        {activeTab === "borrowed" && (
          <motion.section
            key="borrowed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-6 max-w-5xl mx-auto"
          >
            {/* Currently Borrowed Section */}
            {/* Currently Borrowed Books with Search & Pagination */}
            <section className="mb-6 max-w-5xl mx-auto">
              <h2 className="font-bold text-bubbly-deep mb-3 text-lg">Currently Borrowed Books</h2>
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <input
                  value={borrowedSearch}
                  onChange={e => setBorrowedSearch(e.target.value)}
                  placeholder="Search by user or book"
                  className="flex-1 px-4 py-2 rounded-bubbly shadow-bubbly border-none focus:ring-2 focus:ring-bubbly-blue transition"
                  onKeyDown={e => { if (e.key === 'Enter') handleBorrowedSearch(); }}
                />
                <button
                  onClick={handleBorrowedSearch}
                  className="bg-bubbly-blue hover:bg-bubbly-deep text-white px-4 py-2 rounded-bubbly font-bold transition"
                >Search</button>
              </div>
              <div className="space-y-3">
                {borrowed.map(b => (
                  <div key={b.borrow_id} className="bg-white/90 backdrop-blur-sm p-3 rounded-bubbly shadow-bubbly flex justify-between items-center">
                    <div>
                      <div className="font-bold">{b.title}</div>
                      <div className="text-xs text-bubbly-dark">User: {b.name}</div>
                      <div className="text-xs text-bubbly-dark">Borrowed: {new Date(b.borrowed_at).toLocaleString()}</div>
                      <div className="text-xs text-bubbly-dark">Due: {b.due_date ? new Date(b.due_date).toLocaleDateString() : 'N/A'}</div>
                    </div>
                    <button onClick={() => handleForceReturn(b.borrow_id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-bubbly font-bold transition">Force Return</button>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-4 mt-4 text-bubbly-dark">
                <button disabled={borrowedPage === 1} onClick={() => setBorrowedPage(borrowedPage - 1)} className="px-3 py-1 rounded-bubbly bg-gray-200 hover:bg-gray-300 transition">Prev</button>
                <span>Page {borrowedPage} of {Math.ceil(borrowedTotal / limit) || 1}</span>
                <button disabled={borrowedPage >= Math.ceil(borrowedTotal / limit)} onClick={() => setBorrowedPage(borrowedPage + 1)} className="px-3 py-1 rounded-bubbly bg-gray-200 hover:bg-gray-300 transition">Next</button>
              </div>
            </section>
          </motion.section>
        )}

        {activeTab === "search" && (
          <motion.section
            key="search"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-6 max-w-5xl mx-auto"
          >
            {/* Search Books Section */}
                 {/* Search & Books */}
          <section className="mb-6 max-w-5xl mx-auto">
            <h2 className="font-bold text-bubbly-deep mb-3 text-lg">Search Books</h2>
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or author" className="flex-1 px-4 py-2 rounded-bubbly shadow-bubbly border-none focus:ring-2 focus:ring-bubbly-blue transition" onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }} />
              <button onClick={handleSearch} className="bg-bubbly-blue hover:bg-bubbly-deep text-white px-4 py-2 rounded-bubbly font-bold transition">Search</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {books.map(b => (
                <div key={b.id} className="bg-white/90 backdrop-blur-sm p-4 rounded-bubbly shadow-bubbly">
                  {editingBook === b.id ? (
                    <div className="flex flex-col gap-2">
                      <input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} placeholder="Title" className="w-full px-3 py-1 rounded-bubbly shadow-bubbly border-none focus:ring-2 focus:ring-bubbly-blue transition" />
                      <input value={editForm.author} onChange={e => setEditForm({ ...editForm, author: e.target.value })} placeholder="Author" className="w-full px-3 py-1 rounded-bubbly shadow-bubbly border-none focus:ring-2 focus:ring-bubbly-blue transition" />
                      <input value={editForm.total_copies} type="number" onChange={e => setEditForm({ ...editForm, total_copies: parseInt(e.target.value || '1') })} placeholder="Copies" className="w-full px-3 py-1 rounded-bubbly shadow-bubbly border-none focus:ring-2 focus:ring-bubbly-blue transition" />
                      <input value={editForm.photo_url} onChange={e => setEditForm({ ...editForm, photo_url: e.target.value })} placeholder="Photo URL" className="w-full px-3 py-1 rounded-bubbly shadow-bubbly border-none focus:ring-2 focus:ring-bubbly-blue transition" />
                      <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} placeholder="Description" className="w-full px-3 py-1 rounded-bubbly shadow-bubbly border-none focus:ring-2 focus:ring-bubbly-blue transition" />
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleEditSubmit(b.id)} className="bg-bubbly-blue hover:bg-bubbly-deep text-white px-3 py-1 rounded-bubbly font-bold transition">Save</button>
                        <button onClick={() => setEditingBook(null)} className="bg-bubbly-dark text-white px-3 py-1 rounded-bubbly font-bold transition">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <div className="font-bold">{b.title}</div>
                      <div className="text-sm text-bubbly-dark">{b.author}</div>
                      <div className="text-xs text-bubbly-dark">Available: {b.available_copies}</div>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleEdit(b)} className="bg-bubbly-blue hover:bg-bubbly-deep text-white px-3 py-1 rounded-bubbly font-bold transition">Edit</button>
                        <button onClick={() => handleDelete(b.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-bubbly font-bold transition">Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-4 mt-4 text-bubbly-dark">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1 rounded-bubbly bg-gray-200 hover:bg-gray-300 transition">Prev</button>
              <span>Page {page} of {Math.ceil(total / limit) || 1}</span>
              <button disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(page + 1)} className="px-3 py-1 rounded-bubbly bg-gray-200 hover:bg-gray-300 transition">Next</button>
            </div>
          </section>
          </motion.section>
        )}

        {activeTab === "mail" && (
          <motion.section
            key="mail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-6 max-w-lg mx-auto bg-white/90 backdrop-blur-sm p-6 rounded-bubbly shadow-bubbly"
          >
            {/* Send Mail Section */}
            <section className="mb-6 max-w-lg mx-auto bg-white/90 backdrop-blur-sm p-6 rounded-bubbly shadow-bubbly">
              <h2 className="font-bold text-bubbly-deep mb-4 text-lg">Send Mail</h2>
              <input value={mail.user_id} onChange={e => setMail({ ...mail, user_id: e.target.value })} placeholder="User ID" className="w-full mb-3 px-4 py-2 rounded-bubbly shadow-bubbly border-none focus:ring-2 focus:ring-bubbly-blue transition" />
              <input value={mail.title} onChange={e => setMail({ ...mail, title: e.target.value })} placeholder="Title" className="w-full mb-3 px-4 py-2 rounded-bubbly shadow-bubbly border-none focus:ring-2 focus:ring-bubbly-blue transition" />
              <textarea value={mail.message} onChange={e => setMail({ ...mail, message: e.target.value })} placeholder="Message" className="w-full mb-3 px-4 py-2 rounded-bubbly shadow-bubbly border-none focus:ring-2 focus:ring-bubbly-blue transition" />
              <button onClick={sendMail} className="w-full bg-bubbly-blue hover:bg-bubbly-deep text-white py-2 rounded-bubbly font-bold transition">Send</button>
            </section>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
    
  );
}
