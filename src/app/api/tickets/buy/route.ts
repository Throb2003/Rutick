import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import Ticket from '@/models/Ticket';
import Transaction from '@/models/Transaction';
import { authenticateToken } from '@/middleware/auth';
import { validateTicketPurchase } from '@/lib/validators';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const authError = await authenticateToken(req);
    if (authError) return authError;

    const body = await req.json();

    // Validate input
    const { error, value } = validateTicketPurchase.validate(body);
    if (error) {
      return NextResponse.json(
        { error: error.details[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    const user = (req as any).user;

    // Get event
    const event = await Event.findById(value.eventId);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.status !== 'published') {
      return NextResponse.json(
        { error: 'Event is not available for purchase' },
        { status: 400 }
      );
    }

    // Find ticket type
    const ticketType = event.ticketTypes.find(
      (t: any) => t.type === value.ticketType
    );

    if (!ticketType) {
      return NextResponse.json(
        { error: 'Invalid ticket type' },
        { status: 400 }
      );
    }

    // Check availability
    if (ticketType.available < value.quantity) {
      return NextResponse.json(
        { error: 'Not enough tickets available' },
        { status: 400 }
      );
    }

    // Check if user already purchased tickets for this event
    const existingTickets = await Ticket.find({
      event: value.eventId,
      buyer: user._id,
      status: 'purchased'
    });

    const totalQuantity = existingTickets.reduce((sum, ticket) => sum + 1, 0) + value.quantity;
    const maxTicketsPerUser = 10;

    if (totalQuantity > maxTicketsPerUser) {
      return NextResponse.json(
        { error: `Maximum ${maxTicketsPerUser} tickets per user for this event` },
        { status: 400 }
      );
    }

    // Calculate total amount
    const totalAmount = ticketType.price * value.quantity;

    // Create tickets
    const tickets = [];
    for (let i = 0; i < value.quantity; i++) {
      const ticket = new Ticket({
        event: value.eventId,
        buyer: user._id,
        type: value.ticketType,
        price: ticketType.price,
        qrCode: uuidv4(),
        transactionId: null // Will be set after payment
      });
      tickets.push(ticket);
    }

    // Save tickets
    const savedTickets = await Ticket.insertMany(tickets);

    // Create transaction record
    const transaction = new Transaction({
      tickets: savedTickets.map(t => t._id),
      buyer: user._id,
      amount: totalAmount,
      status: 'pending',
      paymentMethod: 'pending' // Will be updated during payment
    });

    await transaction.save();

    // Update transaction references in tickets
    await Ticket.updateMany(
      { _id: { $in: savedTickets.map(t => t._id) } },
      { transactionId: transaction._id }
    );

    // Update available tickets count
    event.ticketTypes.find((t: any) => t.type === value.ticketType)!.available -= value.quantity;
    await event.save();

    return NextResponse.json({
      success: true,
      tickets: savedTickets,
      transaction: transaction,
      totalAmount,
      message: 'Tickets created successfully. Please complete payment.'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Buy tickets error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}