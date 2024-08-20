"use client";
import { checkSessionExpiration } from '@/lib/checkSessionExpiration';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

const Chat = () => {
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-700">Coming Soon</h1>
    </div>
  );
};

export default Chat;
