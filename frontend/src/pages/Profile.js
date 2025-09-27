import React, { useState } from "react";
import api from "../api";

export default function Profile({ user, setUser }) {
  const [form, setForm] = useState({
    name: user.name,
    grade_level_strand: user.grade_level_strand || "",
    contact_number: user.contact_number || "",
  });

  const [messageModal, setMessageModal] = useState(null);

  const save = async () => {
    try {
      const { data } = await api.put("/users/me", form);
      setUser(data);
      setMessageModal({ type: "success", text: "Profile saved successfully." });
    } catch (err) {
      setMessageModal({ type: "error", text: err?.response?.data?.error || "Failed to save profile." });
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen p-6"
      style={{
        backgroundImage:
          'url(https://scontent.fcrk2-1.fna.fbcdn.net/v/t39.30808-6/517793024_122237938226024229_2789074869652155638_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeH8AR4llbpnvTKDgQd1XzkqfIpVrCQwmOx8ilWsJDCY7AllMuT19eAKUiPwazODqjPTXX2ZFpI09Zr_VTjzm1F4&_nc_ohc=7HxlyOmyV2gQ7kNvwFSAufp&_nc_oc=AdnZ7sOJ_eUBjhVaaEPoOLXWiIMaOOWk6Z5QRUNH6qlB0KvifejgK0kxoiwUfvNJYY&_nc_zt=23&_nc_ht=scontent.fcrk2-1.fna&_nc_gid=aAhq6ZjqUwpyeDdJprc0YA&oh=00_AfZCbOYP6NxBipRhZeVyqn6ip5psCdwi-mQdjYMI7st_Jw&oe=68C9F54B)',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="bg-gradient-to-br from-blue-50 to-blue-100/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600 drop-shadow-md">
          Profile
        </h1>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-blue-700 mb-1">LRN</label>
          <input
            value={user.lrn}
            disabled
            className="w-full p-3 rounded-lg shadow-inner border-none bg-blue-100/50"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-blue-700 mb-1">Email</label>
          <input
            value={user.email}
            disabled
            className="w-full p-3 rounded-lg shadow-inner border-none bg-blue-100/50"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-blue-700 mb-1">Full Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full p-3 rounded-lg shadow-inner border-none focus:ring-2 focus:ring-blue-300 transition"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-blue-700 mb-1">Grade Level - Strand</label>
          <input
            value={form.grade_level_strand}
            onChange={(e) =>
              setForm({ ...form, grade_level_strand: e.target.value })
            }
            className="w-full p-3 rounded-lg shadow-inner border-none focus:ring-2 focus:ring-blue-300 transition"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-blue-700 mb-1">Contact Number</label>
          <input
            value={form.contact_number}
            onChange={(e) =>
              setForm({ ...form, contact_number: e.target.value })
            }
            className="w-full p-3 rounded-lg shadow-inner border-none focus:ring-2 focus:ring-blue-300 transition"
          />
        </div>

        <button
          onClick={save}
          className="w-full bg-gradient-to-r from-blue-300 to-blue-400 hover:from-blue-400 hover:to-blue-500 text-white py-3 rounded-full font-bold transition shadow-md"
        >
          Save
        </button>
      </div>

      {/* Message Modal */}
      {messageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 px-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fadeIn border-2 border-blue-200">
            <h2 className="text-lg font-bold mb-4 text-blue-700">
              {messageModal.type === "success" ? "✅ Success" : "❌ Error"}
            </h2>
            <p className="mb-6 text-blue-600">{messageModal.text}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setMessageModal(null)}
                className="px-4 py-2 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
