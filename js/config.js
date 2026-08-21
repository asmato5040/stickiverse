// =============================================
// STICKIVERSE – Supabase Konfiguration
// =============================================
console.log("[Auth-Debug] config.js geladen und wird ausgeführt!");

const SUPABASE_URL  = 'https://tfnlnxxdqgzhpawkhhmz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmbmxueHhkcWd6aHBhd2toaG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2MDEwOTksImV4cCI6MjA5OTE3NzA5OX0.Wbc3rnaf-_WTIcCAZss_vs5mx707X7gzEraZjXZH9s4';

// ── Supabase Client initialisieren ──────────
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
});
