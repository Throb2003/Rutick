'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { eventsAPI, paymentsAPI, ticketsAPI } from '@/lib/api';
import { Event, Ticket as TicketType } from '@/types';
import { Calendar, MapPin, Clock, ArrowLeft, CreditCard, Smartphone, Check } from 'lucide-react';
import { format } from 'date-fns';

const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [event, setEvent] = useState<Event | null>(null);
  const [selectedTicketType, setSelectedTicketType] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card' | 'cash'>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentResult, setPaymentResult] = useState(null);
  const [purchasedTickets, setPurchasedTickets] = useState<TicketType[]>([]);

  const eventId = searchParams.get('eventId');
  const ticketType = searchParams.get('ticketType') || '';
  const initialQuantity = parseInt(searchParams.get('quantity') || '1');

  useEffect(() => {
    if (eventId && ticketType) {
      loadEvent();
      setSelectedTicketType(ticketType);
      setQuantity(initialQuantity);
    }
  }, [eventId, ticketType, initialQuantity]);

  const loadEvent = async () => {
    try {
      const response = await eventsAPI.getEvent(eventId!);
      if (response.success && response.event) {
        setEvent(response.event);
      }
    } catch (error) {
      console.error('Failed to load event:', error);
      router.push('/events');
    }
  };

  const handleTicketTypeSelect = (type: string) => {
    setSelectedTicketType(type);
  };

  const handleQuantityChange = (newQuantity: number) => {
    const maxQuantity = getAvailableTickets();
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const getTicketTypeInfo = () => {
    if (!event?.ticketTypes) return null;
    return event.ticketTypes.find(t => t.type === selectedTicketType);
  };

  const getAvailableTickets = () => {
    const ticketInfo = getTicketTypeInfo();
    return ticketInfo ? ticketInfo.available : 0;
  };

  const getTotalPrice = () => {
    const ticketInfo = getTicketTypeInfo();
    if (!ticketInfo) return 0;
    return ticketInfo.price * quantity;
  };

  const handleProceedToPayment = async () => {
    if (!selectedTicketType || quantity < 1) {
      return;
    }

    try {
      setLoading(true);
      // Buy tickets first
      const buyResponse = await ticketsAPI.buyTickets({
        eventId: eventId!,
        ticketType: selectedTicketType,
        quantity
      });

      if (buyResponse.success) {
        setPurchasedTickets(buyResponse.tickets);
        setStep('payment');
      } else {
        throw new Error(buyResponse.error || 'Failed to purchase tickets');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      setLoading(false);
      // Show error to user
      alert('Failed to purchase tickets. Please try again.');
    }
  };

  const handlePayment = async () => {
    if (!purchasedTickets.length) return;

    try {
      setLoading(true);
      const ticketIds = purchasedTickets.map(t => t._id);

      const paymentData = {
        ticketIds,
        paymentMethod,
        ...(paymentMethod === 'mpesa' && { phoneNumber })
      };

      const response = await paymentsAPI.initiatePayment(paymentData);

      if (response.success) {
        setPaymentResult(response);
        setStep('confirmation');
      } else {
        throw new Error(response.error || 'Payment failed');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setLoading(false);
      alert('Payment failed. Please try again.');
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Format phone number for M-Pesa
    const formatted = value.replace(/\D/g, '').replace(/^(\d{3})(\d{3})(\d{4})$/, '$1 $2 $3');
    setPhoneNumber(formatted);
  };

  const goToEvent = () => {
    router.push(`/events/${eventId}`);
  };

  const goToTickets = () => {
    router.push('/tickets');
  };

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h1>
          <p className="text-gray-600">The event you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={goToEvent}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Event
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step 1: Event and Ticket Selection */}
        {step === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Event Summary */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Event Details</h2>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                      {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-teal-500" />
                      {event.venue}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-700">{event.description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Select Tickets</h2>

              <div className="space-y-4">
                {event.ticketTypes.map((ticketType) => {
                  const available = ticketType.available;
                  const isDisabled = available === 0;

                  return (
                    <div
                      key={ticketType.type}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedTicketType === ticketType.type
                          ? 'border-orange-500 bg-orange-50'
                          : isDisabled
                          ? 'border-gray-200 bg-gray-100 opacity-50'
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                      onClick={() => !isDisabled && handleTicketTypeSelect(ticketType.type)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 capitalize">
                            {ticketType.type}
                          </h3>
                          {isDisabled && (
                            <span className="text-sm text-red-600">Sold Out</span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-orange-600">
                            KES {ticketType.price === 0 ? 'FREE' : ticketType.price}
                          </p>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600">
                        {available} of {ticketType.quantity} available
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quantity Selection */}
              {selectedTicketType && (
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={getAvailableTickets()}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              )}
            </div>

            {/* Order Summary */}
            {selectedTicketType && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Event:</span>
                    <span className="font-medium text-gray-900">{event.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ticket Type:</span>
                    <span className="font-medium text-gray-900 capitalize">{selectedTicketType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium text-gray-900">{quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per Ticket:</span>
                    <span className="font-medium text-gray-900">
                      KES {getTicketTypeInfo()?.price || 0}
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Price:</span>
                      <span className="text-orange-600">KES {getTotalPrice()}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleProceedToPayment}
                  disabled={!selectedTicketType || quantity < 1}
                  className="w-full campus-btn text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed to Payment
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 'payment' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Method Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>

              <div className="space-y-4">
                <label className="flex items-center p-4 border rounded-lg cursor-pointer border-orange-500 bg-orange-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="mpesa"
                    checked={paymentMethod === 'mpesa'}
                    onChange={() => setPaymentMethod('mpesa')}
                    className="mr-3"
                  />
                  <div>
                    <Smartphone className="h-6 w-6 text-orange-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">M-Pesa</h3>
                      <p className="text-sm text-gray-600">Mobile money transfer (Kenya)</p>
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="mr-3"
                  />
                  <div>
                    <CreditCard className="h-6 w-6 text-gray-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Credit/Debit Card</h3>
                      <p className="text-sm text-gray-600">Visa, Mastercard, etc.</p>
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={() => setPaymentMethod('cash')}
                    className="mr-3"
                  />
                  <div>
                    <div className="h-6 w-6 bg-gray-400 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-bold">K</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Cash</h3>
                      <p className="text-sm text-gray-600">Pay at venue</p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Payment Form */}
              {paymentMethod === 'mpesa' && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    M-Pesa Phone Number
                  </h3>
                  <input
                    type="tel"
                    placeholder="+254 712 345 678"
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    pattern="\+254[17]\d{3}\d{3}\d{4}"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Enter your M-Pesa registered phone number
                  </p>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3">
                {purchasedTickets.map((ticket, index) => (
                  <div key={index} className="flex justify-between py-2 border-b last:border-b-0">
                    <div>
                      <span className="font-medium text-gray-900">Ticket #{index + 1}</span>
                      <span className="text-gray-600 capitalize">{ticket.type}</span>
                    </div>
                    <span className="font-bold text-gray-900">KES {ticket.price}</span>
                  </div>
                ))}

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className="text-orange-600">KES {getTotalPrice()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {paymentMethod === 'cash' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Check className="h-6 w-6 text-blue-600 mr-3" />
                      <div>
                        <h3 className="font-semibold text-blue-900">Cash Payment</h3>
                        <p className="text-blue-700">
                          Please proceed to the venue and pay with cash.
                          Your tickets will be confirmed after payment.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {(paymentMethod === 'mpesa' || paymentMethod === 'card') && (
                  <button
                    onClick={handlePayment}
                    disabled={paymentMethod === 'mpesa' && !phoneNumber}
                    className="w-full campus-btn text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {paymentMethod === 'mpesa' ? 'Pay with M-Pesa' : 'Pay with Card'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 'confirmation' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              {paymentResult?.paymentResponse?.status === 'completed' ? (
                <div>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-green-600 mb-4">Payment Successful!</h2>
                  <p className="text-gray-700 mb-6">
                    Your tickets have been purchased successfully.
                    A confirmation has been sent to your email.
                  </p>
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Transaction Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transaction ID:</span>
                          <span className="font-mono text-gray-900">{paymentResult.transaction?._id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method:</span>
                          <span className="text-gray-900 capitalize">{paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount Paid:</span>
                          <span className="text-gray-900">KES {getTotalPrice()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={goToTickets}
                      className="campus-btn"
                    >
                      View My Tickets
                    </button>
                    <button
                      onClick={goToDashboard}
                      className="border border-orange-500 text-orange-600 hover:bg-orange-50"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock className="h-8 w-8 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-red-600 mb-4">Payment Processing</h2>
                  <p className="text-gray-700 mb-6">
                    Your payment is being processed. This may take a few moments.
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Smartphone className="h-6 w-6 text-yellow-600 mr-3" />
                      <div>
                        <h3 className="font-semibold text-yellow-900">M-Pesa Payment</h3>
                        <p className="text-yellow-700">
                          Please check your phone for the M-Pesa STK push prompt.
                          Enter your PIN to complete the payment.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;