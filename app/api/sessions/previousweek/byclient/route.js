import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sessions from '@/models/Sessions';
import moment from 'moment';
import { checkTokenMiddleware, addCorsHeaders } from '@/lib/middleware';

export async function GET(req) {
  await dbConnect();
  await checkTokenMiddleware(req);
  const clientId = req.user;

  try {
    const now = moment().startOf('isoWeek');
    const previousWeekStart = now.subtract(1, 'weeks').toDate();
    const previousWeekEnd = moment(previousWeekStart).endOf('isoWeek').toDate();

    const previousWeekSessions = await Sessions.find({
      client: clientId,
      startTime: { $gte: previousWeekStart, $lte: previousWeekEnd },
    }).sort({ startTime: -1 });

    const previousWeekRange = `${moment(previousWeekStart).format('DD')} - ${moment(previousWeekEnd).format('DD MMMM YYYY')}`;

    let response = NextResponse.json({
      sessions: previousWeekSessions,
      previousWeekRange,
    }, { status: 200 });

    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Error fetching previous week sessions:', error);
    return NextResponse.json({ message: 'Error fetching previous week sessions' }, { status: 500 });
  }
}
