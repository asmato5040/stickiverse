import json
import re
import sys

def modify_products():
    filepath = '/Users/emrekocak/.gemini/antigravity/scratch/stickiverse/js/products.js'
    with open(filepath, 'r') as f:
        content = f.read()

    # Add baseLink and opCode to Rund
    rund_base = "https://www.onlineprinters.de/p/runde-aufkleber-im-freiformat?depvar_index_setparent=%3cP8AFFXX%3e%3cP8AFFXX.AK3.1X10%3e&depvar_qty={{quantity}}&depvar_index_set_1=%3cZ8AFFA3S%3e%3cZ8AFFA3SX99%3e&depvar_index_set_2=%3cZXXXXX2D%3e%3cZXXXXX2DD00%3e&depvar_index_set_3=%3cZ7AFFA3Y%3e%3cZ7AFFA3YY34%3e"
    content = re.sub(
        r"deepLinks:\s*\{[^}]+\},",
        f"baseLink: '{rund_base}',\n    opCode: 'P8AFFXX',",
        content,
        count=1 # Only first one (Rund)
    )

    # Square
    eckig_base = "https://www.onlineprinters.de/p/eckige-aufkleber-im-freiformat?depvar_index_setparent=%3cP7AFFXX%3e%3cP7AFFXX.AK3.1X10%3e&depvar_qty={{quantity}}&depvar_index_set_1=%3cZ7AFFA3S%3e%3cZ7AFFA3SX99%3e&depvar_index_set_2=%3cZXXXX93N%3e%3cZXXXX93NN90%3e&depvar_index_set_3=%3cZXXXXX2D%3e%3cZXXXXX2DD00%3e&depvar_index_set_4=%3cZ7AFFA3Y%3e%3cZ7AFFA3YY34%3e"
    content = re.sub(
        r"deepLinks:\s*\{[^}]+\},",
        f"baseLink: '{eckig_base}',\n    opCode: 'P7AFFXX',",
        content,
        count=1 # Second one (Square)
    )

    # Rectangle (also eckig base)
    content = re.sub(
        r"deepLinks:\s*\{[^}]+\},",
        f"baseLink: '{eckig_base}',\n    opCode: 'P7AFFXX',",
        content,
        count=1 # Third one (Rectangle)
    )

    # Oval (Let's keep empty baseLink for now or use Rund as fallback)
    content = re.sub(
        r"deepLinks:\s*\{[^}]+\},",
        f"baseLink: '{rund_base}',\n    opCode: 'P8AFFXX',",
        content,
        count=1 # Fourth one (Oval)
    )

    # Transparent (fallback)
    content = re.sub(
        r"deepLinks:\s*\{[^}]+\},",
        f"baseLink: '{rund_base}',\n    opCode: 'P8AFFXX',",
        content,
        count=1 # Fifth one (Transparent)
    )

    # For Freigestanzt (Konturschnitt)
    kontur_base = "https://www.onlineprinters.de/p/aufkleber-mit-konturschnitt?depvar_index_setparent=%3cP9AFFXX%3e%3cP9AFFXX.AK3.1X10%3e&depvar_qty={{quantity}}&depvar_index_set_1=%3cZ7AFFA3S%3e%3cZ7AFFA3SX99%3e&depvar_index_set_2=%3cZXXXXX2D%3e%3cZXXXXX2DD00%3e&depvar_index_set_3=%3cZ7AFFA3Y%3e%3cZ7AFFA3YY34%3e"
    
    # We replace any remaining deepLinks with kontur_base (since the rest are 'fertige-designs' which are 'freigestanzt')
    content = re.sub(
        r"deepLinks:\s*\{[^}]+\},?",
        f"baseLink: '{kontur_base}',\n    opCode: 'P9AFFXX',",
        content
    )
    
    # Update getLivePrice
    getLivePrice_new = """async function getLivePrice(productId, size, quantity, country = 'DEU') {
  const product = getProductById(productId);
  if (!product) return 0;

  const sizeKey = size || product.sizes[0].value;
  const sizeObj = product.sizes.find(s => s.value === sizeKey) || product.sizes[0];
  const qty = parseInt(quantity) || product.quantities[0];

  if (!product.baseLink || typeof db === 'undefined') {
    return getPrice(productId, size, quantity);
  }

  try {
    let processedLink = product.baseLink
      .replace(/depvar_qty=\\d+/, `depvar_qty=${qty}`)
      .replace('{{quantity}}', qty).replace('{{qty}}', qty);
      
    if (product.opCode) {
      processedLink += `&ws_areaproduct_width_${product.opCode}=${sizeObj.width}&ws_areaproduct_length_${product.opCode}=${sizeObj.height}`;
    }

    const { data, error } = await db.functions.invoke('onlineprinters/pricing', {
      body: { country: country, articleDeepLink: processedLink }
    });

    if (error) throw error;
    if (data?.total?.total?.amount) {
      return parseFloat(data.total.total.amount);
    }
  } catch (err) {
    console.warn('API Price fetch failed, falling back to static price table:', err);
  }

  return getPrice(productId, size, quantity);
}

// NEU: Holt Live-Preis UND die SKU von Onlineprinters
async function getLivePriceDetails(productId, size, quantity, country = 'DEU') {
  const product = getProductById(productId);
  const staticPrice = getPrice(productId, size, quantity);
  if (!product || !product.baseLink || typeof db === 'undefined') {
    return { price: staticPrice, sku: null };
  }

  const sizeKey = size || product.sizes[0].value;
  const sizeObj = product.sizes.find(s => s.value === sizeKey) || product.sizes[0];
  const qty = parseInt(quantity) || product.quantities[0];

  try {
    let processedLink = product.baseLink
      .replace(/depvar_qty=\\d+/, `depvar_qty=${qty}`)
      .replace('{{quantity}}', qty).replace('{{qty}}', qty);
      
    if (product.opCode) {
      processedLink += `&ws_areaproduct_width_${product.opCode}=${sizeObj.width}&ws_areaproduct_length_${product.opCode}=${sizeObj.height}`;
    }

    const { data, error } = await db.functions.invoke('onlineprinters/pricing', {
      body: { country, articleDeepLink: processedLink }
    });

    if (error) throw error;

    const firstArticle = data?.articles?.[0];
    const sku = firstArticle?.product?.sku || null;
    const price = data?.total?.total?.amount ? parseFloat(data.total.total.amount) : staticPrice;

    return { price, sku };
  } catch (err) {
    console.warn('API Price Details fetch failed:', err);
    return { price: staticPrice, sku: null };
  }
}"""
    
    # Replace the old functions
    content = re.sub(
        r"async function getLivePrice\(.*?\}\n\n// NEU: Holt Live-Preis UND die SKU von Onlineprinters\nasync function getLivePriceDetails\(.*?\}",
        getLivePrice_new,
        content,
        flags=re.DOTALL
    )

    with open(filepath, 'w') as f:
        f.write(content)

modify_products()
