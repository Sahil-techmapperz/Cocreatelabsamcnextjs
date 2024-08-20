// app/api/users/payment-methods/[method]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { checkTokenMiddleware, addCorsHeaders } from '@/lib/middleware';

export async function PATCH(req, { params }) {
  try {
    await dbConnect();
    await checkTokenMiddleware(req);

    const { method } = params;
    const userId = req.user;
    const updateField = req.json();

    if (!updateField || !['bankTransfer', 'stripe', 'paypal', 'crypto'].includes(method)) {
      return NextResponse.json({ message: 'Invalid or missing payment method' }, { status: 400 });
    }

    const updates = { [method]: updateField };

    try {
      const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
      if (!updatedUser) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }

      let response = NextResponse.json({
        message: 'Payment method updated successfully',
        user: updatedUser
      }, { status: 200 });
      
      response = addCorsHeaders(response);
      return response;

    } catch (error) {
      console.error('Failed to update payment method:', error);
      if (error.name === 'ValidationError') {
        return NextResponse.json({ message: 'Validation Error', details: error.errors }, { status: 400 });
      } else if (error.name === 'CastError') {
        return NextResponse.json({ message: 'Invalid user ID format' }, { status: 400 });
      }
      return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
