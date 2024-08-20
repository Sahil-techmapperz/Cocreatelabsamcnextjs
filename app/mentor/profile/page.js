"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import TimezoneSelect from 'react-timezone-select';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import { Country, State, City } from 'country-state-city';
import { useRouter } from 'next/navigation';
import { checkSessionExpiration } from '@/lib/checkSessionExpiration';

const getCountryISOCode = (countryName) => {
    const country = Country.getAllCountries().find(country => country.name === countryName);
    return country ? country.isoCode : null;
};

const Profile = () => {
    const [filesData, setFilesData] = useState({
        introductionVideoUrl: "",
        profilePictureUrl: "",
        idProofUrl: "",
    });

    const [showEditIcon, setShowEditIcon] = useState(false);
    const [showEditProfilePic, setShowEditProfilePic] = useState(false);
    const [showEditVideo, setShowEditVideo] = useState(false);
    const [showEditLocation, setShowEditLocation] = useState(false);

    const [userData, setUserData] = useState({
        name: "John Doe",
        email: "johndoe@example.com",
        profilePictureUrl: "",
        introductionvideoUrl: "",
        idProofUrl: "",
        bio: "Experienced software developer with a passion for developing innovative programs...",
        expertise: ["JavaScript", "React", "Node.js"],
        professionalDetails: "Senior Developer at TechCo",
        socialMediaLinks: {
            linkedin: "https://linkedin.com/in/johndoe",
            twitter: "https://twitter.com/johndoe",
            facebook: "https://facebook.com/johndoe"
        },
        location: {
            timeZone: "",
            country: "",
            state: "",
            city: ""
        },
        languages: ["English", "Spanish"],
        contactNumber: "123-456-7890",
        website: "https://johndoe.com"
    });

    const countries = countryList().getData();
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    const router = useRouter();

    const getUserData = () => {
        const url = `/api/users`;
        fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data) {
                    setUserData(prevState => ({ ...prevState, ...data }));
                }
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
            });
    };


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

    useEffect(() => {
        getUserData();
    }, []);

    const handleCountryChange = (selectedCountry) => {
        const countryISO = selectedCountry.value;
        setUserData(prevState => ({
            ...prevState,
            location: {
                ...prevState.location,
                country: selectedCountry.label,
                state: "",
                city: ""
            }
        }));
        const statesData = State.getStatesOfCountry(countryISO);
        setStates(statesData.map(state => ({ label: state.name, value: state.isoCode })));
        setCities([]);
    };

    const handleStateChange = (selectedState) => {
        const stateISO = selectedState.value;
        const countryISO = getCountryISOCode(userData.location.country);
        setUserData(prevState => ({
            ...prevState,
            location: {
                ...prevState.location,
                state: selectedState.label,
                city: ""
            }
        }));
        const citiesData = City.getCitiesOfState(countryISO, stateISO);
        setCities(citiesData.map(city => ({ label: city.name, value: city.name })));
    };

    const handleCityChange = (selectedCity) => {
        setUserData(prevState => ({
            ...prevState,
            location: {
                ...prevState.location,
                city: selectedCity.label
            }
        }));
    };

    const handleFileUpload = (e) => {
        const { name, files } = e.target;
        const newFile = files[0];
        setFilesData(prevState => ({
            ...prevState,
            [name]: newFile
        }));
    };

    const handleVideoSubmit = async (e) => {
        e.preventDefault();
        closeModal();
        const videoFile = filesData.introductionVideoUrl;

        if (!videoFile) {
            console.error('No video file selected');
            return;
        }

        const url = `/api/upload`;
        const formData = new FormData();
        formData.append('file', videoFile);

        try {
            const response = await fetch(url, {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            const response2 = await fetch('/api/users/introductionvideo', {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ "fileUrl": data.url })
            });

            const res = await response2.json();
            setUserData(prevState => ({ ...prevState, ...res }));
        } catch (error) {
            console.error('Error uploading video:', error);
        }
    };

    const handleProfileImageSubmit = async (e) => {
        e.preventDefault();
        closeModal();
        const imageFile = filesData.profilePictureUrl;

        if (!imageFile) {
            console.error('No image file selected');
            return;
        }

        const url = `/api/upload`;
        const formData = new FormData();
        formData.append('file', imageFile);

        try {
            const response = await fetch(url, {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            
              const response2 = await fetch('/api/users/profilepicture', {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ "fileUrl": data.url })
              });
  
              const res = await response2.json();
              setUserData(prevState => ({ ...prevState, ...res }));
              window.location.reload();
         
        } catch (error) {
            console.error('Error uploading profile image:', error);
        }
    };

    const handleLocationSubmit = async (e) => {
        e.preventDefault();
        closeModal();
        const { timeZone, country, state, city } = userData.location;

        const url = `/api/users/location/${userData._id}`;
        const locationData = {
            timeZone,
            country,
            state,
            city
        };

        try {
            const response = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(locationData)
            });

            const data = await response.json();
        } catch (error) {
            console.error('Error updating location:', error);
        }
    };

    const closeModal = () => {
        setShowEditProfilePic(false);
        setShowEditVideo(false);
        setShowEditLocation(false);
    };

    const placeholderImage = 'https://via.placeholder.com/150';
    const videoPlaceholder = 'https://via.placeholder.com/400x240';

    return (
        <div className='flex gap-[30px] bg-gray-100  overflow-hidden'>
            <div className='myAccount_body mr-[12px] overflow-x-hidden overflow-y-scroll w-full'>
                {/* <div className='m-[20px] text-[18px] font-[600]'>
                    <Link href="/">Dashboard</Link> &gt; <Link href={'/mentor/account'}>My Account</Link> &gt; <u>Profile</u>
                </div> */}

                <div className='p-5 bg-white shadow-lg rounded-lg'>
                    <div className='flex gap-5 justify-center items-center'>
                        <div className="relative w-40 h-40" onMouseEnter={() => setShowEditIcon(true)} onMouseLeave={() => setShowEditIcon(false)}>
                            <img src={userData.profilePictureUrl ? userData.profilePictureUrl : placeholderImage } alt="Profile" width={100} height={100} className='w-full h-full rounded-full' />
                            {showEditIcon && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center rounded-full">
                                    <button
                                        className="text-white cursor-pointer text-3xl"
                                        onClick={() => setShowEditProfilePic(true)}
                                    >
                                        ✏️
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className='flex-1'>
                            <h3 className='text-xl font-semibold'>Name: {userData.name}</h3>
                            <p className='text-gray-700'>Email: {userData.email}</p>
                            <p className='text-gray-700'>Professional details: {userData.professionalDetails}</p>
                            <p className='text-gray-700'>Bio: {userData.bio}</p>
                            <p className='text-gray-700'>
                                Location: {`${userData.location.city !== "" ? userData.location.city : "Not available"}, ${userData.location.state ? userData.location.state : "Not available"}, ${userData.location.country !== "" ? userData.location.country : "Not available"} (${userData.location.timeZone !== "" ? userData.location.timeZone : "Not available"})`}
                            </p>
                            <p className='text-gray-700'>Languages: {userData.languages.join(", ")}</p>
                            <p className='text-gray-700'>Expertise: {userData.expertise.join(", ")}</p>
                            <p className='text-gray-700'>Contact: {userData.contactNumber}</p>
                            <p className='text-gray-700'>Website: <a href={userData.website} className='text-blue-500 hover:text-blue-600' target="_blank" rel="noopener noreferrer">{userData.website}</a></p>
                            <div className='text-gray-700'>Social Media:
                                <a href={userData.socialMediaLinks.linkedin} className='text-blue-500 hover:text-blue-600' target="_blank" rel="noopener noreferrer"> LinkedIn</a> |
                                <a href={userData.socialMediaLinks.twitter} className='text-blue-500 hover:text-blue-600' target="_blank" rel="noopener noreferrer"> Twitter</a> |
                                <a href={userData.socialMediaLinks.facebook} className='text-blue-500 hover:text-blue-600' target="_blank" rel="noopener noreferrer"> Facebook</a>
                            </div>
                            <button onClick={() => setShowEditLocation(true)} className="w-fit mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition duration-150 ease-in-out">
                                Edit Location
                            </button>
                        </div>
                    </div>
                </div>

                <div className='grid grid-cols-1 gap-4'>
                    <div className='p-5 my-6 bg-white shadow-lg rounded-lg'>
                        <h1 className='text-xl font-bold text-gray-900 mb-4'>Introduction Video</h1>
                        <div>
                            {userData && userData.introductionvideoUrl ? (
                                <video className='w-[400px] max-w-xl h-[200px] rounded-lg' controls>
                                    <source src={userData.introductionvideoUrl} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            ) : (
                                <div className='flex justify-center items-center w-full h-60 bg-gray-200 rounded-lg'>
                                    <img src={videoPlaceholder} alt="Video Placeholder" className='max-w-full h-auto' />
                                </div>
                            )}
                            <button onClick={() => setShowEditVideo(true)} className="w-fit mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition duration-150 ease-in-out">
                                {userData && userData.introductionvideoUrl ? "Update" : "Add"} Video
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showEditProfilePic && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg mx-auto my-12 max-w-md">
                        <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">
                            &times;
                        </button>
                        <form onSubmit={handleProfileImageSubmit} className='flex flex-col gap-3'>
                            <h2 className="text-lg font-semibold text-center">Edit Profile Picture</h2>
                            <input
                                className="form-input px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-blue-500 w/full"
                                type="file"
                                name="profilePictureUrl"
                                onChange={handleFileUpload}
                                accept="image/*"
                            />
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer w/full transition duration-150 ease-in-out"
                            >
                                Upload
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showEditVideo && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg mx-auto my-12 max-w-md">
                        <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">
                            &times;
                        </button>
                        <form onSubmit={handleVideoSubmit} className='flex flex-col gap-3'>
                            <h2 className="text-lg font-semibold text-center">Edit Introduction Video</h2>
                            <input
                                className="form-input px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-blue-500 w/full"
                                type="file"
                                name="introductionVideoUrl"
                                onChange={handleFileUpload}
                                accept="video/*"
                            />
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer w/full transition duration-150 ease-in-out"
                            >
                                Upload
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showEditLocation && (
                <div className="fixed inset-0 flex items-center justify-center bg-black text-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg mx-auto my-12 relative max-w-md">
                        <button onClick={closeModal} className="absolute top-2 right-2 text-4xl text-gray-500 hover:text-gray-800">
                            &times;
                        </button>
                        <form onSubmit={handleLocationSubmit} className='flex flex-col gap-3'>
                            <h2 className="text-lg font-semibold text-center">Edit Location</h2>
                            <TimezoneSelect
                                value={userData.location.timeZone || ''}
                                onChange={(selectedTimezone) => setUserData(prevState => ({
                                    ...prevState,
                                    location: {
                                        ...prevState.location,
                                        timeZone: selectedTimezone.value
                                    }
                                }))}
                            />
                            <Select
                                options={countries}
                                value={countries.find(c => c.label === userData.location.country)}
                                onChange={handleCountryChange}
                                placeholder="Select Country"
                                className="my-2"
                            />
                            <Select
                                options={states}
                                value={states.find(s => s.label === userData.location.state)}
                                onChange={handleStateChange}
                                placeholder="Select State"
                                className="my-2"
                            />
                            <Select
                                options={cities}
                                value={cities.find(c => c.label === userData.location.city)}
                                onChange={handleCityChange}
                                placeholder="Select City"
                                className="my-2"
                            />
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer w/full transition duration-150 ease-in-out"
                            >
                                Save
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
