const apiKey = 'OxKvTXMS0mlCqrJao8c2dP6we24mkVnh';

async function testOrder() {
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
        sku: "<P8AFFXX><P8AFFXX.AK3.1X10>",
        descriptions: ["Runde Aufkleber im Freiformat"],
        properties: [
          { key: "width", value: "5" },
          { key: "length", value: "5" }
        ]
      },
      quantity: 50
    }],
    comment: "op.connect test",
    orderer: {
      userIndex: 1,
      email: "support@stickiverse.de"
    }
  };

  console.log("\n--- Testing with orderer object ---");

  const resp = await fetch('https://api.onlineprinters.io/api/v2/jobs', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(jobData)
  });
  const data = await resp.json();
  console.log("Status:", resp.status);
  console.log(JSON.stringify(data, null, 2));
}

testOrder();
