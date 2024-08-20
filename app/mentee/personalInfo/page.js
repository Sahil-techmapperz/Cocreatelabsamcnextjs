"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Port1 from '@/public/assets/svg.png';
import Port2 from '@/public/assets/svg (1).png';
import Port3 from '@/public/assets/svg (2).png';
import PersonalEdit from '../[components]/PersonalEdit';
import { useRouter } from 'next/navigation';
import { checkSessionExpiration } from '@/lib/checkSessionExpiration';

const PersonalInfo = () => {
    const [formData, setFormData] = useState({});
    const [updateFormData, setUpdateFormData] = useState({
        name: "",
        email: "",
        role: "",
        phone: "",
        website: "",
        linkedin: "",
        twitter: "",
        facebook: "",
        location: {
            timeZone: "",
            country: "",
            state: "",
            city: ""
        },
        languages: "",
        skills: "",
        bio: "",
        professionalDetails: "",
    });
    const [isModalOpen, setModalOpen] = useState(false);

    const router = useRouter();

    const openModal = () => {
        setUpdateFormData({ ...formData, updateFormData });
        setModalOpen(true);
    };
    const closeModal = () => setModalOpen(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setUpdateFormData(prevState => ({
                ...prevState,
                [parent]: {
                    ...prevState[parent],
                    [child]: value
                }
            }));
        } else {
            setUpdateFormData(prevState => ({
                ...prevState,
                [name]: value
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        let url = `/api/users`;
        fetch(url, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updateFormData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                localStorage.setItem('user', JSON.stringify(data.user));
                getUser();
            })
            .catch(error => {
                console.error('Error:', error);
            });

        closeModal();
    };

    const getUser = () => {
        let url = `/api/users`;
        fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        }).then(response => response.json()).then(user => {
            const userdata = {
                name: user.name || "",
                email: user.email || "",
                role: user.role || "",
                phone: user.contactNumber || "",
                website: user.website || "",
                linkedin: user.socialMediaLinks ? user.socialMediaLinks.linkedin : "",
                twitter: user.socialMediaLinks ? user.socialMediaLinks.twitter : "",
                facebook: user.socialMediaLinks ? user.socialMediaLinks.facebook : "",
                location: user.location || { timeZone: "", country: "", state: "", city: "" },
                languages: user.languages || "",
                skills: user.skills || "",
                bio: user.bio || "",
                professionalDetails: user.professionalDetails || "",
            };
            setFormData(userdata);
        });
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
        getUser();
    }, []);

    return (
        <div className='flex gap-2 text-black'>
            <div className='flex flex-col w-full  overflow-hidden py-[15px]'>
                {/* <div className='m-[20px] text-[18px] font-[600]'>
                    <Link href="/">Dashboard</Link> &gt; <Link href='/mentor/account'>My Account</Link> &gt; Personal Info
                </div> */}
                <div className='p-4'>
                    {isModalOpen && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg relative w-[500px] h-[80vh] overflow-y-auto">
                                <button
                                    onClick={closeModal}
                                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                                >
                                    &times;
                                </button>
                                <form onSubmit={handleSubmit}>
                                    <div className='grid grid-cols-2 gap-2 mt-4'>
                                        {Object.keys(formData).filter(key => key !== "location").map(key => (
                                            <React.Fragment key={key}>
                                                {key === "professionalDetails" || key === "bio" ? (
                                                    <textarea
                                                        name={key}
                                                        value={updateFormData[key] || ''}
                                                        onChange={handleChange}
                                                        placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                                                        className="col-span-2 m-2 border py-1 px-2 rounded min-h-[100px]"
                                                    />
                                                ) : (
                                                    <input
                                                        readOnly={key === "role"}
                                                        type="text"
                                                        name={key}
                                                        value={updateFormData[key] || ''}
                                                        onChange={handleChange}
                                                        placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                                                        className={`${key === "skills" ? "col-span-2" : ""} m-2 border py-1 px-2 rounded`}
                                                    />
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                    <button type="submit" className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>
                                        Save Changes
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    <div className='flex flex-wrap gap-5'>
                        <div className='flex-1 min-w-[320px]'>
                            {Object.keys(formData).map(key => (
                                key === "location" ? (
                                    <PersonalEdit
                                        key={key}
                                        Openmodal={openModal}
                                        title={key}
                                        content={`${formData.location.city}, ${formData.location.state}, ${formData.location.country} (${formData.location.timeZone})`}
                                        actionText={"Edit"}
                                    />
                                ) : (
                                    <PersonalEdit
                                        key={key}
                                        Openmodal={openModal}
                                        title={key}
                                        content={formData[key] || `add ${key}`}
                                        actionText={formData[key] ? "Edit" : "Add"}
                                    />
                                )
                            ))}
                        </div>
                        <div className='md:w-1/3 w-full bg-gray-100 p-4 rounded-lg'>
                            <div className='my-4'>
                                <Image src={Port1} alt="Info Security" />
                                <p className='text-lg font-bold my-2'>Why isn’t my info shown here?</p>
                                <p>We’re hiding some account details to protect your identity.</p>
                            </div>
                            <div className='my-4'>
                                <Image src={Port2} alt="Editable Details" />
                                <p className='text-lg font-bold my-2'>Which details can be edited?</p>
                                <p>Details used to verify your identity can’t be changed. Contact info and some personal details can be edited, but we may ask you to verify your identity the next time you book or create a listing.</p>
                            </div>
                            <div className='my-4'>
                                <Image src={Port3} alt="Shared Info" />
                                <p className='text-lg font-bold my-2'>What info is shared with others?</p>
                                <p>Only releases contact information for Hosts and guests after a reservation is confirmed.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalInfo;
