// /lib/dynamicForm.ts

import supabase from '@/api/client';
// Import all necessary types from the central location
import { DynamicFormData, FormField } from '@/lib/types/event'; 


/**
 * REQUIRED BY DynamicEventForm.tsx
 * Fetches the configuration fields for a specific event.
 * @returns {Promise<FormField[]>}
 */
export async function fetchEventFormFields(eventId: string): Promise<FormField[]> {
    
    // NOTE: Replace the 'select' call with your actual database query 
    const { data, error } = await supabase
        .from('event_form_fields') // Use your actual table name here
        .select('*') 
        .eq('event_id', eventId)
        .order('order', { ascending: true }); // Using 'order' based on your FormField type

    if (error) {
        console.error("Error fetching form fields:", error);
        throw new Error(`Failed to load form fields: ${error.message}`);
    }
    
    // Type casting the data ensures TypeScript knows the return structure
    return (data || []) as FormField[];
}


/**
 * STEP 1: Attempts to insert a pre-registration record or checks if the user is already registered.
 * @returns {Promise<{ ticketUid: string | null; isRegistered: boolean; existingStatus?: string }>}
 */
export async function preRegisterUser(
  eventId: string,
  userId: string,
  formData: DynamicFormData,
  initialStatus: 'pending' | 'free' // 'pending' for paid, 'free' for free
): Promise<{ ticketUid: string | null; isRegistered: boolean; existingStatus?: string }> {
  
  // 1. First, check if a registration already exists
  const { data: existingReg, error: fetchError } = await supabase
    .from('event_registrations')
    .select('ticket_uid, is_paid')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single();

  // PGRST116 is the error code for "No rows found" in Supabase/PostgREST.
  if (fetchError && fetchError.code !== 'PGRST116') { 
    throw new Error(`Database error during check: ${fetchError.message}`);
  }

  if (existingReg) {
    // Registration already exists. Return the UID and status.
    return {
      ticketUid: existingReg.ticket_uid,
      isRegistered: true,
      existingStatus: existingReg.is_paid, // e.g., 'pending', 'paid', 'free'
    };
  }

  // 2. If registration does not exist, insert the initial record
  const { data: newReg, error: insertError } = await supabase
    .from('event_registrations')
    .insert({
      event_id: eventId,
      user_id: userId,
      form_data: formData, // Store form data
      is_paid: initialStatus,
    })
    .select('ticket_uid') // Assuming this returns the unique ID that will be the QR code value
    .single();

  if (insertError) {
    throw new Error(`Registration insert failed: ${insertError.message}`);
  }

  return { 
      ticketUid: newReg?.ticket_uid || null, 
      isRegistered: false 
  };
}

/**
 * STEP 2: Updates the registration status to 'paid' after successful payment.
 */
// /lib/dynamicForm.ts

export const finalizeRegistrationStatus = async (
  eventId: string,
  userId: string,
  ticketUid: string,
  paymentResponse: { razorpay_order_id: string; razorpay_payment_id: string }
): Promise<void> => {
  const { data, error } = await supabase
    .from('event_registrations')
    .update({
      is_paid: 'PAID',
      // razorpay_order_id: paymentResponse.razorpay_order_id,
      // razorpay_payment_id: paymentResponse.razorpay_payment_id,
    })
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .eq('ticket_uid', ticketUid) // ✅ Ensure ticket UID matches!
    .select();

  if (error || !data || data.length === 0) {
    console.error('Failed to update registration status', { error, data });
    throw new Error(
      `DB Update Failed. Payment ID: ${paymentResponse.razorpay_payment_id}`
    );
  }

  console.log('✅ Registration status updated successfully!');
};
