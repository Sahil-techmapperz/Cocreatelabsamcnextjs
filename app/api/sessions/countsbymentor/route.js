import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sessions from '@/models/Sessions';
import { checkTokenMiddleware, addCorsHeaders } from '@/lib/middleware';
import { getMonthDateRanges } from '@/lib/MonthDateRanges';


export async function GET(req) {
  await dbConnect();
  await checkTokenMiddleware(req);
  const mentorId = req.user;

  try {
    const { currentMonth, lastMonth } = getMonthDateRanges();

    const [currentMonthCount, lastMonthCount] = await Promise.all([
      Sessions.countDocuments({ mentor: mentorId, status: { $ne: "Canceled" }, startTime: { $gte: currentMonth.start, $lte: currentMonth.end } }),
      Sessions.countDocuments({ mentor: mentorId, status: { $ne: "Canceled" }, startTime: { $gte: lastMonth.start, $lte: lastMonth.end } })
    ]);

    let percentageChange = 0;
    if (lastMonthCount > 0) {
      percentageChange = ((currentMonthCount - lastMonthCount) / lastMonthCount) * 100;
    }

    let response = NextResponse.json({
      currentMonthCount,
      lastMonthCount,
      percentageChange: percentageChange.toFixed(2) + '%',
    }, { status: 200 });

    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Error retrieving session counts:', error);
    return NextResponse.json({ message: 'Error retrieving session counts' }, { status: 500 });
  }
}
