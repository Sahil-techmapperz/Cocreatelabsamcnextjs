"use client";

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FaTimes, FaCoins } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO, startOfDay, endOfDay, compareAsc } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { checkSessionExpiration } from '@/lib/checkSessionExpiration';

// Modal Component
const Modal = ({ isOpen, closeModal, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white w-[30%] p-6 rounded-lg shadow-lg relative">
        <button
          onClick={closeModal}
          className="absolute text-2xl top-2 right-2 text-gray-500 hover:text-gray-800"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

// StatusPill component defined directly within the MyWithdrawls component file
const StatusPill = ({ value }) => {
  let statusColor = value === 'Success' ? 'green'
    : value === 'Pending' ? 'orange'
      : value === 'Declined' ? 'red'
        : 'gray'; // Default color

  return (
    <span style={{
      color: 'white',
      backgroundColor: statusColor,
      padding: '5px 10px',
      borderRadius: '15px',
      display: 'inline-block',
      textTransform: 'capitalize',
    }}>
      {value}
    </span>
  );
};

const MyWithdrawls = () => {
  const [initialData, setInitialData] = useState([]);
  const [currentWalletBalance, setCurrentWalletBalance] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [coin, setCoin] = useState('');
  const [actualData, setActualData] = useState([]);
  const [moneyAmount, setMoneyAmount] = useState({
    amount: 0,
    method: "",
    notes: ""
  });
  const [selectedStatus, setSelectedStatus] = useState({ value: 'all', label: 'All Statuses' });
  const [searchInput, setSearchInput] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState({ value: 'all', label: 'All Payment Methods' });
  const [filteredData, setFilteredData] = useState(initialData);

  const filterOptions = [
    { value: 'all', label: 'All Year' },
    { value: 'today', label: 'Today' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'thisYear', label: 'This Year' },
  ];
  const [selectedOptionRevenue, setSelectedOptionRevenue] = useState(filterOptions[0]);
  const [selectedOptionWithdrawal, setSelectedOptionWithdrawal] = useState(filterOptions[0]);

  const getFilteredData = (selectedOption) => {
    const now = new Date();
    return actualData && actualData.filter(item => {
      const itemDate = parseISO(item.date);
      switch (selectedOption.value) {
        case 'today':
          return isWithinInterval(itemDate, { start: startOfDay(now), end: endOfDay(now) });
        case 'thisWeek':
          return isWithinInterval(itemDate, { start: startOfWeek(now), end: endOfWeek(now) });
        case 'thisMonth':
          return isWithinInterval(itemDate, { start: startOfMonth(now), end: endOfMonth(now) });
        case 'thisYear':
          return isWithinInterval(itemDate, { start: startOfYear(now), end: endOfYear(now) });
        default:
          return true; // 'All Year' returns all data
      }
    }).sort((a, b) => compareAsc(parseISO(a.date), parseISO(b.date)));
  };

  const renderChart = (dataKey, color, name, selectedOption) => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={getFilteredData(selectedOption)}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={dataKey} stroke={color} name={name} />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderSelect = (title, selectedOption, setSelectedOption) => (
    <div className='flex justify-between'>
      <h1 className="text-[18px] font-bold">{title}</h1>
      <Select
        value={selectedOption}
        onChange={setSelectedOption}
        options={filterOptions}
        className="mb-4"
        styles={{ container: (provided) => ({ ...provided, width: '150px', zIndex: 20 }) }}
      />
    </div>
  );

  const getRevenueAndWithdrawal = () => {
    let url = `/api/sessions/revenue-withdrawal`;
    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    }).then(response => response.json()).then(res => {
      setActualData(res);
    });
  };

  const getWalletBalances = () => {
    let url = `/api/users/wallet-balances`;
    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(response => response.json())
      .then(res => {
        setCurrentWalletBalance(res.currentWalletBalance);
      })
      .catch(error => {
        console.error('Error fetching withdrawals:', error);
      });
  };

  const handleMethodChange = (e) => {
    const { name, value } = e.target;
    setMoneyAmount({
      ...moneyAmount,
      [name]: value,
    });
  };

  useEffect(() => {
    getWithdrawals();
  }, []);

  const getWithdrawals = () => {
    let url = `/api/users/withdrawals`;
    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    })
      .then(response => response.json())
      .then(res => {
        const convertedWithdrawals = res.map(withdrawal => ({
          id: withdrawal._id,
          payment: `${withdrawal._id}`,
          status: withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1),
          amount: `$${withdrawal.amount.toFixed(2)}`,
          method: withdrawal.method,
          date: new Date(withdrawal.requestedAt).toISOString().split('T')[0]
        }));

        setInitialData(convertedWithdrawals);
      })
      .catch(error => {
        console.error('Error fetching withdrawals:', error);
      });
  };

  useEffect(() => {
    const lowercasedFilter = searchInput.toLowerCase();

    const filtered = initialData.filter(item => {
      const date = new Date(item.date);
      const startDateCheck = startDate ? date >= startDate : true;
      const endDateCheck = endDate ? date <= endDate : true;
      const statusCheck = selectedStatus.value === 'all' || item.status.toLowerCase() === selectedStatus.value;
      const methodCheck = selectedMethod.value === 'all' || item.method === selectedMethod.value;
      const searchCheck = item.payment.toLowerCase().includes(lowercasedFilter) ||
        item.amount.toLowerCase().includes(lowercasedFilter) ||
        item.method.toLowerCase().includes(lowercasedFilter) ||
        item.date.includes(lowercasedFilter);

      return startDateCheck && endDateCheck && statusCheck && methodCheck && searchCheck;
    });
    setFilteredData(filtered);
  }, [selectedStatus, searchInput, startDate, endDate, selectedMethod, initialData]);


  const router = useRouter();

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleMoneyAmountChange = (e) => {
    const enteredAmount = parseFloat(e.target.value);
    let calculatedAmount;
    if (enteredAmount) {
      calculatedAmount = enteredAmount / 100;
    } else {
      calculatedAmount = 0;
    }
    setMoneyAmount({ ...moneyAmount, amount: calculatedAmount });
  };

  const handleWithdrawal = () => {
    if (moneyAmount.amount < 1) {
      alert('Minimum withdrawal amount is $1. Please increase the amount.');
      return;
    }
    if (moneyAmount.method === "") {
      alert('Please select a payment method before proceeding.');
      return;
    }

    let url = `/api/users/withdrawals`;
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        amount: moneyAmount.amount,
        method: moneyAmount.method,
        notes: moneyAmount.notes,
        coin: coin
      })
    })
      .then(response => response.json())
      .then(res => {
        if (res.error) {
          alert('Withdrawal failed: ' + res.error);
        } else {
          alert('Withdrawal successful! Transaction Details: ' + JSON.stringify(res.details));
        }
        getWithdrawals();
        getRevenueAndWithdrawal();
        getWalletBalances();
      })
      .catch(error => {
        console.error('Error fetching withdrawals:', error);
        alert('An error occurred while processing your request. Please try again.');
      });

    closeModal();
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
    getRevenueAndWithdrawal();
    getWalletBalances();
  }, []);

  return (
    <div className='w-full h-[90vh] overflow-hidden py-[15px] text-black'>
      <div className='md:h-[80vh] mt-[10px] md:overflow-x-auto max-md:px-[10px] '>
        <div className='flex justify-end text-[20px]'>
          <div className='flex justify-center items-center gap-2 text-[#0796F6]'>
            <b className='text-black'>CurrentBalance -</b>
            <FaCoins />
            <span className='text-black'>{currentWalletBalance}</span>
          </div>
        </div>
        <div className='flex gap-2'>
          <button className='w-max p-[5px] border rounded text-white bg-blue-500' onClick={openModal}>Withdrawal</button>
          <Link href={"/mentor/paymentmethod"}> <button className='w-max p-[5px] border rounded text-white bg-blue-500'>Add Payment method</button> </Link>
        </div>

        <div className=' flex max-md:gap-2 max-md:flex-col md:justify-between md:items-center gap-[10px]'>
          <div className='flex gap-2  max-md:flex-col'>
            <div className="filter-group">
              <div className="filter-label">Status:</div>
              <Select
                options={[{ value: 'all', label: 'All Statuses' }, { value: 'pending', label: 'Pending' }, { value: 'success', label: 'Success' }, { value: 'declined', label: 'Declined' }]}
                value={selectedStatus}
                onChange={setSelectedStatus}
              />
            </div>
            <div className="filter-group">
              <div className="filter-label">Payment Method:</div>
              <Select
                options={[{ value: 'all', label: 'All Methods' }, { value: 'bank_transfer', label: 'Bank Transfer' }, { value: 'stripe', label: 'Stripe' }, { value: 'crypto', label: 'Cryptocurrency' }, { value: 'paypal', label: 'PayPal' }]}
                value={selectedMethod}
                onChange={setSelectedMethod}
              />
            </div>
            <div className="filter-group">
              <div className="filter-label">Start Date:</div>
              <DatePicker
                className='border-[2px] border-gray-300 py-1 px-2 rounded-md'
                selected={startDate}
                onChange={date => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="Start Date"
              />
            </div>
            <div className="filter-group">
              <div className="filter-label">End Date:</div>
              <DatePicker
                className='border-[2px] border-gray-300 py-1 px-2 rounded-md'
                selected={endDate}
                onChange={date => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                placeholderText="End Date"
              />
            </div>
          </div>
          <div className='flex gap-[20px] md:mt-[20px]'>

            <Modal isOpen={modalIsOpen} closeModal={closeModal}>
              <div className="flex flex-col items-center">
                <h2 className='text-center text-xl font-bold' >Withdrawal</h2>
                <label>Coin:</label>
                <input
                  placeholder='Enter CCL Coin'
                  type="text"
                  value={coin}
                  onChange={(e) => setCoin(e.target.value)}
                  onInput={handleMoneyAmountChange}
                  style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '80%' }}
                />
                <label>Money Amount:</label>
                <input
                  placeholder='Calculated Amount'
                  type="text"
                  value={moneyAmount.amount}
                  readOnly
                  style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '80%' }}
                />
                <label>Payment Methods:</label>
                <select
                  value={moneyAmount.method}
                  name='method'
                  onChange={handleMethodChange}
                  style={{ padding: '10px', borderRadius: '5px', width: '80%', border: '1px solid #ccc' }}
                >
                  <option value="">Select payment method</option>
                  <option value="bank_transfer">Bank Transfer 2% fee</option>
                  <option value="stripe">Stripe 2.5% fee</option>
                  <option value="crypto">Cryptocurrency 1% fee</option>
                  <option value="paypal">PayPal 3% fee</option>
                </select>
                <label>Notes:</label>
                <textarea
                  placeholder='Add any relevant notes here...'
                  value={moneyAmount.notes}
                  name='notes'
                  onChange={handleMethodChange}
                  style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '80%', minHeight: '100px' }}
                />
                <button
                  onClick={handleWithdrawal}
                  style={{ backgroundColor: 'black', color: 'white', padding: '10px', borderRadius: '5px', border: 'none', cursor: 'pointer', width: '80%', marginTop: '20px' }}
                >
                  Withdraw
                </button>
              </div>
            </Modal>

            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search by amount, payment method..."
              style={{ padding: '10px', width: '300px' }}
              className='border-[2px] border-gray-300 py-1 px-2 rounded-md'
            />
          </div>
        </div>

        <table className='md:m-[20px] w-[95%] m-auto  border-collapse border border-gray-300'>
          <thead>
            <tr>
              <th className='border border-gray-300 p-2'>PAYMENT ID</th>
              <th className='border border-gray-300 p-2'>STATUS</th>
              <th className='border border-gray-300 p-2'>AMOUNT</th>
              <th className='border border-gray-300 p-2'>METHOD</th>
              <th className='border border-gray-300 p-2'>DATE</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={index}>
                <td className='border border-gray-300 p-2'>{row.payment}</td>
                <td className='border border-gray-300 p-2'><StatusPill value={row.status} /></td>
                <td className='border border-gray-300 p-2'>{row.amount}</td>
                <td className='border border-gray-300 p-2'>{row.method}</td>
                <td className='border border-gray-300 p-2'>{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className='grid grid-cols-2 gap-2 mt-2'>
          <div className="chartWithFilter">
            {renderSelect("Revenue", selectedOptionRevenue, setSelectedOptionRevenue)}
            {renderChart("Revenue", "#ffc658", "Revenue", selectedOptionRevenue)}
          </div>
          <div className="chartWithFilter">
            {renderSelect("Withdrawal", selectedOptionWithdrawal, setSelectedOptionWithdrawal)}
            {renderChart("Withdrawal", "#8884d8", "Withdrawal", selectedOptionWithdrawal)}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MyWithdrawls;
