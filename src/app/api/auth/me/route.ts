import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/middleware/auth';

export async function GET(req: NextRequest) {
  try {
    const authError = await authenticateToken(req);
    if (authError) return authError;

    const user = (req as any).user;

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
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    };

    return NextResponse.json({
      success: true,
      user: userResponse
    });

  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}