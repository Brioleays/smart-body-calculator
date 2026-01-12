// supabase.js
const SUPABASE_URL = "https://fwclvonnragrmzeeqyll.supabase.co";
const SUPABASE_ANON_KEY =  "sb_publishable_eYSzoFnGDB8m_YYCSCGqbA_RtJgD5Sy";

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

