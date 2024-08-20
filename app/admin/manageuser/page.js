"use client";

import React, { useEffect, useState } from 'react';
import { MdDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { userAgentFromString } from 'next/server';
import { useRouter } from 'next/navigation';
import { checkSessionExpiration } from '@/lib/checkSessionExpiration';

const baseUrl = "/api"; // Update this to your API's base URL

// Modal component
const Modal = ({ isOpen, closeModal, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded-lg shadow-xl max-w-lg w-full relative">
                <button onClick={closeModal} className="absolute top-0 right-0 p-2 text-4xl text-black">&times;</button>
                {children}
            </div>
        </div>
    );
};

// ConfirmationDialog component
const ConfirmationDialog = ({ show, onClose, onConfirm, message }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black text-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded-lg shadow-xl max-w-sm w-full">
                <p>{message}</p>
                <div className="flex justify-end gap-4 mt-4">
                    <button onClick={onConfirm} className="bg-red-500 text-white px-4 py-2 rounded">Confirm</button>
                    <button onClick={onClose} className="bg-gray-300 text-black px-4 py-2 rounded">Cancel</button>
                </div>
            </div>
        </div>
    );
};

const SuperAdminUserTable = () => {
    const [users, setUsers] = useState([]);
    const [editUser, setEditUser] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [deleteId, setDeleteId] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        password: '',
        role: '',
        rate: 0
    });


    const router = useRouter();


    useEffect(() => {
        // Check session expiration on initial load
        checkSessionExpiration(router, "admin");
    
        // Set up an interval to check session expiration every second
        const interval = setInterval(() => {
          checkSessionExpiration(router, "admin");
        }, 1000);
    
        // Clear interval on component unmount
        return () => clearInterval(interval);
      }, [router]);


    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const url = `${baseUrl}/users/all`;
        try {
            const response = await fetch(url, {
                method: "GET",
            });
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditUser(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = `${baseUrl}/users/add`;
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error('Failed to add user');
            const data = await response.json();
            setUsers(prev => [...prev, data.user]);
            setModalOpen(false);
        } catch (error) {
            console.error('Error adding user:', error);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const url = `${baseUrl}/users/add/${editUser._id}`;
        try {
            const response = await fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editUser)
            });
            if (!response.ok) throw new Error('Failed to edit user');
            const data = await response.json();
            setUsers(users.map(user => user.id === data.user.id ? data.user : user));
            setEditModalOpen(false);
        } catch (error) {
            console.error('Error editing user:', error);
        }
    };

    const handleDelete = async () => {
        const url = `${baseUrl}/users/add/${deleteId}`;
        try {
            const response = await fetch(url, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error('Failed to delete user');
            setUsers(users.filter(user => user._id !== deleteId));
            setShowDialog(false);
        } catch (error) {
            console.error('Error deleting user:', error);
            setShowDialog(false);
        }
    };

    const ToHumanReadableDate = (isoString) => {
        const date = new Date(isoString);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    }

    const handleEditOpenModal = (data) => {
        setEditUser(data); // Set the session to be rescheduled
        setEditModalOpen(true);
    };


    const handleDeleteClick = (id) => {
        setDeleteId(id)
        setShowDialog(true);
    };

    return (
        <div className='flex flex-col p-4'>
            <button onClick={() => setModalOpen(true)} className="mb-4 w-fit bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Add User</button>
            <div className='overflow-x-auto'>
                <table className='w-full text-sm text-left text-gray-500'>
                    <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
                        <tr>
                            <th scope='col' className='px-6 py-3'>SL</th>
                            <th scope='col' className='px-6 py-3'>Name</th>
                            <th scope='col' className='px-6 py-3'>Role</th>
                            <th scope='col' className='px-6 py-3'>Email</th>
                            <th scope='col' className='px-6 py-3'>Contact Number</th>
                            <th scope='col' className='px-6 py-3'>Created</th>
                            <th scope='col' className='px-6 py-3'>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user.id} className='bg-white border-b'>
                                <td className='px-6 py-4'>{++index}</td>
                                <td className='px-6 py-4'>{user.name}</td>
                                <td className='px-6 py-4'>{user.role}</td>
                                <td className='px-6 py-4'>{user.email}</td>
                                <td className="py-2 px-4  border-none ">{user && user.contactNumber && user.contactNumber}</td>
                                    <td className="py-2 px-4  border-none ">{ToHumanReadableDate(user.createdAt)}</td>
                                <td className='px-6 py-4 flex gap-2'>
                                    <CiEdit onClick={() => handleEditOpenModal(user)} className='cursor-pointer text-blue-600' />
                                    <MdDelete onClick={() => handleDeleteClick(user._id)} className='cursor-pointer text-red-500 ml-2' />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={modalOpen} closeModal={() => setModalOpen(false)}>
                <form onSubmit={handleSubmit} className="bg-white p-6">
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required className="shadow  border rounded w-full py-2 px-3 text-gray-700 leading-tight " />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="shadow  border rounded w-full py-2 px-3 text-gray-700 leading-tight " />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password:</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required className="shadow  border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight " />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="role" className="block text-gray-700 text-sm font-bold mb-2">Role:</label>
                        <select name="role" value={formData.role} onChange={handleChange} required className="shadow  border rounded w-full py-2 px-3 text-gray-700 leading-tight">
                            <option value="Admin">Admin</option>
                            <option value="Mentor">Mentor</option>
                            <option value="Client">Mentee</option>
                        </select>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="rate" className="block text-gray-700 text-sm font-bold mb-2">Rate:</label>
                        <input type="number" name="rate" value={formData.rate} onChange={handleChange} required className="shadow  border rounded w-full py-2 px-3 text-gray-700 leading-tight " />
                    </div>

                    <div className="flex items-center justify-between">
                        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Add Mentor</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={editModalOpen} closeModal={() => setEditModalOpen(false)}>
                <form onSubmit={handleEditSubmit} className="bg-white p-6">
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                        <input type="email" name="email" value={editUser.email} onChange={handleEditChange} required className="shadow  border rounded w-full py-2 px-3 text-gray-700 leading-tight " />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
                        <input type="text" name="name" value={editUser.name} onChange={handleEditChange} required className="shadow  border rounded w-full py-2 px-3 text-gray-700 leading-tight " />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="role" className="block text-gray-700 text-sm font-bold mb-2">Role:</label>
                        <select name="role" value={editUser.role} onChange={handleEditChange} required className="shadow  border rounded w-full py-2 px-3 text-gray-700 leading-tight">
                            <option value="Admin">Admin</option>
                            <option value="Mentor">Mentor</option>
                            <option value="Client">Mentee</option>
                        </select>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="rate" className="block text-gray-700 text-sm font-bold mb-2">Rate:</label>
                        <input type="number" name="rate" value={editUser.rate} onChange={handleEditChange} required className="shadow  border rounded w-full py-2 px-3 text-gray-700 leading-tight " />
                    </div>

                    <div className="flex items-center justify-between">
                        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Edit Mentor</button>
                    </div>
                </form>
            </Modal>

            <ConfirmationDialog
                show={showDialog}
                onClose={() => setShowDialog(false)}
                onConfirm={handleDelete}
                message="Are you sure you want to delete this user?"
            />
        </div>
    );
};

export default SuperAdminUserTable;
