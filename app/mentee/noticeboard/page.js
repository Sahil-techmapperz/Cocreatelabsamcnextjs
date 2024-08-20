"use client"
import { checkSessionExpiration } from '@/lib/checkSessionExpiration';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';


function NoticeBoard() {
    const [articles, setArticles] = useState([]);

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
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
          try {
            const response = await fetch(`/api/article`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const articles = await response.json();
            setArticles(articles);
        } catch (error) {
            console.error('Error retrieving articles:', error);
            return []; // Return an empty list if there's an error
        }
            
        } catch (error) {
            console.error('Error fetching articles:', error);
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
        <div className='flex gap-[30px] bg-gray-100 text-black'>
            <div className='notice_board_body_main mr-[12px] h-[90vh] overflow-hidden'>
                <div className='mt-[5px] flex justify-between items-center'>
                    <p className='text-lg font-bold'>All Notice</p>
                </div>
                <div className='notice_board_main_container w-full mt-2'>
                    <div className='flex flex-col gap-4 overflow-x-auto md:h-[75vh]'>
                        {articles && articles.map((article) => (
                            <div key={article._id} className={``}>
                                <div className='flex gap-4 p-[10px] rounded-[8px] relative' style={{ boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px" }}>
                                    <img src={article.bannerimage} alt={article.title} width={220} height={150} className='ml-[10px] w-[220px] max-sm:w-[100px] max-sm:h-[100px]' />

                                    <div className=''>
                                        <div>
                                            <h5 className='font-bold'>{article.title}</h5>
                                            <p className='notice_board_blog_cotesion text-gray-600 text-[14px] mt-[25px] p-0'>{article.description}</p>
                                            <p className='noticeBoardName text-[14px]'>{article.author}</p>
                                        </div>
                                        <div>
                                            <p className='absolute bottom-2 right-3 font-bold'>{convertDateToReadableFormat(article.date)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NoticeBoard;
