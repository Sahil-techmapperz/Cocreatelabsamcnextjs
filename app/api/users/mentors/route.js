// app/api/users/mentors/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { checkTokenMiddleware, addCorsHeaders } from '@/lib/middleware';

export async function GET(req) {
  try {
    await dbConnect();
    await checkTokenMiddleware(req);

    const mentors = await User.find({ role: 'Mentor' });

    if (!mentors || mentors.length === 0) {
      return NextResponse.json({ message: 'No mentors found' }, { status: 404 });
    }

    let response = NextResponse.json(mentors, { status: 200 });
    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

