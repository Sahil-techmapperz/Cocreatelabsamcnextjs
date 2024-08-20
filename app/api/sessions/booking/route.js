import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sessions from '@/models/Sessions';
import User from '@/models/User';
import { checkTokenMiddleware, addCorsHeaders } from '@/lib/middleware';
import { scheduleReminderEmail, sendConfirmationEmail } from '@/lib/Emailsetup';
import { correctDateFormat } from '@/lib/dateFormat';
import moment from 'moment';




export async function GET(req) {
  try {
    await dbConnect();
    await checkTokenMiddleware(req);

    const userId  = req.user;
    const allsessions = await Sessions.find({ Client: userId }).populate('mentor', 'name profilePictureUrl');
    let response = NextResponse.json({ allsessions }, { status: 200 });
    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Error fetching booked sessions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


export async function POST(req) {
  await dbConnect();
  await checkTokenMiddleware(req);

  const { mentorId, startTime, hours, title, description } = await req.json();
  const clientId = req.user;

  // Validate and correct the date format for startTime
  const parsedStartTime = moment.utc(startTime);
  const sessionLink = "http://google.com";

  if (!parsedStartTime.isValid()) {
    return NextResponse.json({ message: 'Invalid start time format. Use YYYY-MM-DDTHH:MM:SS.sssZ' }, { status: 400 });
  }

  // Calculate endTime by adding the specified hours to startTime
  const parsedEndTime = parsedStartTime.clone().add(Number(hours), 'hours');

  // Ensure the session start time is at least one hour from now
  const oneHourFromNow = moment.utc().add(1, 'hours');
  if (parsedStartTime.isBefore(oneHourFromNow)) {
    return NextResponse.json({ message: 'Session start time must be at least one hour from now' }, { status: 400 });
  }

  try {
    const client = await User.findById(clientId);
    const mentor = await User.findById(mentorId);

    if (!client || !mentor) {
      return NextResponse.json({ message: !client ? 'Client not found' : 'Mentor not found' }, { status: 404 });
    }

    if (client.role !== 'Client') {
      return NextResponse.json({ message: 'Only Clients are allowed to book sessions' }, { status: 403 });
    }

    const sessionRate = mentor.rate * Number(hours);
    if (client.walletBalance < sessionRate) {
      return NextResponse.json({ message: 'Insufficient wallet balance to book a session' }, { status: 400 });
    }

    const overlappingSessions = await Sessions.find({
      mentor: mentorId,
      startTime: { $lt: parsedEndTime.toDate() },
      endTime: { $gt: parsedStartTime.toDate() },
    });

    if (overlappingSessions.length > 0) {
      return NextResponse.json({ message: 'Mentor is unavailable during the requested time' }, { status: 409 });
    }

    const newSession = await Sessions.create({
      title,
      description,
      sessionLink,
      startTime: parsedStartTime.toDate(),
      endTime: parsedEndTime.toDate(),
      mentor: mentorId,
      Client: clientId,
    });

    client.walletBalance -= sessionRate;
    mentor.walletBalance += sessionRate;

    // Remove the booked time slot from the mentor's availability
    mentor.availability.times = mentor.availability.times.filter(time => {
      const mentorStartTime = moment.utc(time.start).toDate().getTime();
      const mentorEndTime = moment.utc(time.end).toDate().getTime();
      return !(mentorStartTime === parsedStartTime.toDate().getTime() && mentorEndTime === parsedEndTime.toDate().getTime());
    });

    await Promise.all([client.save(), mentor.save()]);

    sendConfirmationEmail(client, newSession, mentor);
    scheduleReminderEmail(client, newSession, mentor);

    let response = NextResponse.json({ message: 'Successfully booked a session', sessionId: newSession._id }, { status: 201 });
    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Error during booking:', error);
    return NextResponse.json({ message: 'Error booking a session', error: error.message }, { status: 500 });
  }
}
