"use client"

// app/mentor/dashbord/page.js
import React, { useEffect, useState } from "react";
import { FaCoins } from "react-icons/fa";
import Image from "next/image";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import Scheduled_Sessions from "@/public/assets/account-circle.png";
import Total_Clients from "@/public/assets/contact2.png";
import Wallet_Balances from "@/public/assets/store.png";
import { TableComponent } from "../[components]/TableComponent";
import { checkSessionExpiration } from "@/lib/checkSessionExpiration";
import { useRouter } from "next/navigation";

const MentorDashboard = () => {

  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState([]);
  const [ScheduledSessions, setScheduledSessions] = useState({
    title: "Scheduled Sessions",
    count: 0,
    percentageChange: "+55%",
    iconSrc: Scheduled_Sessions,
    bgColor: "#4463A4",
  });
  const [TotalMentees, setTotalMentees] = useState({
    title: "Total Mentees",
    count: 0,
    percentageChange: "+30%",
    iconSrc: Total_Clients,
    bgColor: "#4AB2EC",
  });
  const [WalletBalance, setWalletBalance] = useState({
    title: "Wallet Balance",
    count: 0,
    percentageChange: "+10%",
    iconSrc: Wallet_Balances,
    bgColor: "#2F5197",
  });
  const [Upcomeingsession, setUpcomeingsession] = useState([]);

  const data = [ScheduledSessions, TotalMentees, WalletBalance];

  const router = useRouter();

  const GetScheduledSessions = async () => {
    try {
      const response = await fetch(`/api/sessions/countsbymentor`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const res = await response.json();
      setScheduledSessions(prevSessions => ({
        ...prevSessions,
        count: res.currentMonthCount,
        percentageChange: res.percentageChange,
      }));
    } catch (error) {
      console.error("Error fetching scheduled sessions:", error);
    }
  };

  const GetTotalMentees = async () => {
    try {
      const response = await fetch(`/api/sessions/client-count`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const res = await response.json();
      setTotalMentees(prevTotalMentees => ({
        ...prevTotalMentees,
        count: res.currentMonthClientCount,
        percentageChange: res.percentageChange,
      }));
    } catch (error) {
      console.error("Error fetching total mentees:", error);
    }
  };

  const GetLastFiveClients = async () => {
    try {
      const response = await fetch(`/api/sessions/lastfiveclients`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const res = await response.json();
      setUpcomeingsession(res);
    } catch (error) {
      console.error("Error fetching last five clients:", error);
    }
  };

  const GetWalletBalances = async () => {
    try {
      const response = await fetch(`/api/users/wallet-balances`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const res = await response.json();
      setWalletBalance(prevWalletBalance => ({
        ...prevWalletBalance,
        count: res.currentWalletBalance,
      }));
    } catch (error) {
      console.error("Error fetching wallet balances:", error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/sessions/bymonths-byweek`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const responseData = await response.json();
      setData1(responseData.All_Sessions_By_months);
      setData2(responseData.Sessions_BY_Weeks);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
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
    fetchData();
    GetScheduledSessions();
    GetTotalMentees();
    GetWalletBalances();
    GetLastFiveClients();
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 text-black md:grid-cols-3 items-start w-full gap-5 py-8">
        {data.map((item, index) => (
          <div key={index} className="flex min-h-[132px] flex-col items-center bg-white shadow-sm ring-2 ring-gray-300 ring-opacity-50 rounded-lg p-4">
            <div className="flex items-center justify-between w-full">
              <Image className="w-16 h-16 object-contain rounded-[8px] p-2 px-3 relative top-[-35px]" src={item.iconSrc} alt={`Icon ${index + 1}`} style={{ backgroundColor: item.bgColor }} />
              <div>
                <p className="font-semibold text-md w-[max-content]">{item.title}</p>
                <div className="text-2xl font-bold">
                  {item.title === "Wallet Balance" ? (
                    <div className="flex justify-center items-center gap-2">
                      <FaCoins className="text-[#0796F6]" /> {item.count}
                    </div>
                  ) : (
                    item.count
                  )}
                </div>
              </div>
            </div>
            {item.title !== "Wallet Balance" && (
              <div className="flex gap-1 w-full">
                <p className="text-sm font-semibold text-green-600">{item.percentageChange}</p>
                <p className="text-sm">than last month</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 text-black gap-5 md:grid-cols-2 md:gap-3">
        <div className="shadow-sm ring-2 ring-gray-300 ring-opacity-50 rounded-lg px-4 py-2">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data1}
              margin={{
                top: 5, right: 30, left: 20, bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
          <div className="ml-[20px]">
            <p className="font-bold">All Sessions By months</p>
            <p className="text-gray-600">just updated</p>
          </div>
        </div>

        <div className="shadow-sm ring-2 ring-gray-300 ring-opacity-50 rounded-lg px-4 py-2">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data2}
              margin={{
                top: 5, right: 30, left: 20, bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
          <div className="ml-[20px]">
            <p className="font-bold">Sessions BY Weeks</p>
            <p className="text-gray-600">updated 4 min ago</p>
          </div>
        </div>
      </div>

      <TableComponent data={Upcomeingsession} className="shadow-inherit " />
</>
  );
};

export default MentorDashboard;
