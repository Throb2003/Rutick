import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate M-Pesa callback structure
    if (!body.Body || !body.Body.stkCallback) {
      return NextResponse.json(
        { error: 'Invalid callback format' },
        { status: 400 }
      );
    }

    const callback = body.Body.stkCallback;
    const merchantRequestID = callback.MerchantRequestID;
    const checkoutRequestID = callback.CheckoutRequestID;
    const resultCode = callback.ResultCode;
    const resultDesc = callback.ResultDesc;

    await connectDB();

    // Find transaction by merchant request ID (would be stored during payment initiation)
    const transaction = await Transaction.findOne({
      mpesaMerchantRequestId: merchantRequestID
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Update transaction based on result
    if (resultCode === 0) {
      // Success
      transaction.status = 'completed';
      transaction.paymentDate = new Date();
      transaction.mpesaTransactionId = checkoutRequestID;

      const callbackMetadata = callback.CallbackMetadata?.Item || [];
      const amountItem = callbackMetadata.find((item: any) => item.Name === 'Amount');
      const phoneNumberItem = callbackMetadata.find((item: any) => item.Name === 'PhoneNumber');

      if (amountItem) {
        transaction.amount = amountItem.Value;
      }
      if (phoneNumberItem) {
        transaction.mpesaPhoneNumber = phoneNumberItem.Value;
      }

    } else {
      // Failed
      transaction.status = 'failed';
      transaction.failureReason = resultDesc;
    }

    await transaction.save();

    console.log(`M-Pesa callback processed: ${checkoutRequestID} - ${resultCode === 0 ? 'Success' : 'Failed'}`);

    return NextResponse.json({
      success: true,
      message: 'Callback processed successfully'
    });

  } catch (error: any) {
    console.error('M-Pesa callback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}