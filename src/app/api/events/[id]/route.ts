import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import { authenticateToken, requireRole, requireOwnershipOrAdmin } from '@/middleware/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const event = await Event.findById(params.id)
      .populate('organizer', 'name email profilePic department');

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to view draft events
    if (event.status === 'draft') {
      const authError = await authenticateToken(req);
      if (authError) return authError;

      const user = (req as any).user;
      const ownerError = requireOwnershipOrAdmin('organizer')(req);
      if (ownerError) return ownerError;
    }

    return NextResponse.json({
      success: true,
      event
    });

  } catch (error: any) {
    console.error('Get event error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = await authenticateToken(req);
    if (authError) return authError;

    await connectDB();

    const event = await Event.findById(params.id);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check ownership or admin permissions
    const user = (req as any).user;
    if (user.role !== 'admin' && event.organizer.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Don't allow editing published events (only admins can)
    if (event.status === 'published' && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Cannot edit published events' },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Update event
    const updatedEvent = await Event.findByIdAndUpdate(
      params.id,
      { ...body, date: body.date ? new Date(body.date) : undefined },
      { new: true, runValidators: true }
    ).populate('organizer', 'name email profilePic');

    return NextResponse.json({
      success: true,
      event: updatedEvent
    });

  } catch (error: any) {
    console.error('Update event error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = await authenticateToken(req);
    if (authError) return authError;

    await connectDB();

    const event = await Event.findById(params.id);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check ownership or admin permissions
    const user = (req as any).user;
    if (user.role !== 'admin' && event.organizer.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Check if tickets have been sold
    const Ticket = (await import('@/models/Ticket')).default;
    const ticketsSold = await Ticket.countDocuments({
      event: params.id,
      status: 'purchased'
    });

    if (ticketsSold > 0 && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Cannot delete event with sold tickets' },
        { status: 400 }
      );
    }

    // Soft delete by marking as cancelled
    event.status = 'cancelled';
    await event.save();

    return NextResponse.json({
      success: true,
      message: 'Event cancelled successfully'
    });

  } catch (error: any) {
    console.error('Delete event error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}