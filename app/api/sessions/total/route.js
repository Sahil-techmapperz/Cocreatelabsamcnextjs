import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sessions from '@/models/Sessions';
import { checkTokenMiddleware, addCorsHeaders } from '@/lib/middleware';

export async function GET(req) {
  await dbConnect();
  await checkTokenMiddleware(req);
  const userId = req.user;

  try {
    const allsessions = await Sessions.find({ mentor: userId, status: { $ne: "Canceled" } }).populate('mentor', 'name profilePictureUrl');
    let response = NextResponse.json({ allsessions }, { status: 200 });
    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ message: 'Error fetching sessions' }, { status: 500 });
  }
}
