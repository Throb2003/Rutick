import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Ticket from '@/models/Ticket';
import { authenticateToken } from '@/middleware/auth';
import { validatePayment } from '@/lib/validators';

export async function POST(req: NextRequest) {
  try {
    const authError = await authenticateToken(req);
    if (authError) return authError;

    const body = await req.json();

    // Validate input
    const { error, value } = validatePayment.validate(body);
    if (error) {
      return NextResponse.json(
        { error: error.details[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    const user = (req as any).user;

    // Get tickets and validate ownership
    const tickets = await Ticket.find({
      _id: { $in: value.ticketIds },
      buyer: user._id,
      status: 'purchased'
    }).populate('event', 'title');

    if (tickets.length !== value.ticketIds.length) {
      return NextResponse.json(
        { error: 'Some tickets not found or not authorized' },
        { status: 404 }
      );
    }

    // Calculate total amount
    const totalAmount = tickets.reduce((sum, ticket) => sum + ticket.price, 0);

    // Create or update transaction
    const transaction = new Transaction({
      tickets: value.ticketIds,
      buyer: user._id,
      amount: totalAmount,
      paymentMethod: value.paymentMethod,
      status: 'pending'
    });

    await transaction.save();

    // Update ticket transaction references
    await Ticket.updateMany(
      { _id: { $in: value.ticketIds } },
      { transactionId: transaction._id }
    );

    // Process payment based on method
    let paymentResponse;

    if (value.paymentMethod === 'mpesa') {
      // Simulate M-Pesa payment (for now)
      paymentResponse = await simulateMpesaPayment(
        value.phoneNumber,
        totalAmount,
        transaction._id.toString()
      );
    } else if (value.paymentMethod === 'card') {
      // Simulate card payment (for now)
      paymentResponse = await simulateCardPayment(totalAmount, transaction._id.toString());
    } else if (value.paymentMethod === 'cash') {
      // Cash payment (marked as completed)
      paymentResponse = {
        status: 'completed',
        message: 'Cash payment recorded'
      };
    }

    // Update transaction status
    if (paymentResponse.status === 'completed') {
      transaction.status = 'completed';
      transaction.paymentDate = new Date();
      if (value.paymentMethod === 'mpesa') {
        transaction.mpesaTransactionId = paymentResponse.transactionId;
      }
      await transaction.save();
    }

    return NextResponse.json({
      success: true,
      transaction,
      paymentResponse,
      totalAmount,
      message: 'Payment initiated successfully'
    });

  } catch (error: any) {
    console.error('Initiate payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function simulateMpesaPayment(phoneNumber: string, amount: number, transactionId: string) {
  // Simulate M-Pesa STK push
  console.log(`Simulating M-Pesa payment to ${phoneNumber} for KES ${amount}`);

  // Simulate async callback
  setTimeout(async () => {
    try {
      await connectDB();
      const transaction = await Transaction.findById(transactionId);
      if (transaction && transaction.status === 'pending') {
        // 90% success rate for simulation
        if (Math.random() > 0.1) {
          transaction.status = 'completed';
          transaction.mpesaTransactionId = `MP${Date.now()}`;
          transaction.paymentDate = new Date();
          await transaction.save();
        } else {
          transaction.status = 'failed';
          await transaction.save();
        }
      }
    } catch (error) {
      console.error('M-Pesa callback error:', error);
    }
  }, 5000); // Simulate 5 second delay

  return {
    status: 'pending',
    message: 'M-Pesa STK push initiated. Please check your phone.',
    phoneNumber: phoneNumber,
    amount: amount,
    reference: transactionId
  };
}

async function simulateCardPayment(amount: number, transactionId: string) {
  // Simulate card payment
  console.log(`Simulating card payment for KES ${amount}`);

  // Simulate immediate response
  if (Math.random() > 0.05) { // 95% success rate
    return {
      status: 'completed',
      message: 'Card payment processed successfully',
      amount: amount,
      transactionId: `CARD${Date.now()}`
    };
  } else {
    return {
      status: 'failed',
      message: 'Card payment declined',
      amount: amount
    };
  }
}