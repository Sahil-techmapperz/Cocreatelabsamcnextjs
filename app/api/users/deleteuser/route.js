// app/api/users/deleteuser/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { checkTokenMiddleware, addCorsHeaders } from '@/lib/middleware';

export async function DELETE(req) {
  try {
    await dbConnect();
    await checkTokenMiddleware(req);

    const { _id } = await req.json();
    const Userid = req.user;

    const admin = await User.findById(Userid);
    if (!admin) {
      return NextResponse.json({ message: 'Admin not found' }, { status: 400 });
    }

    const user = await User.findByIdAndDelete(_id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    let response = NextResponse.json({ message: 'User deleted successfully', user }, { status: 200 });
    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
