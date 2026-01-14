// supabase.js
const SUPABASE_URL = "https://dautyurfgvyenuegcjps.supabase.co";
const SUPABASE_ANON_KEY =  "sb_publishable_1wsugr9SntYndCpXUJlGMQ_hq-DdUeI";

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

