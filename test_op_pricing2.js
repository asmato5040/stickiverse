const apiKey = 'OxKvTXMS0mlCqrJao8c2dP6we24mkVnh';

async function testLink(link) {
  const resp = await fetch('https://api.onlineprinters.io/api/v2/pricing', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      country: 'DEU',
      articleDeepLink: link
    })
  });
  
  const data = await resp.json();
  console.log("Status:", resp.status);
  console.log(JSON.stringify(data, null, 2));
}

testLink("https://www.onlineprinters.de/p/runde-aufkleber-im-freiformat?depvar_index_setparent=%3cP8AFFXX%3e%3cP8AFFXX.AK3.1X10%3e&depvar_qty=10&depvar_index_set_1=%3cZ8AFFA3S%3e%3cZ8AFFA3SX99%3e&depvar_index_set_2=%3cZXXXXX2D%3e%3cZXXXXX2DD00%3e&depvar_index_set_3=%3cZ7AFFA3Y%3e%3cZ7AFFA3YY34%3e");
