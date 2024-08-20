import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sessions from '@/models/Sessions';
import User from '@/models/User';
import { checkTokenMiddleware, addCorsHeaders } from '@/lib/middleware';
import correctDateFormat from '@/lib/dateFormat';
import { sendRescheduleEmail } from '@/lib/Emailsetup';


export async function PATCH(req) {
  await dbConnect();
  await checkTokenMiddleware(req);

  const { id } = req.params;
  const { StartTime, hours } = await req.json();
  const userId = req.user;

  const mentor = await User.findById(userId);

  if (!mentor || mentor.role !== 'Mentor') {
    return NextResponse.json({ message: 'Only Mentors are allowed to reschedule sessions' }, { status: 403 });
  }

  const parsedStartTime = correctDateFormat(StartTime);
  if (!parsedStartTime) {
    return NextResponse.json({ message: 'Invalid start time format' }, { status: 400 });
  }

  const parsedEndTime = new Date(parsedStartTime.getTime());
  parsedEndTime.setHours(parsedEndTime.getHours() + (hours || 1));

  const updates = {
    startTime: parsedStartTime,
    endTime: parsedEndTime,
    status: "Reschedule",
  };

  try {
    const session = await Sessions.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!session) {
      return NextResponse.json({ message: 'Session not found' }, { status: 404 });
    }

    const RescheduleEmailsession = await Sessions.findById(id).populate('Client', 'name email').populate('mentor', 'name');

    await sendRescheduleEmail(RescheduleEmailsession);

    const Newsessions = await Sessions.find({ mentor: userId }).populate('Client', 'name profilePictureUrl');

    let response = NextResponse.json({ message: 'Session rescheduled successfully', data: Newsessions }, { status: 200 });
    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Error rescheduling session:', error);
    const statusCode = error.name === 'ValidationError' ? 400 : 500;
    return NextResponse.json({ message: 'Error rescheduling session' }, { status: statusCode });
  }
}
