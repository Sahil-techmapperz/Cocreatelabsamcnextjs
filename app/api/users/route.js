// app/api/blog/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { checkTokenMiddleware, addCorsHeaders } from '@/lib/middleware';

export async function GET(req) {
  try {
    await dbConnect();
    await checkTokenMiddleware(req);

    // Assuming you're using a middleware to attach user info to the request object
    const userId = req.user; // Adjust this line depending on how you're extracting the userId

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (err) {
    console.error('Error fetching user:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}



export async function PATCH(req) {
  try {
    await dbConnect();
    await checkTokenMiddleware(req);

    const userId = req.user;
    const { professionalDetails, bio, skills, languages, location, facebook, twitter, linkedin, website, phone, email, name } = await req.json();

    const updateData = {
      professionalDetails,
      bio,
      skills,
      languages,
      location,
      socialMediaLinks: { facebook, twitter, linkedin },
      website,
      contactNumber: phone,
      email,
      name
    };

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });
    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    let response = NextResponse.json({ message: 'User updated successfully', user: updatedUser }, { status: 200 });
    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}



export async function OPTIONS() {
  const response = NextResponse.json({});
  return response;
}
