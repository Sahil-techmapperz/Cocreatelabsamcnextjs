"use client";
import Link from 'next/link';
import React from 'react';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-green-500">
      <div className="text-white text-4xl font-bold mb-12">
        Cocreatelabs
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl px-6">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Mentee Login</h2>
          <p className="text-gray-600 mb-6">Access your dashboard and manage your learning path.</p>
          <Link
            href="/mentee/login"
            className="bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 transition duration-200"
          >
            Mentee Login
          </Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Mentor Login</h2>
          <p className="text-gray-600 mb-6">Login to provide guidance and track mentee progress.</p>
          <Link
            href="/mentor/login"
            className="bg-green-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-600 transition duration-200"
          >
            Mentor Login
          </Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Admin Login</h2>
          <p className="text-gray-600 mb-6">Manage users, monitor progress, and oversee operations.</p>
          <Link
            href="/admin/login"
            className="bg-red-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-600 transition duration-200"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
