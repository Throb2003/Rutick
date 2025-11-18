import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import { authenticateToken } from '@/middleware/auth';
import QRCode from 'qrcode';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = await authenticateToken(req);
    if (authError) return authError;

    const user = (req as any).user;

    await connectDB();

    // Find ticket
    const ticket = await Ticket.findById(params.id)
      .populate('buyer', 'name email')
      .populate('event', 'title date venue');

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Check if user owns this ticket or is admin/staff
    if (user.role === 'student' && ticket.buyer._id.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Generate QR code data
    const qrData = JSON.stringify({
      ticketId: ticket._id,
      qrCode: ticket.qrCode,
      eventTitle: ticket.event.title,
      eventName: ticket.event.title,
      eventDate: ticket.event.date,
      venue: ticket.event.venue,
      ticketType: ticket.type,
      buyerName: ticket.buyer.name
    });

    // Generate QR code as base64 image
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return NextResponse.json({
      success: true,
      qrCode: qrCodeDataUrl,
      ticket: {
        id: ticket._id,
        eventTitle: ticket.event.title,
        eventDate: ticket.event.date,
        venue: ticket.event.venue,
        ticketType: ticket.type,
        qrCode: ticket.qrCode,
        status: ticket.status,
        buyerName: ticket.buyer.name
      }
    });

  } catch (error: any) {
    console.error('Generate QR code error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}