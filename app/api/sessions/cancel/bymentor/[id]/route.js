import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sessions from '@/models/Sessions';
import User from '@/models/User';
import { checkTokenMiddleware, addCorsHeaders } from '@/lib/middleware';
import { sendCancellationEmail } from '@/lib/Emailsetup';
import { refundClient } from '@/lib/RefundClient';


export async function PATCH(req,{ params }) {
  await dbConnect();
  await checkTokenMiddleware(req);

  const { id } = params;
  const userId = req.user;

  const mentor = await User.findById(userId);

  if (!mentor || mentor.role !== 'Mentor') {
    return NextResponse.json({ message: 'Only Mentors are allowed to cancel sessions' }, { status: 403 });
  }

  try {
    const session = await Sessions.findById(id).populate('Client', 'name email').populate('mentor', 'name rate');

    if (!session) {
      return NextResponse.json({ message: 'Session not found' }, { status: 404 });
    }

    if (session.status === 'Canceled') {
      return NextResponse.json({ message: 'Session is already canceled' }, { status: 409 });
    }

    const durationMillis = new Date(session.endTime) - new Date(session.startTime);
    const durationHours = durationMillis / (1000 * 60 * 60);
    const refundAmount = session.mentor.rate * durationHours;

    session.status = 'Canceled';

    const refundResult = await refundClient(session.Client._id, session.mentor._id, refundAmount, id);
    await session.save();

    await sendCancellationEmail(session);

    const Newsessions = await Sessions.find({ mentor: userId }).populate('Client', 'name profilePictureUrl');

    let response = NextResponse.json({ message: 'Session canceled successfully', data: Newsessions, refundResult }, { status: 200 });
    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Error canceling session:', error);
    const statusCode = error.name === 'ValidationError' ? 400 : 500;
    return NextResponse.json({ message: 'Error canceling session' }, { status: statusCode });
  }
}
