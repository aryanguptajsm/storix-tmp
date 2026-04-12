const url = "https://lnckyrvxehzcjvyultkd.supabase.co/rest/v1/profiles?limit=1";
const key = "sb_publishable_GTysg6IQQqMV5JdnMJ70Rw_KYjt61rY";

fetch(url, {
  method: "GET",
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`
  }
}).then(res => res.text().then(text => console.log("DATA:", text)))
  .catch(err => console.error(err));
