// app/api/users/login/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';
import util from 'util';
import jwt from 'jsonwebtoken';
import { addCorsHeaders } from '@/lib/middleware';

const scrypt = util.promisify(crypto.scrypt);
const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secure-secret';

export async function POST(req) {
  try {
    await dbConnect();
    const { email, password, remember } = await req.json();

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const [salt, storedHash] = user.password.split(':');
    const hashedBuffer = await scrypt(password, salt, 64);
    const hashedPassword = hashedBuffer.toString('hex');

    if (storedHash !== hashedPassword) {
      return NextResponse.json({ message: 'Invalid password' }, { status: 401 });
    }

    const expiresIn = remember ? '1d' : '1h';
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn });

    let response = NextResponse.json({ message: 'Login successful', token, user, expiresIn }, { status: 200 });
    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
