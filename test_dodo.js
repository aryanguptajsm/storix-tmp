require('dotenv').config({ path: '.env.local' });
const DodoPayments = require('dodopayments').DodoPayments;

const apiKey = process.env.DODO_API_KEY || 'test_sk_w1fdf';
const client = new DodoPayments({
  bearerToken: apiKey,
  environment: apiKey.startsWith("test_") ? "test_mode" : "live_mode",
});

async function main() {
  try {
    const session = await client.checkoutSessions.create({
      product_cart: [
        {
          product_id: 'pdt_0NbhRaCdMO2up7ejl9wfZ',
          quantity: 1,
        },
      ],
      customer: {
        email: "test@example.com",
        name: "Test User",
      },
      return_url: "http://localhost:3000/dashboard/billing?success=true",
    });
    console.log("Success:", session);
  } catch (err) {
    console.error("ERROR:");
    console.error(err);
  }
}
main();
