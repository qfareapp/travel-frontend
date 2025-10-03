// src/components/Admin/AdminLayout.jsx
import React from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-14 bg-white shadow flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-gray-700">Admin Panel</h1>
          <div className="flex items-center gap-3">
            <span className="text-gray-600">Hello, Admin</span>
            <img
              src="https://ui-avatars.com/api/?name=Admin"
              alt="admin avatar"
              className="w-8 h-8 rounded-full"
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
