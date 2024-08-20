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

    const countUniqueClients = async (dateRange) => {
      const clients = await Sessions.find({
        mentor: mentorId,
        status: { $ne: 'Canceled' },
        startTime: { $gte: dateRange.start, $lte: dateRange.end },
      });

      const clientCount = new Set();
      clients.forEach((c) => {
        clientCount.add(c.Client.toString());
      });

      return clientCount.size || 0;
    };

    const [currentMonthClientCount, lastMonthClientCount] = await Promise.all([
      countUniqueClients(currentMonth),
      countUniqueClients(lastMonth),
    ]);

    let percentageChange = 0;
    if (lastMonthClientCount > 0) {
      percentageChange = ((currentMonthClientCount - lastMonthClientCount) / lastMonthClientCount) * 100;
    }

    let response = NextResponse.json({
      lastMonthClientCount,
      currentMonthClientCount,
      percentageChange: percentageChange.toFixed(2) + '%',
    }, { status: 200 });

    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Error retrieving client counts:', error);
    return NextResponse.json({ message: 'Error retrieving client counts' }, { status: 500 });
  }
}
