// app/api/users/mentors/booked/[userId]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { checkTokenMiddleware, addCorsHeaders } from '@/lib/middleware';
import Session from '@/models/Sessions';

export async function GET(req) {
  try {
    await dbConnect();
    await checkTokenMiddleware(req);

    const { clientId } = req.params;
    const sessions = await Session.find({ 'Client._id': clientId }).populate('Client');

    let response = NextResponse.json({ data: sessions }, { status: 200 });
    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Error fetching booked sessions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
