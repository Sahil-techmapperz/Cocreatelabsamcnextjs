// app/api/users/mentors/most-viewed/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { checkTokenMiddleware, addCorsHeaders } from '@/lib/middleware';
import Session from '@/models/Sessions';

export async function GET(req) {
  try {
    await dbConnect();
    await checkTokenMiddleware(req);

    const mostViewedMentors = await Session.aggregate([
      {
        $group: {
          _id: '$mentor',
          totalSessions: { $sum: 1 }
        }
      },
      {
        $sort: { totalSessions: -1 }
      },
      {
        $limit: 3
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'mentorInfo'
        }
      },
      {
        $project: {
          _id: 0,
          mentorInfo: 1,
          totalSessions: 1
        }
      }
    ]);

    let response = NextResponse.json(mostViewedMentors, { status: 200 });
    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
