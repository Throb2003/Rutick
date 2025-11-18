import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import User from '@/models/User';
import { authenticateToken, requireRole } from '@/middleware/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const date = searchParams.get('date');
    const featured = searchParams.get('featured');

    // Build query
    const query: any = { status: 'published' };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (date) {
      const now = new Date();
      if (date === 'upcoming') {
        query.date = { $gte: now };
      } else if (date === 'past') {
        query.date = { $lt: now };
      }
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    const skip = (page - 1) * limit;

    // Get events with pagination
    const events = await Event.find(query)
      .populate('organizer', 'name email profilePic')
      .sort({ date: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments(query);

    return NextResponse.json({
      success: true,
      events,
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
    console.error('Get events error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authError = await authenticateToken(req);
    if (authError) return authError;

    const roleError = requireRole(['staff', 'admin'])(req);
    if (roleError) return roleError;

    const user = (req as any).user;
    const body = await req.json();

    // Basic validation
    if (!body.title || !body.description || !body.category || !body.date || !body.venue || !body.capacity || !body.ticketTypes) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    // Create event
    const eventData = {
      ...body,
      organizer: user._id,
      date: new Date(body.date),
      endDate: body.endDate ? new Date(body.endDate) : undefined
    };

    const event = new Event(eventData);
    await event.save();

    // Populate organizer info for response
    await event.populate('organizer', 'name email profilePic');

    return NextResponse.json({
      success: true,
      event
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create event error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}