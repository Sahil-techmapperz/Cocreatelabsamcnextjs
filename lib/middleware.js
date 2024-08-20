// lib/middleware.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { parseCookies } from './parseCookies';

export async function checkTokenMiddleware(req) {
  try {
    const cookies = parseCookies(req);
    const token = cookies.token; // Assuming the token is stored under the key 'token'

    if (!token) {
      return new NextResponse(JSON.stringify({ message: 'Authorization token is missing' }), { status: 401 });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-very-secure-secret');
    req.user = decoded.userId; // Store the user ID from token in request for further use
    return NextResponse.next(); // Continue with the processing if the token is valid
  } catch (error) {
    console.error('Token verification failed:', error);
    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 403 });
  }
}

export function addCorsHeaders(response) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}


// Helper function to calculate the withdrawal fee
export function calculateFee(amount, method) {
  const baseFee = 1; // Example base fee
  switch (method) {
      case 'bank_transfer':
          return baseFee + amount * 0.02; // 2% fee for bank transfer
      case 'paypal':
          return baseFee + amount * 0.03; // 3% fee for PayPal
      case 'stripe':
          return baseFee + amount * 0.025; // 2.5% fee for Stripe
      case 'crypto':
          return baseFee + amount * 0.01; // 1% fee for crypto
      default:
          return baseFee; // Default fee if method is unknown
  }
}
