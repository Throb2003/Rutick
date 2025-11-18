import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import { authenticateToken, requireRole } from '@/middleware/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = await authenticateToken(req);
    if (authError) return authError;

    const body = await req.json();

    if (!body.qrCode) {
      return NextResponse.json(
        { error: 'QR code is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find ticket by ID and QR code
    const ticket = await Ticket.findById(params.id)
      .populate('event', 'title date venue')
      .populate('buyer', 'name email');

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Verify QR code matches
    if (ticket.qrCode !== body.qrCode) {
      return NextResponse.json(
        { error: 'Invalid QR code' },
        { status: 400 }
      );
    }

    // Check ticket status
    if (ticket.status === 'used') {
      return NextResponse.json(
        { error: 'Ticket already used' },
        { status: 400 }
      );
    }

    if (ticket.status !== 'purchased') {
      return NextResponse.json(
        { error: 'Ticket is not valid for check-in' },
        { status: 400 }
      );
    }

    // Check if event is still active
    const eventDate = new Date(ticket.event.date);
    const now = new Date();

    if (eventDate < now && !isSameDay(eventDate, now)) {
      return NextResponse.json(
        { error: 'Event has passed' },
        { status: 400 }
      );
    }

    const user = (req as any).user;

    // Update ticket status
    ticket.status = 'used';
    ticket.usedDate = new Date();
    ticket.checkedInBy = user._id;
    await ticket.save();

    return NextResponse.json({
      success: true,
      ticket,
      message: 'Ticket checked in successfully'
    });

  } catch (error: any) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}