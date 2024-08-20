import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { checkTokenMiddleware, addCorsHeaders } from '@/lib/middleware';

export async function GET(req) {
  await dbConnect();
  await checkTokenMiddleware(req);
  const userId = req.user;

  if (!userId) {
    return NextResponse.json({ message: "User ID is missing in the request" }, { status: 400 });
  }

  try {
    const user = await User.findById(userId, "walletBalance");

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    let response = NextResponse.json({ currentWalletBalance: user.walletBalance }, { status: 200 });
    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error("Error fetching mentor data:", error);
    return NextResponse.json({ message: "Error fetching mentor data" }, { status: 500 });
  }
}
