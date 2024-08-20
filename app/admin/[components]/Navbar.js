"use client";

import React, { useState } from 'react';
import { FaBell } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { IoLogOutOutline } from "react-icons/io5";
import { RiMenu2Line } from "react-icons/ri";
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Logo from "@/public/assets/Logo1.png";
import dashboardImg from "@/public/assets/dashboard.png";
import openBook from "@/public/assets/open-book 1 (1).png";
import planning from "@/public/assets/planning 1.png";
import NoticeImage from "@/public/assets/clipboard-outline.png";
import messageImg from "@/public/assets/chat 1 (1).png";
import contact from "@/public/assets/account-circle.png";
import Cookies from "js-cookie";


const Navbar = () => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();  // Replacing useRouter with usePathname
    const route= useRouter();

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('expirationTime');
        Cookies.remove("token"); // Remove the token from cookies
        route.push("/mentee/login");
    };

    const menuItems = [
        { name: "Dashboard", path: "/mentee/dashbord", imgSrc: dashboardImg, altText: "Dashboard" },
        { name: "Session", path: "/mentee/session", imgSrc: openBook, altText: "Session" },
        { name: "Calendar", path: "/mentee/calender", imgSrc: planning, altText: "Session Calendar" },
        { name: "Notice Board", path: "/mentee/noticeboard", imgSrc: NoticeImage, altText: "Notice Board" },
        { name: "Messages", path: "/mentee/chat", imgSrc: messageImg, altText: "Messages" },
        { name: "My Account", path: "/mentee/account", imgSrc: contact, altText: "My Account" },
        { name: "My withdrawls", path: "/mentee/withdrawls", imgSrc: contact, altText: "withdrawls" }
    ];

    const MenuItem = ({ item }) => (
        <li className='pl-[5px] py-2 hover:bg-[#0078C5] hover:border-[1px]'>
            <Link href={item.path} className={`flex items-center gap-2 ${pathname === item.path ? 'bg-[#0078C5] border-[1px]' : 'text-black'}`}>
                    {/* <Image className='w-5 h-5 ' src={item.imgSrc} alt={item.altText} width={20} height={20} /> */}
                    <span className='w-[max-content]'>{item.name}</span>
            </Link>
        </li>
    );

    return (
        <nav className='w-full flex justify-between items-center bg-white py-4 px-6 shadow-md z-10'>
            <div className='flex items-center'>
                <RiMenu2Line className='md:hidden text-blue-500 text-2xl cursor-pointer' onClick={toggleMenu} />
                <Image src={Logo} alt='logo' className='w-40 h-auto md:hidden' width={160} height={60} />
                <h1 className='hidden md:block font-bold text-xl text-black uppercase'>{pathname.split("/")[1]}/{pathname.split("/")[2]}</h1>

                <input
                    type="text"
                    placeholder='Search Here'
                    className='hidden md:block border-2 border-gray-300 py-1 px-2 ml-4 rounded-md focus:outline-none focus:border-blue-500'
                />
            </div>

            <div className='flex items-center gap-4'>
                <IoMdSettings className='hidden md:block text-blue-500 text-2xl cursor-pointer' />
                <div className='relative'>
                    <div onClick={toggleNotifications} className='cursor-pointer'>
                        <FaBell className='text-blue-500 text-2xl' />
                        <div className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5'>
                            3
                        </div>
                    </div>
                    {showNotifications && (
                        <div className='z-50 absolute top-full mt-2 right-0 bg-white shadow-lg rounded-lg w-48 py-2'>
                            <p className='text-gray-700 text-sm px-4'>Your notifications go here.</p>
                        </div>
                    )}
                </div>
                <IoLogOutOutline className='text-red-500 text-2xl cursor-pointer' onClick={handleLogout} />
            </div>

            {isMenuOpen && (
                <div className='md:hidden z-30 flex flex-col absolute top-0 left-0 w-[50vw] h-[100vh] bg-white shadow-md py-2'>
                    <span onClick={toggleMenu} className="close-button cursor-pointer text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-xl p-1.5 ml-auto inline-flex items-center">&times;</span>
                    <ul className='flex flex-col gap-2'>
                        {menuItems.map(item => (
                            <MenuItem key={item.name} item={item} />
                        ))}
                    </ul>
                </div>
            )}
        </nav>
    );
}

export default Navbar;
