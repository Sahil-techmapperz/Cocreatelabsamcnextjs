// app/api/users/admin/[userId]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { checkTokenMiddleware, addCorsHeaders } from '@/lib/middleware';
import crypto from 'crypto';
import util from 'util';
const scrypt = util.promisify(crypto.scrypt);


export async function POST(req) {
    try {
      await dbConnect();
      await checkTokenMiddleware(req);
  
      const { name, email, password, role, rate, ...otherFields } = await req.json();
      const adminId = req.user;
  
      // Check if the current user is an admin
      const admin = await User.findById(adminId);
      if (!admin || admin.role !== 'Admin') {
        return NextResponse.json({ message: 'Admin privileges required' }, { status: 403 });
      }
  
      // Check if a user with the given email already exists
      let user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        return NextResponse.json({ message: 'User already exists with this email' }, { status: 400 });
      }
  
      // Generate a salt and hash the password
      const salt = crypto.randomBytes(16).toString('hex');
      const hashedPasswordBuffer = await scrypt(password, salt, 64);
      const hashedPassword = `${salt}:${hashedPasswordBuffer.toString('hex')}`;
  
      // Create and save the new mentor
      user = new User({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role || 'Mentor',
        rate,
        ...otherFields
      });
  
      await user.save();
  
      let response = NextResponse.json({ message: 'Mentor added successfully', user }, { status: 201 });
      response = addCorsHeaders(response);
      return response;
    } catch (error) {
      console.error('Internal Server Error:', error);
      return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
  }

export async function PATCH(req, { params }) {
  try {
    await dbConnect();
    await checkTokenMiddleware(req);

    const { userId } = params;  // Dynamic userId from the URL
    const { role, rate, name, email } = await req.json();
    const adminId = req.user;

    // Check if the current user is an admin
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'Admin') {
      return NextResponse.json({ message: 'Admin privileges required' }, { status: 403 });
    }

    // Find and update the user's details
    const user = await User.findByIdAndUpdate(userId, { role, rate, name, email }, { new: true, runValidators: true });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    let response = NextResponse.json({ message: 'User updated successfully', user }, { status: 200 });
    response = addCorsHeaders(response);
    return response;
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    await checkTokenMiddleware(req);

    const { userId } = params;  // Dynamic userId from the URL
    const adminId = req.user;

    // Check if the current user is an admin
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'Admin') {
      return NextResponse.json({ message: 'Admin privileges required' }, { status: 403 });
    }

    // Find and delete the user
    const user = await User.findByIdAndDelete(userId);
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
