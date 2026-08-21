const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL  = 'https://tfnlnxxdqgzhpawkhhmz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmbmxueHhkcWd6aHBhd2toaG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2MDEwOTksImV4cCI6MjA5OTE3NzA5OX0.Wbc3rnaf-_WTIcCAZss_vs5mx707X7gzEraZjXZH9s4';

const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await db
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });
  console.log("Error:", error);
  console.log("Data count:", data ? data.length : 0);
}

test();
