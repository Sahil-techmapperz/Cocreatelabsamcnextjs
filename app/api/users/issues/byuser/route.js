import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { checkTokenMiddleware } from '@/lib/middleware';
import IssueReport from '@/models/IssueReport';

export async function GET(req) {
  try {
    await dbConnect();
    await checkTokenMiddleware(req);
    const userId = req.user;

      const issues = await IssueReport.find({ repotedBy: userId }).populate('repotedBy', 'name email');
      return NextResponse.json(issues);
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}