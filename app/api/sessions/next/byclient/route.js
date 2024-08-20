import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sessions from '@/models/Sessions';
import { checkTokenMiddleware, addCorsHeaders } from '@/lib/middleware';

export async function GET(req) {
  try {
    await dbConnect();
    await checkTokenMiddleware(req);

    const clientId = req.user; // Get the clientId from the authenticated user

    try {
     

      // Get the current time
      const now = new Date();

      // Find the next session that starts in the future for the given client
      const nextSession = await Sessions.findOne({
        Client: clientId,
        startTime: { $gt: now }, // Find sessions that start after the current time
      })
        .sort({ startTime: 1 }) // Sort by start time in ascending order
        .populate('Client', 'name profilePictureUrl') // Populate client details
        .populate('mentor', 'name email'); // Populate mentor details

      if (!nextSession) {
        return NextResponse.json({ message: 'No upcoming sessions found for the specified client' }, { status: 404 });
      }

      // Convert Mongoose document to plain JavaScript object
      const sessionData = nextSession.toObject();

      // Calculate the time left until the session starts
      const timeLeftMillis = new Date(sessionData.startTime) - now;
      const timeLeftHours = Math.floor(timeLeftMillis / (1000 * 60 * 60));
      const timeLeftMinutes = Math.floor((timeLeftMillis % (1000 * 60 * 60)) / (1000 * 60));

      // Add additional information to the sessionData object
      sessionData.startDate = new Date(sessionData.startTime).toLocaleDateString(); // Formatted start date
      sessionData.startTimeFormatted = new Date(sessionData.startTime).toLocaleTimeString(); // Formatted start time
      sessionData.timeLeft = `${timeLeftHours} hours and ${timeLeftMinutes} minutes`; // Time left as a string

      let response = NextResponse.json({
        message: 'Next session found',
        sessionData, // Return the updated sessionData object with additional information
      }, { status: 200 });

      response = addCorsHeaders(response);
      return response;
    } catch (sessionError) {
      console.error('Error processing the session:', sessionError);
      return NextResponse.json({ message: 'Error processing the session', error: sessionError.message }, { status: 500 });
    }
  } catch (error) {
    console.error('Error fetching the next session for client:', error);
    return NextResponse.json({ message: 'Error fetching the next session', error: error.message }, { status: 500 });
  }
}
