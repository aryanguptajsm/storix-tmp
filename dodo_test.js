const DodoPayments = require("dodopayments").DodoPayments;
try {
  const client = new DodoPayments({ bearerToken: "", environment: "test_mode" });
  console.log("Success");
} catch(e) {
  console.log("Error:", e.message);
}
