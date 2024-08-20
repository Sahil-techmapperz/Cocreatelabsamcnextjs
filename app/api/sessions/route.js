// app/api/sessions/booked/[userId]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sessions from '@/models/Sessions';
import { checkTokenMiddleware, addCorsHeaders } from '@/lib/middleware';

export async function GET(req) {
  await dbConnect();
  await checkTokenMiddleware(req);

  try {
    const sessions = await Sessions.find();
    const totalSessions = sessions.length;
    const scheduledSessions = sessions.filter(session => session.status === 'upcoming' || session.status === 'Inprogress' || session.status === 'Reschedule').length;
    const completedSessions = sessions.filter(session => session.status === 'completed').length;
    const canceledSessions = sessions.filter(session => session.status === 'Canceled').length;

    const scheduledPercentage = totalSessions ? (scheduledSessions / totalSessions) * 100 : 0;
    const completedPercentage = totalSessions ? (completedSessions / totalSessions) * 100 : 0;
    const canceledPercentage = totalSessions ? (canceledSessions / totalSessions) * 100 : 0;

    let response = NextResponse.json({
      totalSessions,
      scheduledSessions,
      completedSessions,
      canceledSessions,
      scheduledPercentage,
      completedPercentage,
      canceledPercentage,
    }, { status: 200 });

    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Error fetching session statistics:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

