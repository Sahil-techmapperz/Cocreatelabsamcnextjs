// app/api/sessions/revenue-withdrawal/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sessions from '@/models/Sessions';
import Withdrawal from '@/models/Withdrawal';
import mongoose from 'mongoose';
import { checkTokenMiddleware, addCorsHeaders } from '@/lib/middleware';

export async function GET(req) {
  await dbConnect();
  await checkTokenMiddleware(req);

  const mentorId = req.user;

  if (!mongoose.Types.ObjectId.isValid(mentorId)) {
    return NextResponse.json({ message: 'Invalid mentorId provided' }, { status: 400 });
  }

  try {
    const allTimeDailyRevenue = await Sessions.aggregate([
      {
        $match: {
          mentor: new mongoose.Types.ObjectId(mentorId),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'mentor',
          foreignField: '_id',
          as: 'mentorDetails',
        },
      },
      { $unwind: '$mentorDetails' },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
          totalRevenue: { $sum: '$mentorDetails.rate' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const allTimeDailyWithdrawals = await Withdrawal.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(mentorId),
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$requestedAt" } },
          totalWithdrawal: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get all unique dates from both revenue and withdrawal arrays
    const uniqueDates = new Set([
      ...allTimeDailyRevenue.map((item) => item._id),
      ...allTimeDailyWithdrawals.map((item) => item._id),
    ]);

    // Map over unique dates to create the final financial data
    const allTimeFinancials = Array.from(uniqueDates).map((date) => {
      const revenueEntry = allTimeDailyRevenue.find((r) => r._id === date) || { totalRevenue: 0 };
      const withdrawalEntry = allTimeDailyWithdrawals.find((w) => w._id === date) || { totalWithdrawal: 0 };
      return {
        date: date,
        Revenue: revenueEntry.totalRevenue,
        Withdrawal: withdrawalEntry.totalWithdrawal,
      };
    });

    let response = NextResponse.json(allTimeFinancials, { status: 200 });
    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Error fetching financials:', error);
    return NextResponse.json({ message: 'Error fetching financials', error: error.message }, { status: 500 });
  }
}
