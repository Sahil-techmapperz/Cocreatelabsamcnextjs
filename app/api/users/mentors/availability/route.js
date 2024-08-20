// app/api/users/getavailabilitybymentor/[mentorId]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import momentTimezone from 'moment-timezone';
import { checkTokenMiddleware, addCorsHeaders } from '@/lib/middleware';

export async function GET(req) {
  try {
    await dbConnect();
    await checkTokenMiddleware(req);

    const { mentorId } = req.params;
    const clientId = req.user;

    const client = await User.findById(clientId);
    if (!client) {
      return NextResponse.json({ message: 'Client not found' }, { status: 404 });
    }

    if (!client.location || !client.location.timeZone) {
      return NextResponse.json({ message: 'You need to set your time zone first' }, { status: 400 });
    }

    const mentor = await User.findById(mentorId);
    if (!mentor) {
      return NextResponse.json({ message: 'Mentor not found' }, { status: 404 });
    }

    const clientTimeZone = client.location.timeZone;
    const availability = mentor.availability ? mentor.availability.times : [];

    const convertedAvailability = availability.map(slot => ({
      start: momentTimezone.tz(slot.start, clientTimeZone).format(),
      end: momentTimezone.tz(slot.end, clientTimeZone).format()
    }));

    let response = NextResponse.json({ message: 'Availability retrieved successfully', availability: convertedAvailability, timeZone: clientTimeZone }, { status: 200 });
    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Error retrieving availability:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}




export async function DELETE(req) {
    try {
      await dbConnect();
      await checkTokenMiddleware(req);
  
      const { start, end } = await req.json();
      const userId = req.user;
  
      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }
  
      user.availability.times = user.availability.times.filter(
        (time) => !(time.start === start && time.end === end)
      );
  
      await user.save();
  
      let response = NextResponse.json({ message: 'Availability deleted successfully', availability: user.availability.times }, { status: 200 });
      response = addCorsHeaders(response);
      return response;
    } catch (error) {
      console.error('Error deleting availability:', error);
      return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }
  