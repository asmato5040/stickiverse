const apiKey = 'OxKvTXMS0mlCqrJao8c2dP6we24mkVnh';

async function testOrder(label, items) {
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
    items,
    comment: "Test"
  };

  console.log(`\n--- ${label} ---`);
  console.log("Items:", JSON.stringify(items, null, 2));

  const resp = await fetch('https://api.onlineprinters.io/api/v2/jobs', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(jobData)
  });
  const data = await resp.json();
  console.log("Status:", resp.status);
  console.log(JSON.stringify(data, null, 2));
  return resp.status;
}

async function run() {
  // Test 1: Parent SKU mit width/length properties
  let status = await testOrder("Parent SKU + properties", [{
    product: {
      sku: "<P8AFFXX><P8AFFXX.AK3.1X10>",
      descriptions: ["Runde Aufkleber"],
      properties: [
        { key: "width", value: "5" },
        { key: "length", value: "5" }
      ]
    },
    quantity: 50
  }]);
  if (status === 201) return;

  // Test 2: Combined parent + variation1 SKU only (no datencheck/produktionszeit)
  status = await testOrder("Parent + Zuschnitt SKU", [{
    product: {
      sku: "<P8AFFXX><P8AFFXX.AK3.1X10>",
      descriptions: ["Runde Aufkleber"],
      properties: [
        { key: "width", value: "5" },
        { key: "length", value: "5" }
      ]
    },
    quantity: 50
  }, {
    product: {
      sku: "<Z8AFFA3S><Z8AFFA3SX99>",
      descriptions: ["Zuschnitt"]
    },
    quantity: 50
  }]);
  if (status === 201) return;

  // Test 3: All 4 SKUs as separate items + properties on main
  status = await testOrder("All 4 SKUs + properties on main", [
    {
      product: {
        sku: "<P8AFFXX><P8AFFXX.AK3.1X10>",
        descriptions: ["Runde Aufkleber im Freiformat"],
        properties: [{ key: "width", value: "5" }, { key: "length", value: "5" }]
      },
      quantity: 50
    },
    {
      product: { sku: "<Z8AFFA3S><Z8AFFA3SX99>", descriptions: ["Zuschnitt: Zuschnitt"] },
      quantity: 50
    },
    {
      product: { sku: "<ZXXXXX2D><ZXXXXX2DD00>", descriptions: ["Datencheck: ohne Datencheck"] },
      quantity: 50
    },
    {
      product: { sku: "<Z7AFFA3Y><Z7AFFA3YY34>", descriptions: ["Produktionszeit: 3-4 Arbeitstage"] },
      quantity: 50
    }
  ]);
  if (status === 201) return;

  // Test 4: Combined SKU + properties  
  status = await testOrder("Combined SKU + properties", [{
    product: {
      sku: "<P8AFFXX><P8AFFXX.AK3.1X10><Z8AFFA3S><Z8AFFA3SX99><ZXXXXX2D><ZXXXXX2DD00><Z7AFFA3Y><Z7AFFA3YY34>",
      descriptions: ["Runde Aufkleber im Freiformat"],
      properties: [{ key: "width", value: "5" }, { key: "length", value: "5" }]
    },
    quantity: 50
  }]);
  if (status === 201) return;

  // Test 5: Using shipping service code from pricing response
  const addr = {
    companyName: "Stickiverse", firstName: "Emre", lastName: "Kocak",
    street: "Musterstr 12", zipCode: "10115", city: "Berlin",
    countryCode: "DEU", phone: "+49123456789", email: "support@stickiverse.de"
  };
  const jobData5 = {
    deliveries: [{
      quantity: 50,
      deliveryAddress: addr,
      returnAddress: addr,
      shippingService: '01-ST-DPD-PAKET-30'
    }],
    items: [{
      product: {
        sku: "<P8AFFXX><P8AFFXX.AK3.1X10>",
        descriptions: ["Runde Aufkleber im Freiformat"],
        properties: [{ key: "width", value: "5" }, { key: "length", value: "5" }]
      },
      quantity: 50
    }],
    comment: "Test"
  };
  console.log("\n--- Parent SKU + DPD shipping code ---");
  const resp5 = await fetch('https://api.onlineprinters.io/api/v2/jobs', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(jobData5)
  });
  const data5 = await resp5.json();
  console.log("Status:", resp5.status);
  console.log(JSON.stringify(data5, null, 2));
}

run();
