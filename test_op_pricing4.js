const apiKey = 'OxKvTXMS0mlCqrJao8c2dP6we24mkVnh';

async function testLink(link) {
  const url = `https://api.onlineprinters.io/api/v2/pricing?country=DEU&articleDeepLink=${encodeURIComponent(link)}`;
  console.log(url);
  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      'x-api-key': apiKey,
      'Accept': 'application/json'
    }
  });
  
  const data = await resp.json();
  console.log("Status:", resp.status);
  console.log(JSON.stringify(data, null, 2));
}

testLink("https://www.onlineprinters.de/p/runde-aufkleber-im-freiformat?depvar_index_setparent=%3cP8AFFXX%3e%3cP8AFFXX.AK3.1X10%3e&depvar_qty=50&depvar_index_set_1=%3cZ8AFFA3S%3e%3cZ8AFFA3SX99%3e&depvar_index_set_2=%3cZXXXXX2D%3e%3cZXXXXX2DD00%3e&depvar_index_set_3=%3cZ7AFFA3Y%3e%3cZ7AFFA3YY34%3e&ws_areaproduct_width_P8AFFXX=5&ws_areaproduct_length_P8AFFXX=5");
