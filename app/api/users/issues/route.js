import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { checkTokenMiddleware } from '@/lib/middleware';
import IssueReport from '@/models/IssueReport';

export async function GET(req) {
  try {
    // Ensure database connection is established
    await dbConnect();
    
    // Execute the token check middleware directly and handle possible rejections
    await checkTokenMiddleware(req);


    // Retrieve the issues, ensuring no errors in query or population
    const issues = await IssueReport.find({}).populate('repotedBy', 'name email');
    if (!issues) {
      throw new Error("No issues found or error in fetching issues.");
    }
    
    // Successfully return issues if no problems occur
    return NextResponse.json(issues);
  } catch (err) {
    console.error("Failed to fetch issues:", err);
    return NextResponse.json({ message: err.message || "Unknown error occurred" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    await checkTokenMiddleware(req);

    const userId = req.user;
    const { issue, status, reply } = await req.json();

    const newIssueReport = new IssueReport({
      issue,
      repotedTime: new Date(),
      repotedBy: userId,
      status,
      reply
    });

    const savedIssue = await newIssueReport.save();
    return NextResponse.json(savedIssue, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}


