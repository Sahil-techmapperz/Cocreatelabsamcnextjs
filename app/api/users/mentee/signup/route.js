// app/api/users/signup/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';
import util from 'util';
import { addCorsHeaders } from '@/lib/middleware';

const scrypt = util.promisify(crypto.scrypt);

export async function POST(req) {
  try {
    await dbConnect();
    const { name, email, password, ...otherFields } = await req.json();

    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return NextResponse.json({ message: 'Mentee already exists' }, { status: 400 });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPasswordBuffer = await scrypt(password, salt, 64);
    const hashedPassword = `${salt}:${hashedPasswordBuffer.toString('hex')}`;

    user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role :"Client",
      ...otherFields
    });

    await user.save();

    let response = NextResponse.json({ message: 'Mentee registered successfully' }, { status: 201 });
    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
