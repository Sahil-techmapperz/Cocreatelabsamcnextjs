// app/api/mentors/rating/top/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { checkTokenMiddleware, addCorsHeaders } from '@/lib/middleware';

export async function GET(req) {
  try {
    await dbConnect();
    await checkTokenMiddleware(req);

    const mentorsWithRatings = await User.find({
      role: 'Mentor',
      'ratings.0': { $exists: true },
      $nor: [{ role: 'Client' }, { role: 'Admin' }]
    });

    const mentorsWithAvgRatings = mentorsWithRatings.map(mentor => {
      const totalRating = mentor.ratings.reduce((acc, curr) => acc + curr.rating, 0);
      const avgRating = totalRating / mentor.ratings.length;
      return { mentor, avgRating };
    });

    mentorsWithAvgRatings.sort((a, b) => b.avgRating - a.avgRating);
    const top3Mentors = mentorsWithAvgRatings.slice(0, 3);

    let response = NextResponse.json(top3Mentors, { status: 200 });
    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
