import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import Ticket from '@/models/Ticket';
import Notification from '@/models/Notification';
import { authenticateToken, requireOwnershipOrAdmin } from '@/middleware/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const authError = await authenticateToken(req);
    if (authError) return authError;

    const ownershipError = requireOwnershipOrAdmin('userId')(req);
    if (ownershipError) return ownershipError;

    await connectDB();

    const userId = params.userId;

    // Get user's tickets with event details
    const tickets = await Ticket.find({ buyer: userId })
      .populate('event', 'title date venue status category images')
      .sort({ purchaseDate: -1 })
      .limit(5);

    // Categorize events
    const now = new Date();
    const upcomingEvents = tickets.filter(ticket =>
      new Date(ticket.event.date) > now && ticket.status === 'purchased'
    );
    const pastEvents = tickets.filter(ticket =>
      new Date(ticket.event.date) <= now && (ticket.status === 'purchased' || ticket.status === 'used')
    );

    // Get notifications
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(10);

    const unreadNotifications = notifications.filter(n => !n.isRead).length;

    // Get tickets statistics
    const totalTickets = await Ticket.countDocuments({ buyer: userId });
    const usedTickets = await Ticket.countDocuments({
      buyer: userId,
      status: 'used'
    });
    const purchasedTickets = await Ticket.countDocuments({
      buyer: userId,
      status: 'purchased'
    });

    return NextResponse.json({
      success: true,
      dashboard: {
        user: {
          totalTickets,
          usedTickets,
          purchasedTickets,
          unreadNotifications
        },
        upcomingEvents: upcomingEvents.slice(0, 5),
        pastEvents: pastEvents.slice(0, 5),
        recentTickets: tickets.slice(0, 3),
        notifications
      }
    });

  } catch (error: any) {
    console.error('Student dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}