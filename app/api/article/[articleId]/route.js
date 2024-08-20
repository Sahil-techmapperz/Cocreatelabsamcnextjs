// app/api/article/[articleId]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Article from '@/models/Article';
import User from '@/models/User';
import { checkTokenMiddleware, addCorsHeaders } from '@/lib/middleware';

export async function PATCH(req, { params }) {
  try {
    // Connect to the database
    await dbConnect();

    // Validate the token and extract user information
    await checkTokenMiddleware(req);

    // Extract the article ID from the request parameters
    const { articleId } = params;

    // Parse the request body to extract title, description, and banner URL
    const { title, description, bannerurl } = await req.json();

    // Extract the user ID from the token and find the user in the database
    const userId = req.user;
    const user = await User.findById(userId);

    // Check if the user has admin privileges
    if (user.role !== "Admin") {
      return NextResponse.json({ message: 'Admin privileges required' }, { status: 403 });
    }

    // Find the article by ID and update it with the new data
    const updatedArticle = await Article.findByIdAndUpdate(
      articleId, 
      { 
        title, 
        description,
        bannerimage: bannerurl 
      }, 
      { new: true } // Return the updated document
    );

    // Check if the article was found and updated
    if (!updatedArticle) {
      return NextResponse.json({ message: 'Article not found' }, { status: 404 });
    }

    // Return a success response with the updated article data
    let response = NextResponse.json({ message: 'Article updated successfully', article: updatedArticle }, { status: 200 });
    
    // Optionally, add CORS headers if needed
    response = addCorsHeaders(response);
    
    return response;
  } catch (error) {
    // Log the error for debugging and return a server error response
    console.error('Error during article update:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}


export async function DELETE(req, { params }) {
    try {
      await dbConnect();
      await checkTokenMiddleware(req);
  
      const { articleId } = params;
      const userId = req.user;
      const user = await User.findById(userId);
  
      if (user.role !== "Admin") {
        return NextResponse.json({ message: 'Admin privileges required' }, { status: 403 });
      }
  
      const deletedArticle = await Article.findByIdAndDelete(articleId);
  
      if (!deletedArticle) {
        return NextResponse.json({ message: 'Article not found' }, { status: 404 });
      }
  
      let response = NextResponse.json({ message: 'Article deleted successfully' }, { status: 200 });
      response = addCorsHeaders(response);
      return response;
    } catch (error) {
      console.error('Error during article deletion:', error);
      return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
  }
