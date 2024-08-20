import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { checkTokenMiddleware, addCorsHeaders } from '@/lib/middleware';

export async function GET(req, { params }) {
  try {
    await dbConnect();
    await checkTokenMiddleware(req);

    const { mentorId } = params;
    const mentorDetails = await User.findById(mentorId);

    if (!mentorDetails) {
      return NextResponse.json({ message: 'Mentor not found' }, { status: 404 });
    }

    // Calculate the average rating if ratings are available
    let avgRating = 0;
    if (mentorDetails.ratings && mentorDetails.ratings.length > 0) {
      const totalRating = mentorDetails.ratings.reduce((acc, curr) => acc + curr.rating, 0);
      avgRating = totalRating / mentorDetails.ratings.length;
    }

    // Enhance the response to include average rating
    const mentorData = mentorDetails.toObject();  // Convert the mongoose document to a plain JavaScript object
    mentorData.avgRating = avgRating;  // Add the average rating to the mentor's data

    let response = NextResponse.json(mentorData, { status: 200 });
    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    await checkTokenMiddleware(req);

    const { mentorId } = params;
    const adminId = req.user;

    // Check if the current user is an admin
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'Admin') {
      return NextResponse.json({ message: 'Admin privileges required' }, { status: 403 });
    }

    // Find and delete the mentor
    const mentor = await User.findByIdAndDelete(mentorId);
    if (!mentor) {
      return NextResponse.json({ message: 'Mentor not found' }, { status: 404 });
    }

    let response = NextResponse.json({ message: 'Mentor deleted successfully' }, { status: 200 });
    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
