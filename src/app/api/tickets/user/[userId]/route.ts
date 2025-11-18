import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import { authenticateToken, requireOwnershipOrAdmin } from '@/middleware/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const authError = await authenticateToken(req);
    if (authError) return authError;

    const user = (req as any).user;

    // Check if user can access these tickets
    const ownershipError = requireOwnershipOrAdmin('userId')(req);
    if (ownershipError) return ownershipError;

    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const upcoming = searchParams.get('upcoming');

    // Build query
    const query: any = { buyer: params.userId };

    if (status) {
      query.status = status;
    }

    if (upcoming === 'true') {
      query['event.date'] = { $gte: new Date() };
    }

    const skip = (page - 1) * limit;

    // Get tickets with event details
    const tickets = await Ticket.find(query)
      .populate('event', 'title date venue status category images')
      .populate('transactionId', 'amount status paymentDate')
      .sort({ purchaseDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Ticket.countDocuments(query);

    return NextResponse.json({
      success: true,
      tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error: any) {
    console.error('Get user tickets error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}