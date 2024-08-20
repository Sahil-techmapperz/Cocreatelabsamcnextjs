"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import moment from 'moment-timezone';
import { FaStar, FaStarHalfAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import Image from 'next/image';
import SessionImg from '@/public/assets/GroupSession.png';
import { checkSessionExpiration } from '@/lib/checkSessionExpiration';

const Introduction = () => {
    const { mentorId } = useParams();
    const token = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("token")) || "" : "";

    const [mentorDetails, setMentorDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [error, seterror] = useState(false);
    const [availability, setAvailability] = useState([]);
    const [userTimeZone, setUserTimeZone] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [ratings, setRatings] = useState([]);
    const [showReviews, setShowReviews] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        description: "",
        title: "",
        dateTime: "",
        duration: 0.5,
        rating: 1,
        review: ""
    });

    const router = useRouter();

    const [isModalOpen, setModalOpen] = useState(false);

    const openModal = () => {
        if (!userTimeZone) {
            alert('You need to set your time zone first.');
            return;
        }
        fetchAvailability();
        setModalOpen(true);
    };

    const closeModal = () => setModalOpen(false);

    const getMentorDetails = async () => {
        try {
            if (mentorId) {
                let response = await fetch(`/api/users/mentors/${mentorId}`);
                response = await response.json();
                setMentorDetails(response);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching mentor details:', error);
            setLoading(false);
        }
    };

    const fetchAvailability = async () => {
        try {
            let response = await fetch(`/api/users/availability/${mentorId}`);
            response = await response.json();
            setUserTimeZone(response.timeZone);
            setAvailability(response.availability);
        } catch (error) {
            console.error('Error fetching availability:', error);
        }
    };

    const fetchRatings = async () => {
        try {
            let response = await fetch(`/api/users/mentors/rating/${mentorId}`);
            response = await response.json();
            setRatings(response.ratings);
        } catch (error) {
            console.error('Error fetching ratings:', error);
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

    useEffect(() => {
        if (mentorId) {
            getMentorDetails();
            fetchAvailability();
            fetchRatings();
        }
    }, [mentorId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const bookingData = {
            mentorId,
            title: formData.title,
            description: formData.description,
            startTime: formData.dateTime,
            hours: formData.duration,
        };

        try {
            let response = await fetch(`/api/sessions/booking`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(bookingData),
            });
            response = await response.json();
            alert(`Success: ${response.message}`);
            setSubmitSuccess(true);
            closeModal();
        } catch (error) {
            console.error('Error booking session:', error.message);
        }
    };




    const convertDateToReadableFormat = (isoDateString) => {
        const dateObj = moment.tz(isoDateString, userTimeZone);
        return dateObj.format('MMMM Do YYYY, h:mm a');
    };

    const calculateDuration = (start, end) => {
        const startDate = moment.tz(start, userTimeZone);
        const endDate = moment.tz(end, userTimeZone);
        const duration = moment.duration(endDate.diff(startDate));
        const hours = Math.floor(duration.asHours());
        const minutes = duration.minutes();

        if (hours > 0) {
            return `${hours}h`;
        } else if (minutes > 0) {
            return `${minutes}m`;
        }
        return '0m';
    };

    const handleReviewButton = () => {
        setIsReviewModalOpen(true);
    };

    const toggleReviews = () => {
        setShowReviews(!showReviews);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        const rating = formData.rating;
        const review = formData.review;

        try {
            let response = await fetch(`/api/users/mentors/rating/${mentorId}`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ rating, review }),
            });
            response = await response.json();
            setSubmitSuccess(true);
            setFormData({ ...formData, rating: 1, review: '' });
            setIsReviewModalOpen(false);
            fetchRatings(); // Refresh the reviews after submission
        } catch (error) {
            console.error('Error submitting review:', error.message);
            seterror(error.message);
        }
    };


    const handleDateClick = (time) => {
        const duration = calculateDuration(time.start, time.end).replace('h', ' hours').replace('m', ' minutes');
        setFormData({
            ...formData,
            dateTime: time.start,
            duration: duration.includes('hours') ? parseInt(duration) : 0.5
        });
        setSelectedDate(time.start);
    };

    return (
        <>
            <div className="flex gap-[30px] text-black md:overflow-y-hidden">
                <div className="w-[100%] relative max-sm:ml-[0px] max-sm:w-[100%]">
                    <div className="mt-[15px] pt-[10px] pr-[15px] pb-[10px] pl-[0px] max-sm:mt-[0px] max-sm:p-[15px] overflow-x-auto">
                        <h1 className="text-xl font-bold">Introduction Sessions</h1>
                        <div className=" md:overflow-hidden pb-[10px]">
                            {mentorDetails && (
                                <>
                                    {mentorDetails && mentorDetails.introductionvideoUrl ? (
                                        <video className="mt-4 h-[50dvh] w-full max-sm:w-72 max-sm:h-60" controls>
                                            <source src={mentorDetails.introductionvideoUrl} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    ) : (
                                        <Image className="mt-[10px] h-[500px] w-[100%] max-sm:w-[350px] max-sm:h-[250px]" src={SessionImg} alt="Session" />
                                    )}

                                    <div className="flex gap-[10px] mt-[10px]">
                                        <p className="text-[18px]">Session Taken by</p>
                                        <p><strong>Name:</strong> {mentorDetails.name}</p>
                                    </div>
                                    <div className="flex justify-between mt-[8px] w-[100%]">
                                        <ul className="flex gap-[20px]">
                                            <li className="flex justify-center text-yellow-500 items-center text-[24px]">
                                                {[...Array(Math.floor(mentorDetails.avgRating))].map((_, i) => (
                                                    <FaStar key={i} />
                                                ))}
                                                {mentorDetails.avgRating % 1 >= 0.5 && <FaStarHalfAlt />}
                                            </li>
                                            <li className="flex font-bold text-18 justify-center items-center">{mentorDetails.ratings?.length}</li>
                                        </ul>
                                        <div className='flex'>
                                            <button className='bg-blue-700 p-2 rounded-md text-white' onClick={openModal}>Book a Session</button>
                                            <button className='bg-green-500 p-2 ml-4 rounded-md text-white' onClick={handleReviewButton}>Write a Review</button>
                                        </div>
                                    </div>
                                    <div className="flex mt-[8px]">
                                        <p className="text-gray-600 text-[20px] font-bold">Description: {mentorDetails.description || 'No description provided'}</p>
                                    </div>

                                    <button onClick={toggleReviews} className='bg-blue-500 p-2 mt-4 rounded-md text-white flex items-center w-fit'>
                                        {showReviews ? <FaEyeSlash /> : <FaEye />} <span className='ml-2'>{showReviews ? 'Hide' : 'Show'} Reviews</span>
                                    </button>

                                    {showReviews && (
                                        <div className="reviews mt-4">
                                            {ratings.map((rating) => (
                                                <div key={rating._id} className="review flex gap-2">
                                                    <div className="reviewer-info">
                                                        <img src={rating.reviewerProfilePictureUrl} alt={rating.reviewerName} className="reviewer-image w-[60px] h-[60px] rounded-[50%]" />
                                                        <span className="reviewer-name">{rating.reviewerName}</span>
                                                    </div>
                                                    <div className='flex flex-col justify-center'>
                                                        <div className="rating flex gap-2">
                                                            {Array(rating.rating).fill(<FaStar />)}
                                                        </div>
                                                        <p className="review-text">{rating.review}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Inline Modal Component */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black text-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full relative">
                        <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                            onClick={closeModal}
                        >
                            &times;
                        </button>
                        <div className="flex justify-between">
                            <div className="w-1/2 p-4">
                                <form onSubmit={handleSubmit} className="max-w-lg w-full mx-auto space-y-6">
                                    <div className="flex flex-col">
                                        <label htmlFor="title" className="text-sm font-medium text-gray-700">Title:</label>
                                        <input
                                            type="text"
                                            id="title"
                                            value={formData.title || ''}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                            className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                        <div className="text-red-600 text-xs mt-1 hidden">
                                            Please enter a title.
                                        </div>
                                    </div>

                                    <div className="flex flex-col">
                                        <label htmlFor="description" className="text-sm font-medium text-gray-700">Description:</label>
                                        <textarea
                                            id="description"
                                            value={formData.description || ''}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            required
                                            className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        ></textarea>
                                        <div className="text-red-600 text-xs mt-1 hidden">
                                            Please enter a description.
                                        </div>
                                    </div>


                                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
                                        Submit
                                    </button>
                                </form>

                            </div>

                            <div className={`p-4  overflow-y-auto bg-gray-100 rounded-lg ${availability.length === 0 ? 'w-[90%]' : 'w-1/2'}`}>
                                <h3 className="text-lg font-semibold mb-4">Available Time Slots</h3>
                                {availability.length > 0 ? (
                                    <div className="space-y-2">
                                        {availability.map((time, index) => (
                                            <div
                                                key={index}
                                                className={`p-2 rounded-md cursor-pointer ${selectedDate === time.start ? 'bg-green-700 text-white' : 'bg-green-500 text-white'}`}
                                                onClick={() => handleDateClick(time)}
                                            >
                                                {convertDateToReadableFormat(time.start)} ({calculateDuration(time.start, time.end)})
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm font-medium text-gray-700">No availability set.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal Component */}
            {isReviewModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center text-black bg-black bg-opacity-50 z-50">
                    <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
                        <button
                            className="absolute top-2 right-2 text-4xl text-gray-500 hover:text-gray-800"
                            onClick={() => setIsReviewModalOpen(false)}
                        >
                            &times;
                        </button>
                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <h3 className="text-xl font-semibold mb-4">Submit Your Review</h3>

                            <div>
                                <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
                                    Rating:
                                </label>
                                <select
                                    id="rating"
                                    value={formData.rating || 1}
                                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                                    className="block w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    required
                                >
                                    {[1, 2, 3, 4, 5].map(option => (
                                        <option key={option} value={option}>
                                            {option} <FaStar className="inline-block text-yellow-500" />
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="review" className="block text-sm font-medium text-gray-700">
                                    Review:
                                </label>
                                <textarea
                                    id="review"
                                    value={formData.review || ''}
                                    onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                                    className="block w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    rows="4"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md"
                            >
                                Submit Review
                            </button>

                            {submitSuccess && <p className="text-green-500 mt-2">Review submitted successfully!</p>}
                            {error && <p className="text-red-500 mt-2">{error}</p>}
                        </form>
                    </div>
                </div>

            )}


        </>
    );
};

export default Introduction;
