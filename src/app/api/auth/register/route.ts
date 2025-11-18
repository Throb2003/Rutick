import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateTokens } from '@/lib/jwt';
import { validateRegistration } from '@/lib/validators';
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { error: 'Too many registration attempts, please try again later' },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const { error, value } = validateRegistration.validate(body);
    if (error) {
      return NextResponse.json(
        { error: error.details[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: value.email },
        ...(value.universityId ? [{ universityId: value.universityId }] : [])
      ]
    });

    if (existingUser) {
      if (existingUser.email === value.email) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 400 }
        );
      }
      if (existingUser.universityId === value.universityId) {
        return NextResponse.json(
          { error: 'University ID already registered' },
          { status: 400 }
        );
      }
    }

    // Create new user
    const user = new User(value);
    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Remove password from response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      universityId: user.universityId,
      profilePic: user.profilePic,
      phone: user.phone,
      department: user.department,
      isActive: user.isActive,
      createdAt: user.createdAt
    };

    return NextResponse.json({
      success: true,
      user: userResponse,
      token: accessToken,
      refreshToken
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration error:', error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return NextResponse.json(
        { error: `${field} already exists` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}