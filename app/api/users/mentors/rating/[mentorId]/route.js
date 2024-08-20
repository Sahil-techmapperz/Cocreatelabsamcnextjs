import { NextResponse } from 'next/server';
import { addCorsHeaders, checkTokenMiddleware } from '@/lib/middleware';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';


export async function GET(req, { params }) {
    try {
      await dbConnect();
      await checkTokenMiddleware(req);
      const mentorId = params.mentorId;
  
      // Find the mentor by ID and populate the ratings with reviewer details
      const mentor = await User.findById(mentorId)
        .select('ratings')
        .populate({
          path: 'ratings.reviewedBy', // Ensure this path matches the structure of your document
          model: 'User', // Specify the model to populate
          select: 'name profilePictureUrl createdAt' // Select only necessary fields
        });
  
      if (!mentor) {
        return NextResponse.json({ message: 'Mentor not found' }, { status: 404 });
      }
  
      // If mentor is found but has no ratings
      if (mentor.ratings.length === 0) {
        return NextResponse.json({ message: 'No ratings found for this mentor' }, { status: 404 });
      }
  
      // Extract ratings to simplify the response
      const ratings = mentor.ratings.map(rating => ({
        rating: rating.rating,
        review: rating.review,
        reviewerName: rating.reviewedBy ? rating.reviewedBy.name : 'Anonymous',
        reviewerProfilePictureUrl: rating.reviewedBy ? rating.reviewedBy.profilePictureUrl : null,
        _id: rating._id,
        createdAt: rating.createdAt
      }));
  
      let response = NextResponse.json({ ratings }, { status: 200 });
      response = addCorsHeaders(response);
      return response;
    } catch (error) {
      console.error('Failed to fetch ratings:', error);
      return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
  }



  export async function POST(req, { params }) {
    try {
      await dbConnect();
      await checkTokenMiddleware(req);
  
      const { mentorId } = params;
      const { rating, review } = await req.json();
      const userId = req.user;
  
      const mentor = await User.findById(mentorId);
      if (!mentor) {
        return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
      }
  
      if (mentorId === userId.toString()) {
        return NextResponse.json({ error: 'Mentors cannot rate themselves' }, { status: 403 });
      }
  
      const existingRating = mentor.ratings.find(r => r.reviewedBy.toString() === userId.toString());
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
      console.error('Failed to rate mentor:', error);
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
  }