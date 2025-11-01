// lib/formBuilder.ts
import supabase from '@/api/client';
import { FormField } from '@/lib/types/event';

/**
 * Saves or updates all dynamic fields for an event.
 * It first deletes all existing fields for the event, then inserts the new list.
 */
export const saveDynamicFormFields = async (eventId: string, fields: Omit<FormField, 'id' | 'event_id'>[]) => {
  // 1. Delete existing fields for this event
  const { error: deleteError } = await supabase
    .from('event_form_fields')
    .delete()
    .eq('event_id', eventId);

  if (deleteError) throw new Error(`Failed to clear old fields: ${deleteError.message}`);

  // 2. Prepare data for insertion
  const fieldsToInsert = fields.map(field => ({
    ...field,
    event_id: eventId,
  }));

  // 3. Insert the new fields
  const { error: insertError } = await supabase
    .from('event_form_fields')
    .insert(fieldsToInsert);

  if (insertError) throw new Error(`Failed to save new fields: ${insertError.message}`);
};