import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { checkTokenMiddleware } from '@/lib/middleware';
import IssueReport from '@/models/IssueReport';

export async function PATCH(req, { params }) {
    try {
      await dbConnect();
      await checkTokenMiddleware(req);
  
      const { id } = params;
      const { issue, status, reply } = await req.json();
  
      const updateFields = {};
  
      if (issue) updateFields.issue = issue;
      if (reply) updateFields.reply = reply;
      if (status) updateFields.status = status;
  
      const updatedIssue = await IssueReport.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true, runValidators: true }
      );
  
      if (!updatedIssue) {
        return NextResponse.json({ message: 'Issue report not found' }, { status: 404 });
      }
  
      return NextResponse.json(updatedIssue);
    } catch (err) {
      return NextResponse.json({ message: err.message }, { status: 400 });
    }
  }
  
  export async function DELETE(req, { params }) {
    try {
      await dbConnect();
      await checkTokenMiddleware(req);
  
      const { id } = params;
      const issue = await IssueReport.findById(id);
  
      if (!issue) {
        return NextResponse.json({ message: 'Issue report not found' }, { status: 404 });
      }
  
      await IssueReport.deleteOne({ _id: id });
      return NextResponse.json({ message: 'Issue report deleted' });
    } catch (err) {
      return NextResponse.json({ message: err.message }, { status: 500 });
    }
  }