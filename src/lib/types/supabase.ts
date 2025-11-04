// /src/types/supabase.ts

// Define the core types for your tables
export type UUID = string;

// 1. Events Table Type
export interface Event {
  id: UUID;
  title: string;
  description: string;
  category: string;
  location: string;
  organizer_name: string;
  start_date: string; // timestamptz is usually handled as a string
  end_date: string;
  status: 'Draft' | 'Published' | 'Cancelled'; // Example status literal
  created_at: string;
  
  // Optional Fields
  ticket_price?: number;
  max_participants?: number;
  banner_url?: string;
  contact_email?: string;
  contact_phone?: string;
  created_by?: UUID;
  organization_id?: UUID;
}

// 2. Event Registration Table Type (including a profile join for display)
export interface Registration {
  id: UUID;
  event_id: UUID;
  form_data: Record<string, any>; // JSONB column
  is_paid: 'Yes' | 'No';
  registration_date: string;
  ticket_uid?: UUID;
  status: 'Pending' | 'Confirmed' | 'Checked-In' | 'Cancelled';
  check_in_time?: string;
  
  // Joined data from profiles table (optional)
  profiles: {
    email: string;
    name: string;
  } | null;
}

// 3. Organization Table Type
export interface Organization {
  id: UUID;
  name: string;
  description?: string;
  owner_id?: UUID;
  status?: string;
  avatar_url?: string;
  created_at: string;
}

// 4. Profile Table Type
export interface Profile {
  uuid: UUID;
  email: string;
  created_at: string;
  updated_at: string;
  name?: string;
  role_type?: 'organizer' | 'user' | 'superadmin'; // Matching your RLS
  organization_id?: UUID;
  avatar_url?: string;
}

// 5. Recruitment Table Type
export interface Recruitment {
  id: number;
  full_name: string;
  registration_number: string;
  email_address: string;
  phone_number: string;
  date_of_birth: string; // date type
  gender: string;
  branch_department: string;
  course_year: string;
  participated_before: boolean;
  why_join_optimus: string;
  
  // Optional Fields
  whatsapp_number?: string;
  residence?: string;
  areas_of_interest?: string[]; // Assuming _text array
  created_at: string;
}

// src/types/supabase.ts
export interface Database {
  public: {
    Tables: {
      event_form_fields: {
        Row: {
          id: string;
          event_id: string;
          field_name: string;
          field_type: string;
          is_required: boolean;
          options: string | null;
          order: number | null;
        };
        Insert: {
          id?: string;
          event_id: string;
          field_name: string;
          field_type: string;
          is_required: boolean;
          options?: string | null;
          order?: number | null;
        };
        Update: {
          field_name?: string;
          field_type?: string;
          is_required?: boolean;
          options?: string | null;
          order?: number | null;
        };
      };
    };
  };
}
