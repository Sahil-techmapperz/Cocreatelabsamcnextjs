// app/api/users/all/mentees/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { checkTokenMiddleware, addCorsHeaders } from '@/lib/middleware';

export async function GET(req) {
  try {
    await dbConnect();
    await checkTokenMiddleware(req);
    // Fetch users whose role is neither 'Client' nor 'Admin'
    const users = await User.find({ role: { $nin: ['Client', 'Admin'] } });
    let response = NextResponse.json(users, { status: 200 });
    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
