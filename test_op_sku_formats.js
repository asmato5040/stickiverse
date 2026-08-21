const apiKey = 'OxKvTXMS0mlCqrJao8c2dP6we24mkVnh';

async function testOrder() {
  // Erst Pricing holen um die SKUs zu bekommen
  const deepLink = "https://www.onlineprinters.de/p/runde-aufkleber-im-freiformat?depvar_index_setparent=%3cP8AFFXX%3e%3cP8AFFXX.AK3.1X10%3e&depvar_qty=50&depvar_index_set_1=%3cZ8AFFA3S%3e%3cZ8AFFA3SX99%3e&depvar_index_set_2=%3cZXXXXX2D%3e%3cZXXXXX2DD00%3e&depvar_index_set_3=%3cZ7AFFA3Y%3e%3cZ7AFFA3YY34%3e&ws_areaproduct_width_P8AFFXX=5&ws_areaproduct_length_P8AFFXX=5";

  const pricingUrl = `https://api.onlineprinters.io/api/v2/pricing?country=DEU&articleDeepLink=${encodeURIComponent(deepLink)}`;
  const pricingResp = await fetch(pricingUrl, {
    headers: { 'x-api-key': apiKey, 'Accept': 'application/json' }
  });
  const pricingData = await pricingResp.json();
  
  const allSkus = pricingData.articles.map(a => a.product.sku);
  console.log("All SKUs:", allSkus);
  
  // Versuch 1: Alle SKUs als EIN kombinierter String
  const combinedSku = allSkus.join('');
  console.log("Combined SKU:", combinedSku);

  const addr = {
    companyName: "Stickiverse",
    firstName: "Emre",
    lastName: "Kocak",
    street: "Musterstr 12",
    zipCode: "10115",
    city: "Berlin",
    countryCode: "DEU",
    phone: "+49123456789",
    email: "support@stickiverse.de"
  };

  const jobData = {
    deliveries: [{
      quantity: 50,
      deliveryAddress: addr,
      returnAddress: addr,
      shippingService: 'standard'
    }],
    items: [{
      product: {
        sku: combinedSku,
        descriptions: ["Runde Aufkleber 5x5cm"]
      },
      quantity: 50
    }],
    comment: "Test Bestellung"
  };

  console.log("\n--- Sending combined SKU ---");
  console.log(JSON.stringify(jobData, null, 2));

  const resp = await fetch('https://api.onlineprinters.io/api/v2/jobs', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(jobData)
  });
  
  const data = await resp.json();
  console.log("\nResponse Status:", resp.status);
  console.log(JSON.stringify(data, null, 2));

  if (resp.status !== 201) {
    // Versuch 2: Nur parent SKU
    console.log("\n--- Trying parent SKU only ---");
    jobData.items = [{
      product: { sku: allSkus[0], descriptions: ["Runde Aufkleber 5x5cm"] },
      quantity: 50
    }];
    
    const resp2 = await fetch('https://api.onlineprinters.io/api/v2/jobs', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(jobData)
    });
    const data2 = await resp2.json();
    console.log("Response Status:", resp2.status);
    console.log(JSON.stringify(data2, null, 2));
  }

  if (resp.status !== 201) {
    // Versuch 3: Alle als separate Items
    console.log("\n--- Trying all as separate items ---");
    jobData.items = allSkus.map(sku => ({
      product: { sku, descriptions: ["Runde Aufkleber"] },
      quantity: 50
    }));
    
    const resp3 = await fetch('https://api.onlineprinters.io/api/v2/jobs', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(jobData)
    });
    const data3 = await resp3.json();
    console.log("Response Status:", resp3.status);
    console.log(JSON.stringify(data3, null, 2));
  }
}

testOrder();
