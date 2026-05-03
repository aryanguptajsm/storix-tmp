const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.from('products').select('rating').limit(1);
  console.log("Error querying rating:", error);
  const { data: d2, error: e2 } = await supabase.from('products').select('id').limit(1);
  console.log("Error querying id:", e2);
}
test();
