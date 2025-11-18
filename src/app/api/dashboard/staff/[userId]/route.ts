import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import Ticket from '@/models/Ticket';
import Transaction from '@/models/Transaction';
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

    // Get user's events
    const myEvents = await Event.find({ organizer: userId })
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate sales statistics
    const eventIds = myEvents.map(event => event._id);

    // Get all tickets for user's events
    const tickets = await Ticket.find({
      event: { $in: eventIds }
    }).populate({
      path: 'event',
      select: 'title capacity date'
    }).populate({
      path: 'buyer',
      select: 'name email'
    });

    // Get completed transactions
    const transactions = await Transaction.find({
      status: 'completed',
      event: { $in: eventIds }
    });

    const totalSales = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const totalTicketsSold = tickets.filter(ticket => ticket.status === 'used').length;
    const totalTicketsPurchased = tickets.filter(ticket => ticket.status === 'purchased' || ticket.status === 'used').length;

    // Revenue by event
    const eventSales = {};
    transactions.forEach(transaction => {
      const eventId = transaction.tickets[0]?.toString();
      if (eventId) {
        if (!eventSales[eventId]) {
          eventSales[eventId] = 0;
        }
        eventSales[eventId] += transaction.amount;
      }
    });

    // Upcoming events management data
    const now = new Date();
    const upcomingEvents = myEvents.filter(event => new Date(event.date) > now);
    const pastEvents = myEvents.filter(event => new Date(event.date) <= now);

    // Recent activity (last 5 tickets sold)
    const recentActivity = tickets
      .sort({ purchaseDate: -1 })
      .slice(0, 5)
      .map(ticket => ({
        type: 'ticket_sold',
        ticketId: ticket._id,
        eventTitle: (ticket.event as any)?.title,
        buyerName: (ticket.buyer as any)?.name,
        purchaseDate: ticket.purchaseDate,
        amount: ticket.price
      }));

    return NextResponse.json({
      success: true,
      dashboard: {
        stats: {
          totalEvents: myEvents.length,
          upcomingEvents: upcomingEvents.length,
          pastEvents: pastEvents.length,
          totalSales,
          totalTicketsSold,
          totalTicketsPurchased
        },
        myEvents: myEvents.slice(0, 5),
        upcomingEvents: upcomingEvents.slice(0, 3),
        recentActivity,
        attendeeList: tickets.map(ticket => ({
          ticket: ticket,
          buyer: ticket.buyer,
          event: ticket.event,
          status: ticket.status
        })).slice(0, 10)
      }
    });

  } catch (error: any) {
    console.error('Staff dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}