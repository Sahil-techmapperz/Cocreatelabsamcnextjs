"use client";

import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useRouter } from 'next/navigation';
import { checkSessionExpiration } from '@/lib/checkSessionExpiration';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ProgressBar = ({ progress, color, label }) => {
    return (
        <div className="mt-4">
            <div className="flex justify-between mb-1 text-sm font-medium">
                <span>{label}</span>
                <span>{`${progress.toFixed(2)}%`}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="h-2.5 rounded-full" style={{ width: `${progress}%`, backgroundColor: color }}></div>
            </div>
        </div>
    );
};


const UserCard = ({ user }) => {
    console.log(user);
    return (
        <div className='flex justify-between mt-[20px] rounded-lg bg-gray-100 p-[25px]'>
            <div>
                <p className='font-bold'>Name</p>
                <ul className='flex justify-between pt-[10px] gap-[10px]'>
                    <img className='h-[60px] w-[60px] rounded-full' src={user && user.profilePictureUrl} alt="New Joinee" />
                    <div>
                        <li className='font-bold'>{user && user.name}</li>
                        <li>
                            Mentor ID - {" "}
                            <span className='text-green-500'>
                                {user && user.uniqueUserId ? (
                                    user.uniqueUserId
                                ) : (
                                    <span className='text-red-700'>Not available</span>
                                )}
                            </span>
                        </li>

                    </div>
                </ul>
            </div>
            <div>
                <p className='font-bold'>Value</p>
                <ul>
                    <div className='flex justify-between gap-[30px]'>
                        <li>{user && user.walletBalance} CCL</li>
                    </div>
                </ul>
            </div>
        </div>
    );
};

const SuperAdminDashboard = () => {
    const [getAllMentee, setGetAllMentee] = useState([]);
    const [getAllMentor, setGetAllMentor] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [progressdata, setProgressdata] = useState([
        { progress: 0, color: "#4caf50", label: "Scheduled Session" },
        { progress: 0, color: "#00acc1", label: "Completed Session" },
        { progress: 0, color: "#f44336", label: "Cancel Session" },
    ]);
    const [totalYearRevenue, setTotalYearRevenue] = useState({ monthlyRevenue: [], monthlySessionRevenue: [] });
    const [cclRevenue, setCclRevenue] = useState(0);
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
        const fetchData = async () => {
            try {
                const revenueResponse = await fetch('/api/sessions/revenue/all', {
                    headers: {
                        "Content-Type": "application/json",
                    }
                });
                const revenueData = await revenueResponse.json();
                setTotalRevenue(revenueData.totalRevenue);
                setCclRevenue(revenueData.sessionRevenue);

                const userResponse = await fetch('/api/users/all', {
                    headers: {
                        "Content-Type": "application/json",
                    }
                });
                const users = await userResponse.json();
                setGetAllMentee(users.filter(user => user.role === 'Client'));
                setGetAllMentor(users.filter(user => user.role === 'Mentor'));

                const yearRevenueResponse = await fetch('/api/sessions/revenue/current-years', {
                    headers: {
                        "Content-Type": "application/json",
                    }
                });
                const yearRevenueData = await yearRevenueResponse.json();
                setTotalYearRevenue({
                    monthlyRevenue: yearRevenueData.monthlyRevenue,
                    monthlySessionRevenue: yearRevenueData.monthlySessionRevenue
                });

                const statsResponse = await fetch('/api/sessions', {
                    headers: {
                        "Content-Type": "application/json",
                    }
                });
                const statsData = await statsResponse.json();
                setProgressdata(prevState => prevState.map(data => ({
                    ...data,
                    progress: {
                        'Scheduled Session': statsData.scheduledPercentage,
                        'Completed Session': statsData.completedPercentage,
                        'Cancel Session': statsData.canceledPercentage
                    }[data.label] || data.progress
                })));
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        fetchData();
    }, []);

    const chartOptions = {
        plugins: {
            legend: {
                display: true,
            },
            title: {
                display: true,
                text: 'Monthly Revenue',
            },
        },
    };

    const chartData = {
        labels: totalYearRevenue.monthlyRevenue.map((_, index) => new Date(0, index + 1).toLocaleString('default', { month: 'short' })),
        datasets: [
            {
                label: 'Total Revenue',
                data: totalYearRevenue.monthlyRevenue,
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
            {
                label: 'Session Revenue',
                data: totalYearRevenue.monthlySessionRevenue,
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
        ],
    };

    return (
        <div className='flex flex-col text-black w-full min-h-screen bg-gray-100 p-6'>
            {/* <h1 className='text-2xl font-semibold mb-4'>Super Admin Dashboard</h1> */}
            <div className='grid grid-cols-2 gap-4 mb-4'>
                <div className='shadow-md rounded-md py-6 px-10 text-white' style={{ background: 'linear-gradient(176.83deg, #52E7CF 0.29%, #0096F6 3.41%, #1DB3E8 57.31%, #52E7CF 85.81%)' }}>
                    <h2 className='text-xl text-center font-bold mb-2'>Total Revenue</h2>
                    <p className='text-xl text-center'>{totalRevenue} CCL</p>
                </div>
                <div className='shadow-md rounded-md py-6 px-10 text-white' style={{ background: 'linear-gradient(176.83deg, #52E7CF 0.29%, #0096F6 3.41%, #1DB3E8 57.31%, #52E7CF 85.81%)' }}>
                    <h2 className='text-xl text-center font-bold mb-2'>CCL Revenue</h2>
                    <p className='text-xl text-center'>{cclRevenue} CCL</p>
                </div>
            </div>
            <div className='grid grid-cols-1 mb-4 md:grid-cols-2 gap-4 w-full'>
                <div className='bg-white p-4 shadow rounded-lg'>

                    <Bar options={chartOptions} data={chartData} />
                </div>
                <div className='bg-white p-4 shadow rounded-lg'>
                    <h2 className='text-[12px] text-center text-gray-600 font-bold mb-2'>Session Progress</h2>
                    {progressdata.map((data, index) => (
                        <ProgressBar key={index} progress={data.progress} color={data.color} label={data.label} />
                    ))}
                </div>
            </div>

            <div className='bg-white p-4  grid grid-cols-2 gap-4'>
                <div>
                    <h2 className='text-xl font-bold mb-2'>New Mentors</h2>
                    {getAllMentor.map(mentor => <UserCard key={mentor._id} user={mentor} />)}
                </div>
                <div>
                    <h2 className='text-xl font-bold mb-2 mt-4'>New Mentees</h2>
                    {getAllMentee.map(mentee => <UserCard key={mentee._id} user={mentee} />)}
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
