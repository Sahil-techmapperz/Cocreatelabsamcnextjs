"use client";

import React, { useState } from 'react';
import Link from 'next/link';

import { ImProfile } from "react-icons/im";
import { FaInfoCircle } from "react-icons/fa";
import { GrShieldSecurity } from "react-icons/gr";
import { MdOutlinePayments } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { useRouter } from 'next/navigation';
import { checkSessionExpiration } from '@/lib/checkSessionExpiration';

// Define the Modal component
const Modal = ({ isOpen, closeModal, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg relative">
                <button
                    onClick={closeModal}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                >
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
};

const gridItems = [
    { icon: <ImProfile/>, heading: 'Profile', description: 'Personal details and how we can reach you', link: "/mentor/profile" },
    { icon: <FaInfoCircle/>, heading: 'Personal info', description: 'Provide personal details and how we can reach you', link: "/mentor/personalInfo" },
    { icon: <GrShieldSecurity/>, heading: 'Login & security', description: 'Update your password and secure your account', link: "/mentor/security" },
    { icon: <MdOutlinePayments/>, heading: 'Payments & payouts', description: 'Review payments, payouts, coupons, and gift cards', link: "/mentor/withdrawls" },
    { icon: <IoNotifications/>, heading: 'Notifications', description: 'Choose notification preferences and how you want to be contacted', link: "/mentor/noticeboard" },
    // { icon: Icon6, heading: 'Payment methods', description: 'Update your payment methods data', link: "/payment_methods" },
    { icon: <RiDeleteBin6Fill/>, heading: 'Delete Account', description: 'Add a work email for business trip benefits', link: "" }
];

const MyAccount = () => {
    const [isModalOpen, setModalOpen] = useState(false);
    const router = useRouter();


    useEffect(() => {
        // Check session expiration on initial load
        checkSessionExpiration(router, "mentor");
    
        // Set up an interval to check session expiration every second
        const interval = setInterval(() => {
          checkSessionExpiration(router, "mentor");
        }, 1000);
    
        // Clear interval on component unmount
        return () => clearInterval(interval);
      }, [router]);

    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);

    return (
        <div className='flex gap-[30px] bg-gray-100 h-[90vh] overflow-hidden text-black'>
            <div className='myAccount_body mr-[12px]'>
                <div className='myAccount_main h-[85vh] p-[8px] my-[20px] grid grid-cols-1 gap-16 md:grid-cols-3 md:gap-6 overflow-x-auto'>
                    {gridItems.map((item, index) => (
                        <div key={index} className='p-4 h-[200px] shadow-lg rounded-md'>
                            {item.heading === "Delete Account" ? (
                                <div onClick={openModal} className="cursor-pointer">
                                    {/* <Image src={item.icon} alt={item.heading} width={50} height={50} className={`mt-[15px]`} /> */}
                                    <span className='text-4xl'>  {item.icon}</span>
                                    <p className={`my_account_main_heading mt-[15px] text-sm ${item.heading === "Delete Account" && 'text-red-600 '}`}>
                                        {item.heading}
                                    </p>
                                    <p className='mt-[20px] text-sm text-gray-600'>{item.description}</p>
                                </div>
                            ) : (
                                <Link href={item.link}>
                                    <div className="cursor-pointer">
                                        {/* <Image src={item.icon} alt={item.heading} width={50} height={50} className={`mt-[15px]`} /> */}
                                      <span className='text-4xl'>  {item.icon}</span>
                                        <p className='my_account_main_heading mt-[15px] text-sm'>
                                            {item.heading}
                                        </p>
                                        <p className='mt-[20px] text-sm text-gray-600'>{item.description}</p>
                                    </div>
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <Modal isOpen={isModalOpen} closeModal={closeModal}>
                <div className="w-96">
                    <h2 className="text-2xl font-bold mb-4">Delete Account</h2>
                    <p className="text-gray-700 mb-6">
                        Are you sure you want to delete your account? This action cannot be undone.
                    </p>
                    <div className="flex gap-2 items-center">
                        <button
                            className="bg-gray-300 cursor-pointer w-fit text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition duration-300"
                            onClick={closeModal}
                        >
                            Cancel
                        </button>
                        <button
                            className="bg-red-500 cursor-pointer w-fit text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
                            onClick={() => {
                                // Handle account deletion logic here
                                closeModal();
                            }}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default MyAccount;
