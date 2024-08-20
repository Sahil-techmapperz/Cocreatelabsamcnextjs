import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sessions from '@/models/Sessions';
import User from '@/models/User';
import { checkTokenMiddleware, addCorsHeaders } from '@/lib/middleware';

export async function GET(req) {
  await dbConnect();
  await checkTokenMiddleware(req);
  const Id = req.user;

  if (!Id) {
    return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
  }

  let adminData = await User.findById(Id);

  if (adminData.role !== 'Admin') {
    return NextResponse.json({ message: 'User is not Admin' }, { status: 405 });
  }

  try {
    const sessions = await Sessions.find({});
    let totalRevenue = 0;

    for (let session of sessions) {
      const durationHours = (new Date(session.endTime) - new Date(session.startTime)) / (1000 * 60 * 60);
      const mentor = await User.findById(session.mentor);
      const rate = mentor ? mentor.rate : 0;
      totalRevenue += durationHours * rate;
    }

    const sessionRevenue = totalRevenue * 0.20;

    let response = NextResponse.json({
      totalRevenue: totalRevenue.toFixed(2),
      sessionRevenue: sessionRevenue.toFixed(2),
    }, { status: 200 });

    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Error fetching session revenue:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
