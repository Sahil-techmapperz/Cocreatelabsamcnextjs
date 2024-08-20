// app/api/users/payment-info/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import validator from 'validator';
import { checkTokenMiddleware, addCorsHeaders } from '@/lib/middleware';

export async function PATCH(req) {
  try {
    await dbConnect();
    await checkTokenMiddleware(req);

    const userId = req.user;
    const { method, accountInfo } = await req.json();

    if (!method || !accountInfo) {
      return NextResponse.json({ message: 'Method and account information are required.' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    switch (method) {
      case 'bank_transfer':
        if (!accountInfo.accountNumber || !accountInfo.IFSC || !accountInfo.branchName) {
          return NextResponse.json({ message: 'Bank transfer information is incomplete.' }, { status: 400 });
        }
        user.bankTransfer.accountInfo = accountInfo;
        break;
      case 'paypal':
        if (!accountInfo.paypalEmail || !validator.isEmail(accountInfo.paypalEmail)) {
          return NextResponse.json({ message: 'Valid PayPal email is required.' }, { status: 400 });
        }
        user.paypal.accountInfo = accountInfo;
        break;
      case 'stripe':
        if (!accountInfo.stripeAccountId) {
          return NextResponse.json({ message: 'Stripe account ID is required.' }, { status: 400 });
        }
        user.stripe.accountInfo = accountInfo;
        break;
      case 'crypto':
        if (!accountInfo.walletAddress || !accountInfo.walletType) {
          return NextResponse.json({ message: 'Crypto wallet address and type are required.' }, { status: 400 });
        }
        user.crypto.accountInfo = accountInfo;
        break;
      default:
        return NextResponse.json({ message: 'Invalid method.' }, { status: 400 });
    }

    await user.save();

    let response = NextResponse.json({ message: 'Payment information updated successfully.' }, { status: 200 });
    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Error updating payment information:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
