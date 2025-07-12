import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://slvlewolhwwpuewjdoep.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsdmxld29saHd3cHVld2pkb2VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNjczODQsImV4cCI6MjA2Nzg0MzM4NH0.QsyFc3ON7Vaghpk5gPo_aQlQdUkv8CHHY9aiKYGTM2Q";

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 