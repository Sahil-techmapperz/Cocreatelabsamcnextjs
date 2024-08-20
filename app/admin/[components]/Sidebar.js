"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BiMenu, BiSupport } from "react-icons/bi";
import Image from 'next/image';
import Logo from "@/public/assets/Logo1.png";
import dashboardImg from "@/public/assets/dashboard.png";
import openBook from "@/public/assets/open-book 1 (1).png";
import walletImg from "@/public/assets/text-box.png";
import { AiOutlineMessage } from "react-icons/ai";
import { IoMdContact, IoMdClipboard } from "react-icons/io";
import { FaRegCalendarDays,FaBoxTissue } from "react-icons/fa6";
import { BsReverseLayoutTextWindowReverse } from "react-icons/bs";
import { MdManageAccounts } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";

const Sidebar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();
    const[user,setuser]=useState();
    

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const liactivestyle = {
        backgroundColor: "#0078C5",
        border: "1px solid"
    };

    useEffect(()=>{
        let user= JSON.parse(localStorage.getItem('user'));
        setuser(user);
        console.log(user);
    },[])

    return (
        <>
            <div className="text-white fixed top-0 right-0 p-4 z-50 lg:hidden">
                <BiMenu className="w-6 h-6" onClick={toggleSidebar} />
            </div>

            <div className={`min-h-screen overflow-y-auto ${isSidebarOpen ? 'w-[13rem]' : 'w-0'} lg:w-[13rem] text-white flex flex-col justify-between transition-width duration-300`}>
                <div className={`${isSidebarOpen ? 'block' : 'hidden'} lg:block`}>
                    <Link href="/admin/dashbord">
                        <Image src={Logo} alt="Website Logo" className='w-full py-4 px-2 object-contain' width={100} height={60} />
                    </Link>

                    <div className='min-h-[90vh] rounded-[8px] relative' style={{ background: 'linear-gradient(176.83deg, #52E7CF 0.29%, #0096F6 3.41%, #1DB3E8 57.31%, #52E7CF 85.81%)' }}>
                        
                            {/* Profile and dropdown */}
                            <div className='flex justify-center items-center  gap-4 py-2'>
                                <Link href={"/admin/profile"}>
                                    <img className='w-10 h-10  rounded-full object-cover' src={user && user.profilePictureUrl} alt="Profile" />
                                </Link>
                                <div>
                                    <p className=''>{user && user.name}</p>
                                </div>
                            </div>

                            <hr className="bg-[#FFFFFF] mb-3"></hr>

                            <ul className='flex flex-col gap-2'>
                                {[
                                    { name: 'Dashboard', icon: <BsReverseLayoutTextWindowReverse className="w-5 h-5" />, path: '/admin/dashbord' },
                                    { name: 'Manage User', icon: <MdManageAccounts className="w-5 h-5" />, path: '/admin/manageuser' },
                                    { name: 'Notice Board', icon: <IoNotifications className="w-5 h-5" />, path: '/admin/noticeboard' },
                                    { name: 'Messages', icon: <AiOutlineMessage className="w-5 h-5" />, path: '/admin/chat' },
                                    { name: 'My Account', icon: <IoMdContact className="w-5 h-5" />, path: '/admin/account' },
                                    { name: 'Issue Reported', icon: <FaBoxTissue className="w-5 h-5" />, path: '/admin/Issue' },
                                    
                                ].map((item, index) => (
                                    <li key={index} style={pathname === item.path ? liactivestyle : {}} className='px-4 py-2 hover:bg-[#0078C5] hover:border-[1px]'>
                                        <Link href={item.path}>
                                            <div className='flex items-center gap-2'>
                                                {item.icon}
                                                <span>{item.name}</span>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>

                            <div className='absolute bottom-3 pl-4 py-4 text-[#0078C5] font-[600]'>
                                <Link href="/support">
                                    <div className='flex items-center gap-2'>
                                        <BiSupport className="w-5 h-5" />
                                        <span>Help & Support</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </>
            );
};

            export default Sidebar;
