"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { checkSessionExpiration } from '@/lib/checkSessionExpiration';

const LoginSecurity = () => {


  // State to hold the password inputs
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const router = useRouter();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if the new password and confirm password match
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("New Password and Confirm Password do not match!");
      return;
    }

    // Setup the headers and body for the fetch API call
    const requestOptions = {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json'}, // Include the auth token
      body: JSON.stringify({
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      })
    };

    try {
      // Perform the API call to the server
      const response = await fetch(`/api/users/update-password`, requestOptions);

      // Check the response status
      if (!response.ok) {
        const errorDetails = await response.json();
        alert(`Failed to update password: ${errorDetails.message}`);
        return;
      }

      // Successfully updated the password
      alert('Password updated successfully!');
      // Reset the form
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Failed to update password:', error);
      alert('An error occurred while updating the password. Please try again.');
    }
  };


  useEffect(() => {
    // Check session expiration on initial load
    checkSessionExpiration(router, "mentee");

    // Set up an interval to check session expiration every second
    const interval = setInterval(() => {
      checkSessionExpiration(router, "mentee");
    }, 1000);

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className='flex gap-[30px] bg-gray-100 text-black  overflow-hidden'>
      <div className='myAccount_body mr-[12px] w-full'>
        <div className='w-full flex justify-center items-center mt-6'>
          <form className="max-w-sm w-full mx-auto bg-white rounded-lg shadow-md overflow-hidden p-6" onSubmit={handleSubmit}>
            <h2 className="text-xl font-bold text-center text-gray-900 mb-6">Change Password</h2>
            <div className="space-y-4">
              <label className="block text-lg font-semibold text-gray-700">
                Old Password:
                <input
                  type="password"
                  name="oldPassword"
                  value={passwords.oldPassword}
                  onChange={handleChange}
                  className="mt-1 w-full p-3 border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 rounded-md shadow-sm"
                  required
                />
              </label>
              <label className="block text-lg font-semibold text-gray-700">
                New Password:
                <input
                  type="password"
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handleChange}
                  className="mt-1 w-full p-3 border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 rounded-md shadow-sm"
                  required
                />
              </label>
              <label className="block text-lg font-semibold text-gray-700">
                Confirm New Password:
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 w-full p-3 border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 rounded-md shadow-sm"
                  required
                />
              </label>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-300">
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginSecurity;
