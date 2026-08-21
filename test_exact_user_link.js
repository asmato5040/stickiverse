const apiKey = 'OxKvTXMS0mlCqrJao8c2dP6we24mkVnh';

async function testUserLink() {
  const link = "https://www.onlineprinters.de/p/eckige-aufkleber-im-freiformat?depvar_index_setparent=%3cP7AFFXX%3e%3cP7AFFXX.AK3.1X10%3e&depvar_qty=10&depvar_index_set_1=%3cZ7AFFA3S%3e%3cZ7AFFA3SX99%3e&depvar_index_set_2=%3cZXXXX93N%3e%3cZXXXX93NN90%3e&depvar_index_set_3=%3cZXXXXX2D%3e%3cZXXXXX2DD00%3e&depvar_index_set_4=%3cZ7AFFA3Y%3e%3cZ7AFFA3YY34%3e&ws_areaproduct_width_P7AFFXX=5&ws_areaproduct_length_P7AFFXX=5";

  console.log("=== Testing Pricing for User Link ===");
  const pricingUrl = `https://api.onlineprinters.io/api/v2/pricing?country=DEU&articleDeepLink=${encodeURIComponent(link)}`;
  const pricingResp = await fetch(pricingUrl, {
    headers: { 'x-api-key': apiKey, 'Accept': 'application/json' }
  });
  const pricingData = await pricingResp.json();
  console.log("Pricing Status:", pricingResp.status);
  console.log("Articles:", JSON.stringify(pricingData.articles, null, 2));

  if (!pricingData.articles) return;

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
        descriptions: art.product.descriptions || ["Eckige Aufkleber"]
      },
      quantity: 10
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
      quantity: 10,
      deliveryAddress: addr,
      returnAddress: addr,
      shippingService: 'standard'
    }],
    items,
    comment: "op.connect test"
  };

  console.log("\n=== Testing Order for User Link ===");
  const resp = await fetch('https://api.onlineprinters.io/api/v2/jobs', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(jobData)
  });
  const data = await resp.json();
  console.log("Order Status:", resp.status);
  console.log("Order Response:", JSON.stringify(data, null, 2));
}

testUserLink();
