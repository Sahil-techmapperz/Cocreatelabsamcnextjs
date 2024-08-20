import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sessions from '@/models/Sessions';
import { checkTokenMiddleware, addCorsHeaders } from '@/lib/middleware';

export async function GET(req) {
  await dbConnect();
  await checkTokenMiddleware(req);
  const mentorId = req.user;

  try {
    const sessions = await Sessions.find({ mentor: mentorId }).populate('Client', 'name profilePictureUrl');
    
    if (!sessions || sessions.length === 0) {
      return NextResponse.json({ message: 'No sessions found for the specified mentor' }, { status: 404 });
    }

    let response = NextResponse.json({ message: 'Sessions fetched successfully', data: sessions }, { status: 200 });
    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Error fetching sessions for mentor:', error);
    return NextResponse.json({ message: 'Error fetching sessions' }, { status: 500 });
  }
}
