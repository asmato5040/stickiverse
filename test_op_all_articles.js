const apiKey = 'OxKvTXMS0mlCqrJao8c2dP6we24mkVnh';

async function testProductType(name, deepLink) {
  console.log(`\n=== Testing ${name} ===`);
  const pricingUrl = `https://api.onlineprinters.io/api/v2/pricing?country=DEU&articleDeepLink=${encodeURIComponent(deepLink)}`;
  const pricingResp = await fetch(pricingUrl, {
    headers: { 'x-api-key': apiKey, 'Accept': 'application/json' }
  });
  const pricingData = await pricingResp.json();
  
  if (!pricingData.articles) {
    console.log("Pricing failed:", pricingData);
    return;
  }

  console.log("Articles from pricing:", pricingData.articles.map(a => a.product.sku));

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

  const items = pricingData.articles.map((art, index) => {
    const itemObj = {
      product: {
        sku: art.product.sku,
        descriptions: art.product.descriptions || ["Produkt"]
      },
      quantity: 50
    };
    if (index === 0) {
      itemObj.product.properties = [
        { key: "width", value: "5" },
        { key: "length", value: "5" }
      ];
    }
    return itemObj;
  });

  const jobData = {
    deliveries: [{
      quantity: 50,
      deliveryAddress: addr,
      returnAddress: addr,
      shippingService: 'standard'
    }],
    items,
    comment: "op.connect test"
  };

  const resp = await fetch('https://api.onlineprinters.io/api/v2/jobs', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(jobData)
  });
  const data = await resp.json();
  console.log("Status:", resp.status);
  console.log("Response:", JSON.stringify(data, null, 2));
}

async function run() {
  // Rund
  await testProductType("Rund", "https://www.onlineprinters.de/p/runde-aufkleber-im-freiformat?depvar_index_setparent=%3cP8AFFXX%3e%3cP8AFFXX.AK3.1X10%3e&depvar_qty=50&depvar_index_set_1=%3cZ8AFFA3S%3e%3cZ8AFFA3SX99%3e&depvar_index_set_2=%3cZXXXXX2D%3e%3cZXXXXX2DD00%3e&depvar_index_set_3=%3cZ7AFFA3Y%3e%3cZ7AFFA3YY34%3e&ws_areaproduct_width_P8AFFXX=5&ws_areaproduct_length_P8AFFXX=5");

  // Quadrat / Eckig
  await testProductType("Eckig", "https://www.onlineprinters.de/p/eckige-aufkleber-im-freiformat?depvar_index_setparent=%3cP7AFFXX%3e%3cP7AFFXX.AK3.1X10%3e&depvar_qty=50&depvar_index_set_1=%3cZ7AFFA3S%3e%3cZ7AFFA3SX99%3e&depvar_index_set_2=%3cZXXXX93N%3e%3cZXXXX93NN90%3e&depvar_index_set_3=%3cZXXXXX2D%3e%3cZXXXXX2DD00%3e&depvar_index_set_4=%3cZ7AFFA3Y%3e%3cZ7AFFA3YY34%3e&ws_areaproduct_width_P7AFFXX=5&ws_areaproduct_length_P7AFFXX=5");
}

run();
