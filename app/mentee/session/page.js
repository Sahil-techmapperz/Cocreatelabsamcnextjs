"use client";

import React, { useEffect, useState } from 'react';
import Video1 from '@/public/assets/Video.png';
import { PiBookOpen } from "react-icons/pi";
import { MdEdit, MdDelete } from "react-icons/md";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { checkSessionExpiration } from '@/lib/checkSessionExpiration';
// import RescheduleModal from '@/components/RescheduleModal';

const Session = () => {
    const [currentCategory, setCurrentCategory] = useState('all Sessions');
    const [sessions, setSessions] = useState([]);
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
    const [sessionToReschedule, setSessionToReschedule] = useState(null);
    const [lastWeekSessions, setLastWeekSessions] = useState([]);
    const [previousWeekRange, setPreviousWeekRange] = useState("");
    const [nextSession, setNextSession] = useState(null);

    const router = useRouter();


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
        GetSession();
        GetNextSession();
        GetLastWeekSessions();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric' }).format(date);
        const month = new Intl.DateTimeFormat('en-GB', { month: 'long' }).format(date);
        const year = new Intl.DateTimeFormat('en-GB', { year: 'numeric' }).format(date);
        const time = new Intl.DateTimeFormat('en-GB', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        }).format(date);

        return `${day} ${month} ${year}, at ${time}`;
    };

    // const openRescheduleModal = (session) => {
    //     setSessionToReschedule(session);
    //     setIsRescheduleModalOpen(true);
    // };

    // const closeRescheduleModal = () => {
    //     setIsRescheduleModalOpen(false);
    // };

    // const handleReschedule = (rescheduledData) => {
    //     const url = `${BaseUrl}/api/session/rescheduled/${rescheduledData.sessionId}`;

    //     fetch(url, {
    //         method: 'PATCH',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify(rescheduledData),
    //     })
    //     .then((response) => {
    //         if (!response.ok) {
    //             throw new Error('Failed to reschedule session');
    //         }
    //         return response.json();
    //     })
    //     .then((res) => {
    //         const response = categorizeSessions(res.data);
    //         setSessions(response);
    //     })
    //     .catch((error) => {
    //         console.error('Error rescheduling session:', error);
    //     });
    // };

    const handleDelete = (session) => {
      const isConfirmed = window.confirm('Are you sure you want to delete this session?');
  
      if (isConfirmed) {
          const url = `/api/sessions/cancel/byclient/${session.session_id}`;
  
          fetch(url, {
              method: 'PATCH',
              headers: {
                  'Content-Type': 'application/json',
              },
          })
          .then((response) => {
              // Check if the response status is not OK (not 200-299)
              if (!response.ok) {
                  return response.json().then((errorData) => {
                      // If the server returns a JSON error message, use it
                      toast.error(errorData.message || 'Failed to delete session');
                      throw new Error(errorData.message || 'Failed to delete session');
                  });
              }
              return response.json();
          })
          .then((res) => {
              toast.success('Session deleted successfully');
              const response = categorizeSessions(res.data);
            //   setSessions(response);
              GetSession();
          })
          .catch((error) => {
              // This will catch both network errors and errors thrown in the previous .then
              console.error('Error:', error);
          });
      }
  };

    const convertSession = (session) => {
        const {
            _id,
            title,
            startTime,
            endTime,
            mentor,
        } = session;

        const start = new Date(startTime);
        const end = new Date(endTime);

        const classTime = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')} - ${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;

        const classDay = start.toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
        });

        const now = new Date();
        const timeDiff = Math.abs(start - now);
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        const scheduledTime = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        return {
            title,
            session_id: _id,
            details: {
                classTime,
                classDay,
                scheduledTime,
            },
            member: {
                id: mentor._id,
                name: mentor.name,
                profileImage: mentor.profilePictureUrl,
            },
        };
    };

    const categorizeSessions = (Allsessions) => {
        const categories = {
            'all Sessions': [],
            scheduled: [],
            rescheduled: [],
            completed: [],
            cancelled: [],
        };

        Allsessions.forEach((session) => {
            const convertedSession = convertSession(session);
            categories['all Sessions'].push(convertedSession);

            switch (session.status) {
                case 'upcoming':
                    categories.scheduled.push(convertedSession);
                    break;
                case 'Reschedule':
                    categories.rescheduled.push(convertedSession);
                    break;
                case 'completed':
                    categories.completed.push(convertedSession);
                    break;
                case 'Canceled':
                    categories.cancelled.push(convertedSession);
                    break;
            }
        });

        return categories;
    };

    const GetSession = () => {
        const url = `/api/sessions/all/byclient`;

        fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        }).then(response => response.json()).then(res => { 
            const response = categorizeSessions(res.data || []);
            setSessions(response);
        });
    };

    const GetNextSession = () => {
        const url = `/api/sessions/next/byclient`;

        fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        }).then(response => response.json()).then(res => { 
            setNextSession(res.sessionData || []);
        });
    };

    const GetLastWeekSessions = () => {
        const url = `/api/sessions/previousweek/byclient`;

        fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        }).then(response => response.json()).then(res => { 
            setLastWeekSessions(res.sessions);
            setPreviousWeekRange(res.previousWeekRange);
        });
    };

        // Function to handle category change
        const handleCategoryChange = (category) => {
          setCurrentCategory(category);
      };

    return (
        <div className='w-full'>
          <ToastContainer/>
            {nextSession ? (
                <div className='flex justify-between bg-black px-4 py-2 rounded-md mt-2'>
                    <div className='flex justify-between items-center gap-2'>
                        <Image src={Video1} width={100} height={100} className='w-[50px] object-contain' alt="Next Session" />
                        <p>Next Session: {nextSession.startDate} at {nextSession.startTimeFormatted} with {nextSession.Client.name}</p>
                    </div>
                    <div className='flex justify-between items-center gap-2'>
                        <p>Time Left: {nextSession.timeLeft}</p>
                        <a target='_blank' href={nextSession.sessionLink}>
                            <div className='flex justify-between items-center gap-2'>
                                <div className='bookOpen'>
                                    <PiBookOpen />
                                </div>
                                <p>Enter Session</p>
                            </div>
                        </a>
                    </div>
                </div>
            ) : (
                <div className='noSessionAvailable flex items-center justify-center w-full h-[60px] rounded-md my-2 bg-black text-white'>
                    <p>No upcoming sessions available</p>
                </div>
            )}

            <div className='flex shadow-md md:h-[77vh] overflow-y-auto max-md:flex-col gap-6 my-3 text-black'>
                <div className='md:w-[50vw] w-full shadow-md md:h-full overflow-y-auto p-4 rounded-md bg-gray-50'>
                    <div className='flex my-4 overflow-x-auto'>
                        <div className='flex space-x-4 min-w-max'>
                            {sessions && Object.keys(sessions).map((category, index) => (
                                <button
                                    key={index}
                                    className={`w-[120px] h-10 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-md shadow-md ${currentCategory === category ? 'active' : 'hover:from-blue-600 hover:to-blue-700'
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 ease-in-out`}
                                    onClick={() => handleCategoryChange(category)}
                                >
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className='flex flex-col gap-4 w-[100%] overflow-hidden'>
                        {sessions[currentCategory] && sessions[currentCategory].map((session, index) => (
                            <div key={index} className='rounded-md flex max-md:flex-col justify-around bg-white shadow p-4'>
                                <div>
                                    <p className='font-bold'>{session.title}</p>
                                    <ul className='list-disc pl-5'>
                                        <li>Class Time: <b>{session.details.classTime}</b></li>
                                        <li>Class Day: <b>{session.details.classDay}</b></li>
                                        <li>Scheduled Time: <b>{session.details.scheduledTime}</b></li>
                                    </ul>
                                </div>

                                <div>
                                    <p className='font-bold'>Member</p>
                                    <div className='flex items-center gap-2 mt-[10px]'>
                                        <img className='w-10 h-10 rounded-full' src={session.member.profileImage} alt='Member Profile' />
                                        <p>{session.member.name}</p>
                                    </div>
                                </div>

                                {currentCategory !== 'completed' && currentCategory !== 'cancelled' && (
                                    <div className='flex gap-4 mt-2 justify-center items-center'>
                                        <div
                                            className='flex gap-1 justify-center items-center cursor-pointer text-red-600'
                                            onClick={() => handleDelete(session)}
                                        >
                                            <MdDelete />
                                            <p>Cancel</p>
                                        </div>
                                        {/* <div
                                            className='flex gap-1 justify-center items-center cursor-pointer hover:text-green-600'
                                            onClick={() => openRescheduleModal(session)}
                                        >
                                            <MdEdit />
                                            <p>Reschedule</p>
                                        </div> */}
                                        {/* {sessionToReschedule && sessionToReschedule.member && (
                                            <RescheduleModal
                                                isOpen={isRescheduleModalOpen}
                                                onClose={closeRescheduleModal}
                                                session={sessionToReschedule}
                                                onReschedule={handleReschedule}
                                            />
                                        )} */}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className='md:w-[30vw] w-full shadow-md md:h-full overflow-y-auto p-2 rounded-md'>
                    <div className='flex justify-between'>
                        <p>Last Week Sessions</p>
                        <div>
                            <p>{previousWeekRange && previousWeekRange}</p>
                        </div>
                    </div>
                    <div className='flex justify-center'>
                        {Array.isArray(lastWeekSessions) && lastWeekSessions.length > 0 ? (
                            lastWeekSessions.map((session, index) => (
                                <div key={index} className="lastWeekNews mt-[10px]">
                                    <div className="classNews">
                                        <div>
                                            <p><strong>{session.title}</strong></p>
                                            <p>{formatDate(session.startTime)}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p>Earnings</p>
                                        <div className="text-green-500">
                                            {session.mentor.rate || "N/A"}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className='font-bold'>No last week sessions found</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Session;
