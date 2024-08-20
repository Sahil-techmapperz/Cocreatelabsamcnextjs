"use client";

import React, { useEffect, useState } from 'react';
import { FaStar, FaStarHalfAlt, FaCoins } from "react-icons/fa";
import { IoLocation } from "react-icons/io5";
import { IoMdContact } from "react-icons/io";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { checkSessionExpiration } from '@/lib/checkSessionExpiration';


const ClientDashboard = () => {
    const [mentees, setMentees] = useState([]);
    const [mostViewedMentors, setMostViewedMentors] = useState([]);

    const router = useRouter();

    const getMentors = async () => {
        try {
            const res = await fetch(`/api/users/all/mentees`);

            const data = await res.json();

            if (Array.isArray(data)) {
                // const nonAdminMentees = data.filter(mentee => mentee.role !== 'Admin');
                const menteesWithAvgRating = data.map(mentee => {
                    const totalRatings = mentee.ratings.reduce((acc, val) => acc + val.rating, 0);
                    const averageRating = mentee.ratings.length > 0 ? totalRatings / mentee.ratings.length : 0;
                    return { ...mentee, averageRating };
                });

                menteesWithAvgRating.sort((a, b) => b.averageRating - a.averageRating);

                setMentees(menteesWithAvgRating);
            } else {
                console.error('Data fetched is not an array:', data);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const getMostViewedMentors = async () => {
        try {
            const res = await fetch(`/api/users/mentors/most-viewed`);

            const data = await res.json();

            if (Array.isArray(data)) {
                const MostViewedMentors = data[0].mentorInfo.map(mentor => {
                    const totalRatings = mentor.ratings.reduce((acc, val) => acc + val.rating, 0);
                    const averageRating = mentor.ratings.length > 0 ? totalRatings / mentor.ratings.length : 0;
                    return { ...mentor, averageRating };
                });
                setMostViewedMentors(MostViewedMentors);
            } else {
                console.error('Data fetched is not an array:', data);
            }
        } catch (error) {
            console.error('Error:', error);
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
        getMentors();
        getMostViewedMentors();
    }, []);

    return (
        <div className='w-[100%] max-sm:ml-[0px] overflow-y-hidden text-black'>
            <div className='w-[100%] h-[90vh] overflow-y-auto'>
                <div className='max-md:m-[15px]'>
                    <div className='flex justify-between mt-[6px] pt-[20px] pr-[20px] pb-[2px] pl-[0px]'>
                        <h1 className='text-xl font-bold'>Top Mentors</h1>
                        <h1 className='text-blue-500 font-bold flex justify-center items-center'>
                            <u>View All</u>
                        </h1>
                    </div>
                    <div className='pt-[10px] pr-[10px] pb-[10px] topMentor grid grid-cols-1 text-black md:grid-cols-4 gap-2 '>
                        {mentees && mentees.map((mentee, index) => (
                            <div
                                key={index}
                                className="mt-3 max-w-sm rounded overflow-hidden shadow-lg bg-white mb-4"
                                style={{ maxHeight: '350px' }}
                            >
                                <img
                                    className="w-full"
                                    src={mentee.profilePictureUrl || ''}
                                    alt=""
                                    style={{ height: '150px', objectFit: 'cover' }}
                                />
                                <div className="px-4 py-2">
                                    <div className="font-bold text-xl mb-1">{mentee.name}</div>
                                    <p className="text-gray-700 text-base mb-1">
                                        {mentee.skills.length === 0 ? "No skills listed" : mentee.skills.join(", ")}
                                    </p>
                                    <div className="flex justify-between pt-2 pb-1">
                                        <div className="flex items-center mb-1">
                                            <span className="flex text-yellow-400">
                                                {
                                                    [...Array(Math.floor(mentee.averageRating))].map((_, i) => (
                                                        <FaStar key={i} />
                                                    ))
                                                }
                                                {mentee.averageRating % 1 >= 0.5 && <FaStarHalfAlt />}
                                            </span>
                                            <span className="ml-2 text-gray-600">
                                                {mentee.ratings.length} Rating{mentee.ratings.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <FaCoins />
                                            <span className="text-blue-500">{mentee.rate}</span>
                                        </div>
                                    </div>
                                    <div className='flex justify-between pt-2 pb-1'>
                                        <div className="flex justify-center items-center gap-2 pt-2 pb-1">
                                            <IoLocation />
                                            <span className="ml-2 text-gray-600">{mentee.location ? `${mentee.location.city ? mentee.location.city :"Unknown" }` : 'Unknown'}</span>
                                        </div>
                                        <div className="flex justify-center items-center gap-2 pt-2 pb-1">
                                            <IoMdContact />
                                            <span className="text-gray-600">{mentee.sessionCount || 0} Mentees</span>
                                        </div>
                                    </div>
                                    <Link href={`/mentee/introduction/${mentee._id}`}>
                                        <button className="bg-blue-500 w-full hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                            Know more
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className='max-md:m-[15px]'>
                    <div className='flex justify-between mt-[6px] pt-[20px] pr-[20px] pb-[2px] pl-[0px]'>
                        <h1 className='text-xl font-bold'>Most Viewed Mentors</h1>
                        <h1 className='text-blue-500 font-bold flex justify-center items-center'>
                            <u>View All</u>
                        </h1>
                    </div>
                    <div className='pt-[10px] pr-[10px] pb-[10px] topMentor grid grid-cols-1 md:grid-cols-4 gap-2 '>
                        {mostViewedMentors && mostViewedMentors.map((mentor, index) => (
                            <div
                                key={index}
                                className="mt-3 max-w-sm rounded overflow-hidden shadow-lg bg-white mb-4"
                                style={{ maxHeight: '350px' }}
                            >
                                <img
                                    className="w-full"
                                    src={mentor && mentor.profilePictureUrl || ''}
                                    alt=""
                                    style={{ height: '150px', objectFit: 'cover' }}
                                />
                                <div className="px-4 py-2">
                                    <div className="font-bold text-xl mb-1">{mentor && mentor.name}</div>
                                    <p className="text-gray-700 text-base mb-1">
                                        {mentor && mentor.skills.length === 0 ? "No skills listed" : mentor && mentor.skills.join(", ")}
                                    </p>
                                    <div className="flex justify-between pt-2 pb-1">
                                        <div className="flex items-center mb-1">
                                            <span className="flex text-yellow-400">
                                                {
                                                    [...Array(Math.floor(mentor && mentor.averageRating))].map((_, i) => (
                                                        <FaStar key={i} />
                                                    ))
                                                }
                                                {mentor && mentor.averageRating % 1 >= 0.5 && <FaStarHalfAlt />}
                                            </span>
                                            <span className="ml-2 text-gray-600">
                                                {mentor && mentor.ratings.length} Rating{mentor && mentor.ratings.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <FaCoins />
                                            <span className="text-blue-500">{mentor && mentor.rate}</span>
                                        </div>
                                    </div>
                                    <div className='flex justify-between pt-2 pb-1'>
                                        <div className="flex justify-center items-center gap-2 pt-2 pb-1">
                                            <IoLocation />
                                            <span className="ml-2 text-gray-600">{mentor && mentor.location ? `${mentor.location.city}` : 'Unknown'}</span>
                                        </div>
                                        <div className="flex justify-center items-center gap-2 pt-2 pb-1">
                                            <IoMdContact />
                                            <span className="text-gray-600">{mentor && mentor.sessionCount || 0} Mentees</span>
                                        </div>
                                    </div>
                                    <Link href={`/clientIntroSession/${mentor && mentor._id}`}>
                                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                            Know more
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ClientDashboard;
