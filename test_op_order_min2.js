const apiKey = 'OxKvTXMS0mlCqrJao8c2dP6we24mkVnh';

async function testOrder() {
  const deepLink = "https://www.onlineprinters.de/p/runde-aufkleber-im-freiformat?depvar_index_setparent=%3cP8AFFXX%3e%3cP8AFFXX.AK3.1X10%3e&depvar_qty=50&depvar_index_set_1=%3cZ8AFFA3S%3e%3cZ8AFFA3SX99%3e&depvar_index_set_2=%3cZXXXXX2D%3e%3cZXXXXX2DD00%3e&depvar_index_set_3=%3cZ7AFFA3Y%3e%3cZ7AFFA3YY34%3e&ws_areaproduct_width_P8AFFXX=5&ws_areaproduct_length_P8AFFXX=5";

  const jobData = {
    customerReference: "TEST-ORDER-12345",
    deliveries: [
      {
        quantity: 50,
        deliveryAddress: {
          companyName: "Stickiverse",
          firstName: "Emre",
          lastName: "Kocak",
          street: "Musterstraße 12",
          zipCode: "10115", 
          city: "Berlin",
          countryCode: "DEU",
          phone: "+49123456789",
          email: "support@stickiverse.de"
        }
      }
    ],
    items: [
      {
        customerReference: "ITEM-1",
        product: {
          articleDeepLink: deepLink
        },
        quantity: 50
      }
    ]
  };

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
  console.log("Status:", resp.status);
  console.log(JSON.stringify(data, null, 2));
}

testOrder();
