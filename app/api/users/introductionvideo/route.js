// app/api/users/introductionvideo/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { checkTokenMiddleware, uploadToS3, addCorsHeaders } from '@/lib/middleware';

export async function POST(req) {
  try {
    await dbConnect();
    await checkTokenMiddleware(req);

    const userId = req.user;
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json(); // Parse the JSON body
    const { fileUrl } = body; // Destructure to get fileUrl

    if (!fileUrl) {
      return NextResponse.json({ error: 'fileUrl is required' }, { status: 400 });
    }

    //  sets `req.fileUrl`
    user.introductionvideoUrl = fileUrl;
    const updatedUser = await user.save();

    let response = NextResponse.json(updatedUser, { status: 201 });
    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Server error. Please try again later.' }, { status: 500 });
  }
}
