// app/api/users/update-password/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';
import util from 'util';
import { checkTokenMiddleware, addCorsHeaders } from '@/lib/middleware';

const scrypt = util.promisify(crypto.scrypt);

export async function PATCH(req) {
  try {
    await dbConnect();
    await checkTokenMiddleware(req);

    const { oldPassword, newPassword } = await req.json();
    const userId = req.user;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const [salt, storedHash] = user.password.split(':');
    const oldPasswordBuffer = await scrypt(oldPassword, salt, 64);
    const hashedOldPassword = oldPasswordBuffer.toString('hex');

    if (storedHash !== hashedOldPassword) {
      return NextResponse.json({ message: 'Old password is incorrect' }, { status: 401 });
    }

    const newSalt = crypto.randomBytes(16).toString('hex');
    const newPasswordBuffer = await scrypt(newPassword, newSalt, 64);
    const hashedNewPassword = `${newSalt}:${newPasswordBuffer.toString('hex')}`;

    user.password = hashedNewPassword;
    await user.save();

    let response = NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
