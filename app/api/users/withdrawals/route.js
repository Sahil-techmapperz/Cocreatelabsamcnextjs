// app/api/users/withdrawals/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Withdrawal from '@/models/Withdrawal';
import User from '@/models/User';
import { checkTokenMiddleware, addCorsHeaders, calculateFee } from '@/lib/middleware';

export async function GET(req) {
  try {
    await dbConnect();
    await checkTokenMiddleware(req);

    const Id = req.user;
    const withdrawals = await Withdrawal.find({ userId: Id });
    
    let response = NextResponse.json(withdrawals, { status: 200 });
    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Failed to fetch withdrawals:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    await checkTokenMiddleware(req);

    const { amount, coin, method, notes = "null" } = await req.json();
    const userId = req.user;

    if (!amount || !method) {
      return NextResponse.json({ error: 'Amount and method are required.' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance.' }, { status: 400 });
    }

    let validMethod = false;
    switch (method) {
      case 'bank_transfer':
        validMethod = user.bankTransfer.accountInfo?.accountNumber && user.bankTransfer.accountInfo?.IFSC;
        break;
      case 'paypal':
        validMethod = user.paypal.accountInfo?.paypalEmail;
        break;
      case 'stripe':
        validMethod = user.stripe.accountInfo?.stripeAccountId;
        break;
      case 'crypto':
        validMethod = user.crypto.accountInfo?.walletAddress && user.crypto.accountInfo?.walletType;
        break;
      default:
        return NextResponse.json({ error: 'Invalid method.' }, { status: 400 });
    }

    if (!validMethod) {
      return NextResponse.json({ error: 'Required method information missing.' }, { status: 400 });
    }

    const newWithdrawal = new Withdrawal({
      userId,
      amount,
      method,
      notes,
      fee: calculateFee(amount, method),
    });

    await newWithdrawal.save();
    user.walletBalance -= coin;
    await user.save();

    let response = NextResponse.json(newWithdrawal, { status: 201 });
    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
