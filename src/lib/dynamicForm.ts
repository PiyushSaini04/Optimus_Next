// lib/dynamicForm.ts
import supabase from '@/api/client';
import { FormField, DynamicFormData } from '@/lib/types/event';

export const fetchEventFormFields = async (eventId: string): Promise<FormField[]> => {
  const { data, error } = await supabase
    .from('event_form_fields')
    .select('*')
    .eq('event_id', eventId)
    .order('order', { ascending: true });

  if (error) throw new Error(error.message);
  return data as FormField[];
};

export const submitRegistration = async (eventId: string, userId: string, formData: DynamicFormData) => {
  const { data, error } = await supabase
    .from('event_registrations')
    .insert([
      {
        event_id: eventId,
        user_id: userId,
        form_data: formData, // Stored as JSONB
      },
    ]);

  if (error) throw new Error(error.message);
  return data;
};