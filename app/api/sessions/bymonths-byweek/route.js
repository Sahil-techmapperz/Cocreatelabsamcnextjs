// app/api/sessions/bymonths-byweek/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sessions from '@/models/Sessions';
import { checkTokenMiddleware } from '@/lib/middleware';
import mongoose from 'mongoose';
import moment from 'moment';

export async function GET(req) {
  try {
    await dbConnect();
    await checkTokenMiddleware(req);
    const userId = req.user;

    // Find the sessions for the mentor
    const sessions = await Sessions.find({ mentor: userId });

    // Aggregate sessions by month
    const sessionsByMonth = sessions.reduce((acc, session) => {
      const month = moment(session.startTime).format('MMM');
      acc[month] = acc[month] ? acc[month] + 1 : 1;
      return acc;
    }, {});

    const All_Sessions_By_months = Object.keys(sessionsByMonth).map(month => ({
      name: month,
      amount: sessionsByMonth[month],
    }));

    // Filter sessions for the current month
    const currentMonth = moment().month();
    const sessionsThisMonth = sessions.filter(session => moment(session.startTime).month() === currentMonth);

    // Get the start of the current month
    const startOfMonth = moment().startOf('month');

    // Aggregate sessions by week within the current month
    const sessionsByWeek = sessionsThisMonth.reduce((acc, session) => {
      const weekOfMonth = moment(session.startTime).diff(startOfMonth, 'weeks') + 1;
      acc[weekOfMonth] = acc[weekOfMonth] ? acc[weekOfMonth] + 1 : 1;
      return acc;
    }, {});

    const Sessions_BY_Weeks = Object.keys(sessionsByWeek).map(week => ({
      name: `Week ${week}`,
      amount: sessionsByWeek[week],
    }));

    return NextResponse.json({ All_Sessions_By_months, Sessions_BY_Weeks });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}
