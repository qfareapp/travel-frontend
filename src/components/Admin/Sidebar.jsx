// src/components/Admin/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaClipboardList, FaMapMarkedAlt, FaHome } from "react-icons/fa";

const Sidebar = () => {
  const location = useLocation();
  const navItems = [
    { name: "Bookings", path: "/admin/bookings", icon: <FaClipboardList /> },
    { name: "Circuits", path: "/admin/create-circuit", icon: <FaMapMarkedAlt /> },
    { name: "Homestays", path: "/admin/add-homestay", icon: <FaHome /> },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="px-6 py-4 border-b border-gray-800">
        <h2 className="text-xl font-bold">Admin Panel</h2>
      </div>

      <nav className="flex flex-col p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 p-2 rounded-md hover:bg-gray-700 transition ${
              location.pathname === item.path ? "bg-gray-700" : ""
            }`}
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
