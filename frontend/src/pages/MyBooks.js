import React, { useEffect, useState } from "react";
import api from "../api";

export default function MyBooks() {
  const [items, setItems] = useState([]);

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

  // Return borrowed book
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

  // Cancel pending book request
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

  // Delete returned book record
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

  const pending = items.filter((i) => i.status === "pending");
  const borrowed = items.filter((i) => i.status === "borrowed");
  const returned = items.filter((i) => i.status === "returned");

  return (
    <div
      className="flex flex-col items-center min-h-screen p-6"
      style={{
        backgroundImage:
          'url(https://scontent.fcrk2-1.fna.fbcdn.net/v/t39.30808-6/517793024_122237938226024229_2789074869652155638_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeH8AR4llbpnvTKDgQd1XzkqfIpVrCQwmOx8ilWsJDCY7AllMuT19eAKUiPwazODqjPTXX2ZFpI09Zr_VTjzm1F4&_nc_ohc=7HxlyOmyV2gQ7kNvwFSAufp&_nc_oc=AdnZ7sOJ_eUBjhVaaEPoOLXWiIMaOOWk6Z5QRUNH6qlB0KvifejgK0kxoiwUfvNJYY&_nc_zt=23&_nc_ht=scontent.fcrk2-1.fna&_nc_gid=aAhq6ZjqUwpyeDdJprc0YA&oh=00_AfZCbOYP6NxBipRhZeVyqn6ip5psCdwi-mQdjYMI7st_Jw&oe=68C9F54B)',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-full max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-bubbly-deep">
          My Books
        </h1>

        {/* Pending Books */}
        <section className="bg-yellow-50/80 backdrop-blur-sm p-4 rounded-bubbly shadow-bubbly">
          <h2 className="text-xl font-semibold text-bubbly-deep mb-3">
            Pending Books
          </h2>
          <div className="space-y-3">
            {pending.length > 0 ? (
              pending.map((i) => (
                <div
                  key={i.borrow_id}
                  className="bg-yellow-100/70 p-4 rounded-bubbly shadow-sm flex justify-between items-center"
                >
                  <div>
                    <div className="font-bold">{i.title}</div>
                    <div className="text-sm text-bubbly-dark">
                      Requested at: {i.requested_at}
                    </div>
                  </div>
                  <button
                    onClick={() => cancelPending(i.borrow_id)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-bubbly font-bold transition"
                  >
                    Cancel
                  </button>
                </div>
              ))
            ) : (
              <div className="text-gray-500">No pending books</div>
            )}
          </div>
        </section>

        {/* Borrowed Books */}
        <section className="bg-white/80 backdrop-blur-sm p-4 rounded-bubbly shadow-bubbly">
          <h2 className="text-xl font-semibold text-bubbly-deep mb-3">
            Borrowed Books
          </h2>
          <div className="space-y-3">
            {borrowed.length > 0 ? (
              borrowed.map((i) => (
                <div
                  key={i.borrow_id}
                  className="bg-white/90 p-4 rounded-bubbly shadow-sm flex justify-between items-center"
                >
                  <div>
                    <div className="font-bold">{i.title}</div>
                    <div className="text-sm text-bubbly-dark">
                      Due: {i.due_date}
                    </div>
                  </div>
                  <button
                    onClick={() => doReturn(i.borrow_id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-bubbly font-bold transition"
                  >
                    Return
                  </button>
                </div>
              ))
            ) : (
              <div className="text-gray-500">No borrowed books</div>
            )}
          </div>
        </section>

        {/* Returned Books */}
        <section className="bg-green-50/80 backdrop-blur-sm p-4 rounded-bubbly shadow-bubbly">
          <h2 className="text-xl font-semibold text-bubbly-deep mb-3">
            Returned Books
          </h2>
          <div className="space-y-3">
            {returned.length > 0 ? (
              returned.map((i) => (
                <div
                  key={i.borrow_id}
                  className="bg-green-100/70 p-4 rounded-bubbly shadow-sm flex justify-between items-center"
                >
                  <div>
                    <div className="font-bold">{i.title}</div>
                    <div className="text-sm text-bubbly-dark">
                      Returned at: {i.returned_at}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteReturned(i.borrow_id)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-bubbly font-bold transition"
                  >
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <div className="text-gray-500">No returned books</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}