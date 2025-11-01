// RegisterPage.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react'; // <-- Import useRef
import { useParams, useRouter } from 'next/navigation';
import DynamicEventForm from '@/components/form/DynamicEventForm';
import supabase from '@/api/client';
import { Loader2, DollarSign, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import Script from 'next/script'; 
import { DynamicFormData } from '@/lib/types/event'; // <-- Import DynamicFormData type

// Extend window object for TypeScript compatibility with Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

// --- 1. Type Definition ---
interface Event {
  id: string;
  title: string;
  description: string;
  ticket_price: number | null; 
}

// Assume you have an imported function for final submission (if not, add it)
import { submitRegistration } from '@/lib/dynamicForm'; 

const RegisterPage = () => {
  const params = useParams();
  const router = useRouter(); 
  
  const eventId = Array.isArray(params.id) ? params.id[0] : (params.id as string | undefined);
  
  const [userId, setUserId] = useState<string | null>(null);
  const [eventData, setEventData] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'success' | 'payment_required' | 'error' | 'submitting_data'>('idle'); // <-- Added submitting_data
  
  const [razorpayOrderId, setRazorpayOrderId] = useState<string | null>(null); 
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false); 

  // --- NEW: Use useRef to store form data temporarily before payment ---
  const formDataRef = useRef<DynamicFormData>({}); 


  // --- 2. Data Fetching Logic (Omitted for brevity, assumed unchanged) ---
  const fetchData = useCallback(async (id: string) => {
    setLoading(true);
    setFetchError(null);
    
    // 1. Fetch Auth Session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUserId(session.user.id);
    } else {
      router.push(`/login?redirect=/events/${id}/register`);
      return;
    }
    
    // 2. Fetch Event Data (unchanged)
    const { data, error } = await supabase
      .from('events')
      .select('id, title, description, ticket_price') 
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error fetching event for registration:', error || 'No data');
      setFetchError(error?.message || 'Event not found.');
    } else {
      setEventData(data as Event);
    }
    setLoading(false);
  }, [router]); 


  useEffect(() => {
    if (eventId) {
      fetchData(eventId);
    } else {
      setLoading(false);
    }
  }, [eventId, fetchData]);

  // --- NEW: Function to finalize registration with payment data ---
  const finalizeRegistration = async (paymentResponse: any) => {
      if (!eventId || !userId || !eventData) {
          console.error("Finalization failed: Missing event or user data.");
          setFetchError("Internal error during final registration.");
          setRegistrationStatus('error');
          return;
      }
      
      setRegistrationStatus('submitting_data');

      const dataToSubmit: DynamicFormData = {
          ...formDataRef.current, // Use the temporary stored form data
          // Include essential payment details as proof/reference
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          // razorpay_signature: paymentResponse.razorpay_signature, // Only store if you are verifying server-side
      };

      try {
          // 2. SAVE the registration data (form fields + user ID + event ID + payment ID)
          await submitRegistration(eventId, userId, dataToSubmit);
          setRegistrationStatus('success');

      } catch (error) {
          console.error('Final registration failed:', error);
          // NOTE: Payment succeeded but registration failed - manual intervention needed
          setFetchError('Payment succeeded, but final registration failed. Please contact support with your Payment ID: ' + paymentResponse.razorpay_payment_id);
          setRegistrationStatus('error');
      }
  }


  // --- 3. Initial Submission Handler (Saves data to ref, initiates payment if needed) ---
  // This function is called by DynamicEventForm AFTER it successfully validates form data
  const handleInitialSubmission = async (formData: DynamicFormData) => {
    if (!eventData) return;
    
    // **1. Save the valid form data temporarily**
    formDataRef.current = formData;

    const ticketPrice = eventData.ticket_price ?? 0;
    
    if (ticketPrice > 0) {
      // **PAID EVENT LOGIC: Create Razorpay Order**
      setLoading(true); 
      try {
          const response = await fetch('/api/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount: ticketPrice * 100 }), 
          });

          const data = await response.json();

          if (!response.ok || data.error) {
              throw new Error(data.error || "Failed to create order on server.");
          }

          setRazorpayOrderId(data.orderId);
          setRegistrationStatus('payment_required');
      } catch (error: any) {
          console.error("Razorpay Order Creation Error:", error);
          setFetchError(error.message || "Could not initialize payment.");
          setRegistrationStatus('error');
      } finally {
          setLoading(false);
      }
    } else {
      // **FREE EVENT LOGIC: Finalize immediately**
      console.log('Free Event - Finalizing registration...');
      // Pass a dummy object for the free event, as payment details are not needed
      finalizeRegistration({ razorpay_payment_id: 'FREE_EVENT', razorpay_order_id: 'NA' });
    }
  };
  
  // Function to handle successful payment completion
  const handlePaymentSuccess = (response: any) => {
      // NOTE: For true security, you must send this response data to your 
      // backend for server-side verification before calling finalizeRegistration.
      
      console.log("Payment successful! Response:", response);
      // **CALL THE FINAL REGISTRATION SUBMISSION HERE**
      finalizeRegistration(response);
  };

  // --- Razorpay Payment Initiator (Unchanged Logic, added checks) ---
  const handleProceedToPayment = () => {
      if (!razorpayOrderId || !eventData || !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
          console.error("Payment initiation failed: Missing Order ID or Key.");
          setFetchError("Payment data is incomplete.");
          setRegistrationStatus('error');
          return;
      }

      setIsPaymentProcessing(true);
      const ticketPrice = eventData.ticket_price ?? 0;

      const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!, 
          amount: ticketPrice * 100, 
          currency: "INR",
          name: eventData.title,
          description: `Registration for ${eventData.title}`,
          order_id: razorpayOrderId,
          handler: function (response: any) {
              handlePaymentSuccess(response);
              setIsPaymentProcessing(false);
          },
          modal: {
              ondismiss: () => {
                  setIsPaymentProcessing(false); 
                  console.log('Payment modal closed');
              }
          },
          prefill: {
              name: "Registered User", 
              email: "user@example.com", 
              contact: "9999999999", 
          },
          theme: {
              color: "#4F46E5", 
          },
      };

      if (typeof window.Razorpay !== 'undefined') {
          const rzp = new window.Razorpay(options);
          rzp.open();
      } else {
          console.error("Razorpay SDK not loaded.");
          setIsPaymentProcessing(false);
          setFetchError("Payment gateway is not ready. Please try again.");
      }
  };


  // --- 4. Conditional Render Checks ---
  if (loading || isPaymentProcessing || registrationStatus === 'submitting_data') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-2" />
        <p>
            {registrationStatus === 'submitting_data'
              ? 'Finalizing registration with payment data...'
              : isPaymentProcessing ? 'Initializing Payment Gateway...' : 'Loading event and checking authentication...'}
        </p>
      </div>
    );
  }
  // ... (error checks remain the same)
  if (!eventId || !userId || fetchError || !eventData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
        <p className="text-red-500">
          Error: {fetchError || (!eventId ? 'Event ID missing.' : !userId ? 'Authentication required.' : 'Event data not found.')}
        </p>
      </div>
    );
  }

  const ticketPrice = eventData.ticket_price ?? 0;
  const isFree = ticketPrice === 0;

  // --- 5. Success/Payment Required Message (Unchanged) ---
  if (registrationStatus === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-2xl text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Complete!</h2>
          <p className="text-gray-600">You are now registered for **{eventData.title}**.</p>
          <button
            onClick={() => router.push(`/events/${eventId}`)}
            className="mt-6 py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-200 flex items-center justify-center mx-auto"
          >
            View Event Details
          </button>
        </div>
      </div>
    );
  }

  if (registrationStatus === 'payment_required') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-2xl text-center">
          <DollarSign className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Required</h2>
          <p className="text-gray-600 mb-4">
            Your form data is saved. Click below to complete the payment for: **₹{ticketPrice.toFixed(2)}**.
          </p>
          {razorpayOrderId && (
          <button
            onClick={handleProceedToPayment} 
            disabled={isPaymentProcessing}
            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition duration-200 flex items-center justify-center disabled:bg-indigo-400"
          >
            {isPaymentProcessing ? (
                <> <Loader2 className="w-5 h-5 animate-spin mr-2" /> Initializing...</>
              ) : (
                <>Pay Now: ₹{ticketPrice.toFixed(2)} <ArrowRight className="w-5 h-5 ml-2" /></>
              )}
          </button>
          )}
          {!razorpayOrderId && <p className='text-red-500 mt-4'>Error: Failed to get Razorpay Order ID. Please refresh.</p>}
        </div>
      </div>
    );
  }

  // --- 6. Main Render ---
  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-gray-50 pt-20">
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        
      <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">
          Register for: {eventData.title}
        </h1>

        {/* Price Indicator */}
        <div className={`p-4 mb-6 rounded-lg flex items-center ${isFree ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {isFree ? <CheckCircle className="w-5 h-5 mr-3" /> : <DollarSign className="w-5 h-5 mr-3" />}
          <p className="font-semibold">
            {isFree ? 'This is a **FREE** event.' : `Ticket Price: **₹${ticketPrice.toFixed(2)}**`}
          </p>
        </div>

        <p className="text-gray-600 mb-6">{eventData.description}</p>

        {/* Dynamic Registration Form with Submission Handler */}
        <DynamicEventForm 
          eventId={eventId} 
          userId={userId} 
          onFormSubmit={handleInitialSubmission} // <-- Use the new handler
          ticketPrice={ticketPrice} 
        />
      </div>
    </div>
  );
};

export default RegisterPage;