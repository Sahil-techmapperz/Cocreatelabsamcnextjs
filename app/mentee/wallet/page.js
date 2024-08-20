"use client";

import { checkSessionExpiration } from '@/lib/checkSessionExpiration';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

const Wallet = () => {
    const [balance, setBalance] = useState(0);
    const [currency, setCurrency] = useState('USD');
    const [amount, setAmount] = useState('');
    const [convertedCoins, setConvertedCoins] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');

    const usdToInrRate = 75; // Assuming $1 = 75 INR
    const minimumAmountUSD = 10;
    const minimumAmountINR = 750; // 10 USD converted to INR

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
        async function fetchBalance() {
            try {
                const response = await fetch('/api/users/wallet-balances'); // Adjust this path based on your API route
                const data = await response.json();
                setBalance(data.currentWalletBalance);
            } catch (error) {
                console.error('Error fetching balance:', error);
            }
        }

        fetchBalance();
    }, []);

    useEffect(() => {
        if (amount) {
            const conversionRate = currency === 'INR' ? (10 * usdToInrRate) / 100 : 10; // Conversion logic
            setConvertedCoins(amount * conversionRate);
        }
    }, [amount, currency]);

    const handleCurrencyChange = (e) => {
        setCurrency(e.target.value);
        setAmount('');
        setConvertedCoins(0);
        setErrorMessage('');
    };

    const handleAmountChange = (e) => {
        setAmount(e.target.value);
        setErrorMessage('');
    };

    const validateAndSubmit = (e) => {
        e.preventDefault();
        let minimumAmount = currency === 'USD' ? minimumAmountUSD : minimumAmountINR;
        if (amount < minimumAmount) {
            setErrorMessage(`The minimum amount for ${currency} is ${minimumAmount}`);
            return;
        }
        handleSubmit();
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch('/api/user/add-coins', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount, currency, convertedCoins }),
            });
            const data = await response.json();
            if (data.success) {
                setBalance(balance + convertedCoins);
                setAmount('');
                setConvertedCoins(0);
                setErrorMessage('');
            } else {
                setErrorMessage('Error adding coins: ' + data.message);
            }
        } catch (error) {
            setErrorMessage('Error adding coins: ' + error.message);
        }
    };

    return (
        <div className='flex flex-col items-center text-black justify-center w-full h-[90vh] bg-gray-100 p-6'>
            <h1 className='text-2xl font-semibold mb-4'>Add Coins</h1>
            <p className='text-lg'>Current Balance: {balance} CCL</p>

            <form onSubmit={validateAndSubmit} className='bg-white shadow-lg rounded-lg p-6 mt-4 w-full max-w-md'>
                <div className='mb-4'>
                    <label htmlFor='currency' className='block text-sm font-medium text-gray-700'>Select Currency</label>
                    <select
                        id='currency'
                        value={currency}
                        onChange={handleCurrencyChange}
                        className='mt-1 block w-full p-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                    >
                        <option value='USD'>USD</option>
                        <option value='INR'>INR</option>
                    </select>
                </div>

                <div className='mb-4'>
                    <label htmlFor='amount' className='block text-sm font-medium text-gray-700'>Amount</label>
                    <input
                        type='number'
                        id='amount'
                        value={amount}
                        onChange={handleAmountChange}
                        className='mt-1 block w-full p-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                        min={currency === 'USD' ? minimumAmountUSD : minimumAmountINR}
                    />
                </div>

                <div className='mb-4'>
                    <label htmlFor='convertedCoins' className='block text-sm font-medium text-gray-700'>Converted Coins (CCL)</label>
                    <input
                        type='number'
                        id='convertedCoins'
                        value={convertedCoins}
                        readOnly
                        className='mt-1 block w-full p-2 bg-gray-200 border border-gray-300 rounded-md shadow-sm text-gray-500 sm:text-sm'
                    />
                </div>

                <button
                    type='submit'
                    className='w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
                >
                    Add Coins
                </button>
                {errorMessage && <p className='mt-2 text-red-500'>{errorMessage}</p>}
            </form>
        </div>
    );
};

export default Wallet;
