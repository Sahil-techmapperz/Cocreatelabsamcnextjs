"use client";
import { checkSessionExpiration } from '@/lib/checkSessionExpiration';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { MdDelete } from 'react-icons/md';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const IssueReport = () => {
    const [issues, setIssues] = useState([]);
    const [filterIssues, setFilterIssues] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const dropdownOptions = ['Pending', 'Resolve', 'In Progress']; // Status options for issues


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
        fetchIssues();
    }, []);

    const fetchIssues = async () => {
        try {
            const response = await fetch('/api/users/issues', {
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error('Failed to fetch issues');
            const data = await response.json();
            setIssues(data);
            setFilterIssues(data);
        } catch (error) {
            console.error('Error fetching issues:', error);
        }
    };

    const handleSendReply = async () => {
        if (!selectedIssue) return;
        try {
            const response = await fetch(`/api/users/issues/${selectedIssue._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reply: replyText })
            });
            if (!response.ok) throw new Error('Failed to send reply');
            fetchIssues();
            closeModal();
            toast.success('Reply sent successfully!');
        } catch (error) {
            console.error('Error sending reply:', error);
            toast.error('Failed to send reply.');
        }
    };
    

    const handleDeleteIssue = async (id) => {
        try {
            const response = await fetch(`/api/users/issues/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete issue');
            fetchIssues();
            toast.success('Issue deleted successfully!');
        } catch (error) {
            console.error('Error deleting issue:', error);
            toast.error('Failed to delete issue.');
        }
    };
    

    const handleChangeStatus = async (id, newStatus) => {
        try {
            const response = await fetch(`/api/users/issues/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (!response.ok) throw new Error('Failed to update status');
            toast.success('Issue Status Change successfully!');
            fetchIssues();
        } catch (error) {
            toast.error('Error updating status.');
            console.error('Error updating status:', error);
        }
    };

    const handleSearch = (event) => {
        const searchValue = event.target.value.toLowerCase();
        setSearchTerm(searchValue);

        if (searchValue) {
            const filtered = issues.filter(issue =>
                issue.issue.toLowerCase().includes(searchValue) ||
                issue.issueId.toLowerCase().includes(searchValue) ||
                issue.status.toLowerCase().includes(searchValue)
            );
            setFilterIssues(filtered);
        } else {
            // If searchValue is empty, reset to show all data
            setFilterIssues(issues);
        }
    };

    const convertDateToReadableFormat = (isoDateString) => {
        const dateObj = new Date(isoDateString);
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = dayNames[dateObj.getDay()];
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const monthName = monthNames[dateObj.getMonth()];
        const dayOfMonth = dateObj.getDate();
        const year = dateObj.getFullYear();
        
        const hours = dateObj.getHours();
        const minutes = dateObj.getMinutes();
        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
        return `${dayName}, ${monthName} ${dayOfMonth}, ${year} at ${formattedTime}`;
    };

    const openModal = (issue) => {
        setSelectedIssue(issue);
        setReplyText(''); // Clear the reply text when opening the modal
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedIssue(null);
        setReplyText('');
    };

    return (
        <div className='flex flex-col p-4 text-black'>
             <ToastContainer /> 
            <input
                type="text"
                placeholder="Search issues..."
                value={searchTerm}
                onChange={handleSearch}
                className="mb-4 w-fit px-4 py-2 border border-gray-300 rounded"
            />
            <div className='shadow-md overflow-x-auto'>
                <table className="w-full md:max-w-[calc(100% - 20px)] bg-white border border-gray-300">
                    <thead>
                        <tr>
                            <th className="py-2 px-2 bg-blue-500 text-white border-b">Sl No.</th>
                            <th className="py-2 px-2 bg-blue-500 text-white border-b">Issue ID</th>
                            <th className="py-2 px-2 bg-blue-500 text-white border-b">Issue</th>
                            <th className="py-2 px-2 bg-blue-500 text-white border-b">Reported Time</th>
                            <th className="py-2 px-2 bg-blue-500 text-white border-b">Reported By</th>
                            <th className="py-2 px-2 bg-blue-500 text-white border-b">Action</th>
                            <th className="py-2 px-2 bg-blue-500 text-white border-b">Send Reply</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filterIssues.map((issue, index) => (
                            <tr key={index}>
                                <td className="py-2 px-4 border-b">{index + 1}</td>
                                <td className="py-2 px-4 border-b max-w-[200px] overflow-hidden overflow-ellipsis">{issue.issueId}</td>
                                <td className="py-2 px-4 border-b max-w-[200px] overflow-hidden overflow-ellipsis">{issue.issue}</td>
                                <td className="py-2 px-4 border-b max-w-[200px] overflow-hidden overflow-ellipsis">{convertDateToReadableFormat(issue.repotedTime)}</td>
                                <td className="py-2 px-4 border-b max-w-[200px] overflow-hidden overflow-ellipsis">{issue.repotedBy.name}</td>
                                <td className="py-2 px-4 border-b">
                                    <div className="flex gap-2 items-center">
                                        <select
                                            value={issue.status}
                                            onChange={(e) => handleChangeStatus(issue._id, e.target.value)}
                                            className="border border-gray-300 rounded"
                                        >
                                            {dropdownOptions.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                        <MdDelete className='cursor-pointer text-red-500' onClick={() => handleDeleteIssue(issue._id)} />
                                    </div>
                                </td>
                                <td className="py-2 px-4 border-b">
                                    <button
                                        onClick={() => openModal(issue)}
                                        className="bg-blue-500 text-white px-2 py-1 rounded"
                                    >
                                        Send Reply
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-4 rounded shadow-lg w-[500px]">
                        <h2 className="text-xl font-bold mb-4">Send Reply</h2>
                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full border border-gray-300 p-2 rounded mb-4"
                            rows="5"
                            placeholder="Type your reply here..."
                        ></textarea>
                        <div className="flex justify-end">
                            <button
                                onClick={closeModal}
                                className="bg-gray-500 text-white px-4 py-1 rounded mr-2 w-fit"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendReply}
                                className="bg-blue-500 text-white px-4 py-1 rounded w-fit"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IssueReport;
