/* ============================================
   MEESTERTOOLS - Supabase Configuratie
   ============================================ */

const SUPABASE_URL = 'https://chnjybpwquystuwmiger.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobmp5YnB3cXV5c3R1d21pZ2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NzAzOTgsImV4cCI6MjA4ODE0NjM5OH0.d2tlRjvXsk34J3mnYIuCFPWSQR6m6YLu3zv5S7qbz88';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
