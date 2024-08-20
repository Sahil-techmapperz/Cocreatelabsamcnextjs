// app/api/users/mentors/[mentorId]/rate/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { checkTokenMiddleware, addCorsHeaders } from '@/lib/middleware';

export async function POST(req) {
  try {
    await dbConnect();
    await checkTokenMiddleware(req);

    const { mentorId } = req.params;
    const userId = req.user;
    const { rating, review } = await req.json();

    const mentor = await User.findById(mentorId);
    const user = await User.findById(userId);

    if (!mentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    if (mentor._id.toString() === user._id.toString()) {
      return NextResponse.json({ error: 'Mentors cannot rate themselves' }, { status: 403 });
    }

    const existingRating = mentor.ratings.find(rating => rating.reviewedBy.toString() === userId);
    if (existingRating) {
      return NextResponse.json({ error: 'User has already rated this mentor' }, { status: 403 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    mentor.ratings.push({ rating, review, reviewedBy: userId });
    await mentor.save();

    let response = NextResponse.json({ message: 'Rating added successfully' }, { status: 201 });
    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
