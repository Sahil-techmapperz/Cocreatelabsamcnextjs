// app/api/users/payment-methods/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { checkTokenMiddleware, addCorsHeaders } from '@/lib/middleware';

export async function GET(req) {
  try {
    await dbConnect();
    await checkTokenMiddleware(req);

    const userId = req.user;
    const user = await User.findById(userId).select({
      'bankTransfer': 1,
      'paypal': 1,
      'stripe': 1,
      'crypto': 1
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const paymentMethods = {
      bankTransfer: user.bankTransfer,
      paypal: user.paypal,
      stripe: user.stripe,
      crypto: user.crypto
    };

    let response = NextResponse.json(paymentMethods, { status: 200 });
    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Failed to fetch user payment methods:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
