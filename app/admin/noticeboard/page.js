"use client";
import { checkSessionExpiration } from '@/lib/checkSessionExpiration';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';

function NoticeBoard() {
    const [articles, setArticles] = useState([]);
    const [currentArticle, setCurrentArticle] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

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
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            const response = await fetch('/api/article', {
                headers: { "Content-Type": "application/json" }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const articles = await response.json();
            setArticles(articles);
        } catch (error) {
            console.error('Error fetching articles:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setCurrentArticle(prev => ({ ...prev, [name]: files ? files[0] : value }));
    };

    const handleAdd = async (e) => {
        e.preventDefault();
    
        // Check if all required fields are filled
        if (!currentArticle.title || !currentArticle.description || !currentArticle.bannerImage) {
            console.error('Please fill out all required fields');
            return;
        }
    
        // Upload the banner image and get the URL
        let bannerUrl = null;
        if (currentArticle.bannerImage) {
            bannerUrl = await handlefileupload(currentArticle.bannerImage);
        }
    
        // Create the JSON object with all the data
        const articleData = {
            title: currentArticle.title,
            description: currentArticle.description,
            bannerurl: bannerUrl, // Include the banner URL if available
        };
    
        try {
            // Make a POST request with the JSON data as the body
            const response = await fetch('/api/article', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json', // Set the request headers to JSON
                },
                body: JSON.stringify(articleData),
            });
    
            // Handle the response
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            // Refresh articles list, close modal, and reset currentArticle
            fetchArticles();
            setModalOpen(false);
            setCurrentArticle(null);
        } catch (error) {
            console.error('Error adding article:', error);
        }
    };
    

    const handleEdit = async (e) => {
        e.preventDefault();
    
        // Upload the banner image and get the URL if a new image is provided
        let bannerUrl = currentArticle.bannerurl; // Default to existing banner URL if present
        if (currentArticle.bannerImage && typeof currentArticle.bannerImage !== 'string') {
            bannerUrl = await handlefileupload(currentArticle.bannerImage);
        }
    
        // Create the JSON object with all the data
        const articleData = {
            title: currentArticle.title,
            description: currentArticle.description,
            bannerurl: bannerUrl, // Include the new or existing banner URL
        };
    
        try {
            const response = await fetch(`/api/article/${currentArticle._id}`, {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json', // Ensure the request is sent as JSON
                },
                body: JSON.stringify(articleData),
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            // Fetch the updated list of articles, close the modal, and reset the current article state
            fetchArticles();
            setEditModalOpen(false);
            setCurrentArticle(null);
        } catch (error) {
            console.error('Error editing article:', error);
        }
    };
    

    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/article/${currentArticle._id}`, {
                method: "DELETE"
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            fetchArticles();
            setDeleteConfirmOpen(false);
        } catch (error) {
            console.error('Error deleting article:', error);
        }
    };

    const handlefileupload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`/api/upload`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const { url } = await response.json(); // Ensure response.json() is awaited
            return url;
        } catch (error) {
            console.error('Error uploading file:', error);
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
        return `${dayName}, ${monthName} ${dayOfMonth} ${year}`;
    };

    return (
        <div className='flex flex-col bg-gray-100 p-4 text-black'>
            <button onClick={() => { setModalOpen(true); setCurrentArticle({ title: '', description: '', bannerimage: null }); }} className="mb-4 bg-blue-500 w-fit hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Add Article</button>
            {articles.map((article) => (
                <div key={article._id} className="flex gap-4 p-4 bg-white rounded-lg shadow mb-4 relative">
                    <img src={article.bannerimage || '/placeholder.png'} alt={article.title} className="w-40 h-40 rounded-lg object-cover" />
                    <div className="flex flex-col justify-between flex-1">
                        <div>
                            <h5 className="text-lg font-bold">{article.title}</h5>
                            <p className="text-gray-600 text-sm">{article.description}</p>
                            <p className="text-xs text-gray-500">{convertDateToReadableFormat(article.createdAt)}</p>
                        </div>
                        <div className="flex gap-0 absolute top-0 right-2">
                            <button onClick={() => { setEditModalOpen(true); setCurrentArticle(article); }} className=" text-gray-500 py-2 px-4 rounded">
                                <span><FaEdit/></span>
                            </button>
                            <button onClick={() => { setDeleteConfirmOpen(true); setCurrentArticle(article); }} className="text-red-600 py-2 px-4 rounded">
                                <span><FaTrashAlt/></span>
                            </button>
                        </div>
                        <div className='flex justify-between'>
                            <p className='font-bold'>{article.author}</p>
                            <p>{convertDateToReadableFormat(article.date)}</p>
                        </div>
                    </div>
                </div>
            ))}


            {modalOpen && (
                <Modal title="Add New Article" onClose={() => setModalOpen(false)} onSave={handleAdd}>
                    <ArticleForm article={currentArticle} onChange={handleChange} />
                </Modal>
            )}

            {editModalOpen && (
                <Modal title="Edit Article" onClose={() => setEditModalOpen(false)} onSave={handleEdit}>
                    <ArticleForm article={currentArticle} onChange={handleChange} />
                </Modal>
            )}

            {deleteConfirmOpen && (
                <ConfirmationDialog
                    show={deleteConfirmOpen}
                    onClose={() => setDeleteConfirmOpen(false)}
                    onConfirm={handleDelete}
                    message="Are you sure you want to delete this article?"
                />
            )}
        </div>
    );
}

function Modal({ title, onClose, onSave, children }) {
    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-white p-6 rounded-lg shadow-lg w-[400px]'>
                <h2 className='text-xl font-bold mb-4'>{title}</h2>
                {children}
                <div className='flex justify-end gap-2 mt-4'>
                    <button onClick={onSave} className='bg-blue-500 text-white py-2 px-4 rounded'>Save</button>
                    <button onClick={onClose} className='bg-gray-300 text-black py-2 px-4 rounded'>Cancel</button>
                </div>
            </div>
        </div>
    );
}

function ArticleForm({ article, onChange }) {
    return (
        <form className='flex flex-col gap-4'>
            <label>
                Title:
                <input type="text" name="title" value={article.title || ""} onChange={onChange} className="form-input w-full p-2 border border-gray-300 rounded-lg" />
            </label>
            <label>
                Description:
                <textarea name="description" value={article.description || ""} onChange={onChange} className="form-textarea w-full p-2 border border-gray-300 rounded-lg"></textarea>
            </label>
            <label>
                Banner Image:
                <input type="file" name="bannerImage" onChange={onChange} className="form-input w-full p-2 border border-gray-300 rounded-lg" />
            </label>
        </form>
    );
}

function ConfirmationDialog({ show, onClose, onConfirm, message }) {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-xl max-w-sm w-full">
                <p>{message}</p>
                <div className="flex justify-end gap-4 mt-4">
                    <button onClick={onConfirm} className="bg-red-500 text-white px-4 py-2 rounded">Confirm</button>
                    <button onClick={onClose} className="bg-gray-300 text-black px-4 py-2 rounded">Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default NoticeBoard;
