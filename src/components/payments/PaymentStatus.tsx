'use client';

import React from 'react';
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

interface PaymentStatusProps {
  status: 'pending' | 'completed' | 'failed';
  message?: string;
  transactionId?: string;
  onRetry?: () => void;
  onBack?: () => void;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({
  status,
  message,
  transactionId,
  onRetry,
  onBack
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'pending':
      default:
        return 'text-yellow-600';
    }
  };

  const getStatusBg = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-100';
      case 'failed':
        return 'bg-red-100';
      case 'pending':
      default:
        return 'bg-yellow-100';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'failed':
        return <XCircle className="h-16 w-16 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="h-16 w-16 text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto p-6">
        <div className={`rounded-lg p-8 text-center ${getStatusBg()}`}>
          {getStatusIcon()}

          <h1 className={`text-3xl font-bold mb-4 ${getStatusColor()}`}>
            {status === 'completed' && 'Payment Successful!'}
            {status === 'failed' && 'Payment Failed'}
            {status === 'pending' && 'Payment Processing...'}
          </h1>

          {status === 'completed' && (
            <div className="text-green-600 mb-6">
              <CheckCircle className="h-12 w-12 mx-auto mb-4" />
              <p className="text-xl font-semibold">Thank You!</p>
              <p className="text-gray-700">
                Your payment has been successfully processed.
                A confirmation has been sent to your email.
              </p>
            </div>
          )}

          {status === 'failed' && (
            <div className="text-red-600 mb-6">
              <XCircle className="h-12 w-12 mx-auto mb-4" />
              <p className="text-xl font-semibold">Payment Failed</p>
              <p className="text-gray-700 mb-2">
                {message || 'Your payment could not be processed. Please try again.'}
              </p>
              {transactionId && (
                <p className="text-sm text-gray-600">
                  Transaction ID: {transactionId}
                </p>
              )}
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </button>
              )}
              {onBack && (
                <button
                  onClick={onBack}
                  className="inline-flex items-center ml-4 px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Back to Checkout
                </button>
              )}
            </div>
          )}

          {status === 'pending' && (
            <div className="text-yellow-600 mb-6">
              <Clock className="h-12 w-12 mx-auto mb-4 animate-spin" />
              <p className="text-xl font-semibold">Processing Payment</p>
              <p className="text-gray-700">
                Your payment is being processed. This usually takes a few moments.
                Please don't close this window.
              </p>
              {paymentMethod === 'mpesa' && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-blue-800">
                    <p className="font-semibold mb-2">M-Pesa Payment Initiated</p>
                    <p className="text-sm">
                      Please check your phone for the M-Pesa STK push.
                      Enter your PIN to complete the payment.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 text-sm text-gray-500">
            {status === 'pending' && (
              <p>
                If you're not redirected within 30 seconds, please refresh this page.
              </p>
            )}
            {status === 'completed' && (
              <p>
                You will be redirected to your dashboard automatically.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;