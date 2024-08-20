// app/api/article/create/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Article from '@/models/Article';
import User from '@/models/User';
import { checkTokenMiddleware, addCorsHeaders } from '@/lib/middleware';


export async function GET(req) {
    try {
      await dbConnect();
      await checkTokenMiddleware(req);
  
      const articles = await Article.find({}); // Fetch all articles
  
      let response = NextResponse.json(articles, { status: 200 });
      response = addCorsHeaders(response);
      return response;
    } catch (error) {
      console.error('Failed to fetch articles:', error);
      return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
  }


  export async function POST(req) {
    try {
      // Connect to the database
      await dbConnect();
      
      // Validate the token and extract user information
      await checkTokenMiddleware(req);
  
      // Parse the request body
      const { title, description, bannerurl } = await req.json();
  
      // Log the parsed data for debugging
      console.log(title, description, bannerurl);
  
      // Validate required fields
      if (!title || !description || !bannerurl) {
        return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
      }
  
      // Extract the user ID from the token
      const userId = req.user;
      const user = await User.findById(userId);
  
      // Check if the user is an admin
      if (user.role !== "Admin") {
        return NextResponse.json({ message: 'Admin privileges required' }, { status: 403 });
      }
  
      // Get the current date in ISO format
      const currentDate = new Date().toISOString();
  
      // Create a new article with the provided data
      const newArticle = new Article({
        bannerimage: bannerurl, // Use the banner URL directly from the request body
        title,
        description,
        author: user.name,
        date: currentDate,
      });
  
      // Save the new article to the database
      await newArticle.save();
  
      // Respond with a success message and the article ID
      let response = NextResponse.json({ message: 'Article created successfully', articleId: newArticle._id }, { status: 201 });
      
      // Optionally, add CORS headers if needed
      response = addCorsHeaders(response);
      
      return response;
    } catch (error) {
      // Log the error for debugging
      console.error('Error during article creation:', error);
      
      // Respond with an internal server error message
      return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
  }
