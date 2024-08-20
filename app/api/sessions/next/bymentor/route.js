import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sessions from '@/models/Sessions';
import { checkTokenMiddleware, addCorsHeaders } from '@/lib/middleware';

export async function GET(req) {
  await dbConnect();
  await checkTokenMiddleware(req);
  const mentorId = req.user;

  try {
    const now = new Date();
    const nextSession = await Sessions.findOne({ mentor: mentorId, startTime: { $gt: now } })
      .sort({ startTime: 1 })
      .populate('Client', 'name profilePictureUrl')
      .populate('mentor', 'name email');

    if (!nextSession) {
      return NextResponse.json({ message: 'No upcoming sessions found for the specified mentor' }, { status: 404 });
    }

    const sessionData = nextSession.toObject();
    const timeLeftMillis = new Date(sessionData.startTime) - now;
    const timeLeftHours = Math.floor(timeLeftMillis / (1000 * 60 * 60));
    const timeLeftMinutes = Math.floor((timeLeftMillis % (1000 * 60 * 60)) / (1000 * 60));

    sessionData.startDate = new Date(sessionData.startTime).toLocaleDateString();
    sessionData.startTimeFormatted = new Date(sessionData.startTime).toLocaleTimeString();
    sessionData.timeLeft = `${timeLeftHours} hours and ${timeLeftMinutes} minutes`;

    let response = NextResponse.json({ message: 'Next session found', sessionData }, { status: 200 });
    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Error fetching the next session for mentor:', error);
    return NextResponse.json({ message: 'Error fetching the next session' }, { status: 500 });
  }
}
