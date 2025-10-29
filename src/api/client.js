
import { createClient } from "@supabase/supabase-js";

// Change process.env.SUPABASE_URL to process.env.NEXT_PUBLIC_SUPABASE_URL
const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default client;