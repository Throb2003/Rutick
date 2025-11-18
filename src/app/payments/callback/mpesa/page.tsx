import React from 'react';

const MpesaCallbackPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Received</h1>
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 20 20">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L9 17l7-7 7-7" />
          </svg>
        </div>
        <p className="text-lg text-gray-700 mb-2">Payment processed successfully!</p>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. You will receive a confirmation shortly.
        </p>
        <div className="text-sm text-gray-500">
          You can now close this window and return to the application.
        </div>
      </div>
    </div>
  );
};

export default MpesaCallbackPage;