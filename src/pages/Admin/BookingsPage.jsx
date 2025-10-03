// src/pages/Admin/BookingsPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    axios.get("${API_BASE}/api/admin/bookings")
      .then((res) => setBookings(res.data))
      .catch((err) => console.error("Error fetching bookings:", err));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">User Bookings</h2>

      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
            <tr>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Contact</th>
              <th className="p-3 text-left">Circuit</th>
              <th className="p-3 text-left">Days</th>
              <th className="p-3 text-left">Pax</th>
              <th className="p-3 text-left">Total Cost</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id} className="border-b hover:bg-gray-50">
                <td className="p-3">{b.customerName}</td>
                <td className="p-3">{b.customerContact}</td>
                <td className="p-3">{b.circuit}</td>
                <td className="p-3">{b.days}</td>
                <td className="p-3">{b.pax}</td>
                <td className="p-3 font-semibold">₹{b.totalCost}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      b.status === "Booked"
                        ? "bg-green-100 text-green-600"
                        : b.status === "Cancelled"
                        ? "bg-red-100 text-red-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="p-3">
                  {new Date(b.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingsPage;
