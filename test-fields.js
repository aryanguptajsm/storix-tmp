const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  console.log("--- Checking Products Table ---");
  const productFields = [
    'user_id', 'title', 'description', 'price', 'original_price', 
    'image_url', 'platform', 'original_url', 'discount_percentage', 
    'rating', 'review_count', 'brand', 'category', 'affiliate_url', 
    'ai_content', 'article_type', 'content_status'
  ];
  
  for (const field of productFields) {
    const { error } = await supabase.from('products').select(field).limit(1);
    console.log(`Product Field ${field}: ${error ? 'Missing (' + error.message + ')' : 'Exists'}`);
  }

  console.log("\n--- Checking Profiles Table ---");
  const profileFields = [
    'id', 'username', 'store_name', 'store_description', 
    'store_logo', 'theme', 'plan', 'subscription_id'
  ];
  
  for (const field of profileFields) {
    const { error } = await supabase.from('profiles').select(field).limit(1);
    console.log(`Profile Field ${field}: ${error ? 'Missing (' + error.message + ')' : 'Exists'}`);
  }
}

test();
