import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../lib/mongodb';
import User, { IUser } from '../models/User';

export interface AuthenticatedRequest extends NextRequest {
  user?: IUser;
}

export async function authenticateToken(req: NextRequest): Promise<NextResponse | null> {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    await connectDB();
    const user = await User.findById(decoded.userId).select('-password');

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'Invalid or inactive user' },
        { status: 401 }
      );
    }

    (req as any).user = user;
    return null;
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}

export function requireRole(roles: string[]) {
  return (req: NextRequest): NextResponse | null => {
    const user = (req as any).user as IUser;

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!roles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return null;
  };
}

export function requireOwnershipOrAdmin(resourceField: string) {
  return (req: NextRequest): NextResponse | null => {
    const user = (req as any).user as IUser;

    if (user.role === 'admin') {
      return null;
    }

    const resource = (req as any)[resourceField];
    if (resource && resource.toString() === user._id.toString()) {
      return null;
    }

    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    );
  };
}