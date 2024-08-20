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
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

    const sessions = await Sessions.find({ startTime: { $gte: startOfYear, $lt: endOfYear } });

    let monthlyRevenue = Array(12).fill(0);

    for (let session of sessions) {
      const durationHours = (new Date(session.endTime) - new Date(session.startTime)) / (1000 * 60 * 60);
      const mentor = await User.findById(session.mentor);
      const rate = mentor ? mentor.rate : 0;
      const revenue = durationHours * rate;

      const month = new Date(session.startTime).getMonth();
      monthlyRevenue[month] += revenue;
    }

    const monthlySessionRevenue = monthlyRevenue.map(revenue => (revenue * 0.20).toFixed(2));
    monthlyRevenue = monthlyRevenue.map(revenue => revenue.toFixed(2));

    let response = NextResponse.json({
      monthlyRevenue,
      monthlySessionRevenue,
    }, { status: 200 });

    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Error fetching session revenue for the current year:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
