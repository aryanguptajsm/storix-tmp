const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function test() {
  const fields = ['discount_percentage', 'rating', 'review_count', 'brand', 'category', 'original_url', 'original_price'];
  for (const field of fields) {
    const { error } = await supabase.from('products').select(field).limit(1);
    console.log(`Field ${field}: ${error ? 'Missing' : 'Exists'}`);
  }
}
test();
