// app/api/sessions/lastfiveclients/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sessions from '@/models/Sessions';
import { checkTokenMiddleware } from '@/lib/middleware';
import mongoose from 'mongoose';

export async function GET(req) {
  try {
    await dbConnect();
    await checkTokenMiddleware(req);
    const mentorId = req.user;

    // Validate mentorId
    if (!mongoose.Types.ObjectId.isValid(mentorId)) {
      return NextResponse.json({ message: 'Invalid mentorId provided' }, { status: 400 });
    }

    // Fetch last five sessions associated with this mentor
    const lastFiveSessions = await Sessions.find({ mentor: mentorId })
      .sort({ createdAt: -1 }) // Sort by creation date descending
      .limit(5) // Limit to the last 5 sessions
      .populate('Client', 'name email profilePictureUrl') // Populate client information
      .lean(); // Use lean to return plain JavaScript objects for performance

    return NextResponse.json(lastFiveSessions, { status: 200 });
  } catch (error) {
    console.error('Error retrieving clients:', error);
    return NextResponse.json({ message: 'Error retrieving clients', error: error.message }, { status: 500 });
  }
}
