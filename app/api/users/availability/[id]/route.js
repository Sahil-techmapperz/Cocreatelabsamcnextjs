// app/api/users/setavailability/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import moment from 'moment';
import momentTimezone from 'moment-timezone';
import { checkTokenMiddleware, addCorsHeaders } from '@/lib/middleware';



export async function GET(req, { params }) {
  try {
    await dbConnect();
    await checkTokenMiddleware(req);

    const { id } = params;

    // Fetch user's availability and location from the database
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Check if the user's timeZone is set
    if (!user.location || !user.location.timeZone) {
      return NextResponse.json({ message: 'You need to set the time zone first' }, { status: 400 });
    }

    const userTimeZone = user.location.timeZone;
    const availability = user.availability ? user.availability.times : [];

    // Get current time in the user's time zone
    const now = momentTimezone.tz(userTimeZone).format();

    // Convert availability times to the user's time zone and filter for future slots
    const convertedAvailability = availability
      .map(slot => ({
        start: momentTimezone.tz(slot.start, userTimeZone).format(),
        end: momentTimezone.tz(slot.end, userTimeZone).format()
      }))
      .filter(slot => slot.start > now);

    let response = NextResponse.json({
      message: 'Availability retrieved successfully',
      availability: convertedAvailability,
      timeZone: userTimeZone
    }, { status: 200 });

    response = addCorsHeaders(response);
    return response;

  } catch (error) {
    console.error('Error retrieving availability:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    await checkTokenMiddleware(req);

    const userId = req.user;
    const { availability } = await req.json();

    if (!availability || !Array.isArray(availability.times)) {
      return NextResponse.json({ message: 'Availability must be an array of times' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const existingAvailability = user.availability ? user.availability.times : [];

    const isOverlap = (time1, time2) => {
      const start1 = moment(time1.start);
      const end1 = moment(time1.end);
      const start2 = moment(time2.start);
      const end2 = moment(time2.end);
      return (start1.isBefore(end2) && start2.isBefore(end1));
    };

    const convertedTimes = availability.times.map(time => {
      if (!time.start || !time.end || 
          !moment(time.start, 'YYYY-MM-DDTHH:mm', true).isValid() || 
          !moment(time.end, 'YYYY-MM-DDTHH:mm', true).isValid()) {
        throw new Error(`Invalid date-time format for start or end time. Use 'YYYY-MM-DDTHH:mm'`);
      }

      const startTimeUTC = moment(time.start).utc();
      const endTimeUTC = moment(time.end).utc();

      if (!startTimeUTC.isBefore(endTimeUTC)) {
        throw new Error('Start time must be before end time');
      }

      return {
        start: startTimeUTC.format(),
        end: endTimeUTC.format()
      };
    });

    for (const newTime of convertedTimes) {
      for (const existingTime of existingAvailability) {
        if (isOverlap(newTime, existingTime)) {
          throw new Error('Time slot overlaps with an existing one');
        }
      }
    }

    user.availability = { times: [...existingAvailability, ...convertedTimes] };
    await user.save();

    let response = NextResponse.json({ message: 'Availability updated successfully', user }, { status: 200 });
    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Error updating availability:', error);
    if (error.message.includes('Invalid date-time format') || error.message.includes('Start time must be before end time') || error.message.includes('Time slot overlaps with an existing one')) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
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

    let response = NextResponse.json({
      message: 'Availability deleted successfully',
      availability: user.availability.times
    }, { status: 200 });

    response = addCorsHeaders(response);
    return response;

  } catch (error) {
    console.error('Error deleting availability:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
