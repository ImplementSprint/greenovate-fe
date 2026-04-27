import { createClient } from "@supabase/supabase-js";
import { publicAnonKey, supabaseUrl } from "./info";

// Create a single Supabase client for interacting with your database
export const supabase = createClient(
  supabaseUrl,
  publicAnonKey,
);
