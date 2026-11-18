// =============================================
// STICKIVERSE – Produktdaten & Katalog
// =============================================

const PRODUCTS = [
  {
    id: 'sticker-rund',
    name: 'Runde Sticker',
    tagline: 'Der Klassiker – immer eine gute Wahl',
    description: 'Runde Sticker sind vielseitig einsetzbar und sehen auf Flaschen, Verpackungen und Laptops fantastisch aus. Hochglanz-Folie für lebendige Farben.',
    category: 'rund',
    shape: 'circle',
    emoji: '⭕',
    popular: true,
    features: ['Wetterfest', 'UV-beständig', 'Hochglanz', 'Selbstklebend'],
    material: 'Hochglanz-Folie',
    sizes: [
      { label: '3 × 3 cm', value: '3x3', width: 3, height: 3 },
      { label: '5 × 5 cm', value: '5x5', width: 5, height: 5 },
      { label: '7 × 7 cm', value: '7x7', width: 7, height: 7 },
      { label: '10 × 10 cm', value: '10x10', width: 10, height: 10 },
    ],
    quantities: [50, 100, 250, 500, 1000],
    prices: {
      '3x3':   { 50: 9.90,  100: 14.90, 250: 24.90, 500: 39.90, 1000: 64.90 },
      '5x5':   { 50: 12.90, 100: 19.90, 250: 34.90, 500: 59.90, 1000: 99.90 },
      '7x7':   { 50: 15.90, 100: 24.90, 250: 44.90, 500: 74.90, 1000: 124.90 },
      '10x10': { 50: 18.90, 100: 29.90, 250: 54.90, 500: 94.90, 1000: 159.90 },
    },
    baseLink: 'https://www.onlineprinters.de/p/runde-aufkleber-im-freiformat?depvar_index_setparent=%3cP8AFFXX%3e%3cP8AFFXX.AK3.1X10%3e&depvar_qty=10&depvar_index_set_1=%3cZ8AFFA3S%3e%3cZ8AFFA3SX99%3e&depvar_index_set_2=%3cZXXXXX2D%3e%3cZXXXXX2DD00%3e&depvar_index_set_3=%3cZ7AFFA3Y%3e%3cZ7AFFA3YY34%3e',
    opCode: 'P8AFFXX',
    color: '#FFD23F',
    colorGradient: 'linear-gradient(135deg, #FFD23F, #FFB703)',
    image: 'images/Runde Sticker.webp',
  },
  {
    id: 'sticker-quadrat',
    name: 'Quadratische Sticker',
    tagline: 'Klare Linien, starker Auftritt',
    description: 'Quadratische Sticker wirken modern und professionell. Ideal für Logos, QR-Codes und Verpackungsdesign.',
    category: 'eckig',
    shape: 'rect',
    emoji: '⬛',
    popular: false,
    features: ['Wetterfest', 'UV-beständig', 'Hochglanz', 'Selbstklebend'],
    material: 'Hochglanz-Folie',
    sizes: [
      { label: '3 × 3 cm', value: '3x3', width: 3, height: 3 },
      { label: '5 × 5 cm', value: '5x5', width: 5, height: 5 },
      { label: '7 × 7 cm', value: '7x7', width: 7, height: 7 },
      { label: '10 × 10 cm', value: '10x10', width: 10, height: 10 },
    ],
    quantities: [50, 100, 250, 500, 1000],
    prices: {
      '3x3':   { 50: 8.90,  100: 13.90, 250: 22.90, 500: 36.90, 1000: 59.90 },
      '5x5':   { 50: 11.90, 100: 17.90, 250: 30.90, 500: 52.90, 1000: 89.90 },
      '7x7':   { 50: 14.90, 100: 22.90, 250: 40.90, 500: 68.90, 1000: 114.90 },
      '10x10': { 50: 17.90, 100: 27.90, 250: 49.90, 500: 84.90, 1000: 144.90 },
    },
    baseLink: 'https://www.onlineprinters.de/p/eckige-aufkleber-im-freiformat?depvar_index_setparent=%3cP7AFFXX%3e%3cP7AFFXX.AK3.1X10%3e&depvar_qty=10&depvar_index_set_1=%3cZ7AFFA3S%3e%3cZ7AFFA3SX99%3e&depvar_index_set_2=%3cZXXXX93N%3e%3cZXXXX93NN90%3e&depvar_index_set_3=%3cZXXXXX2D%3e%3cZXXXXX2DD00%3e&depvar_index_set_4=%3cZ7AFFA3Y%3e%3cZ7AFFA3YY34%3e',
    opCode: 'P7AFFXX',
    color: '#FFD23F',
    colorGradient: 'linear-gradient(135deg, #FFD23F, #FFD23F)',
    image: 'images/Quadratische Sticker.webp',
  },
  {
    id: 'sticker-rechteck',
    name: 'Rechteckige Sticker',
    tagline: 'Mehr Platz für deine Message',
    description: 'Rechteckige Sticker bieten mehr Platz für Text und Details. Perfekt für Etiketten, Produktbeschriftungen oder Aufkleber mit viel Info.',
    category: 'eckig',
    shape: 'rect-wide',
    emoji: '▬',
    popular: false,
    features: ['Wetterfest', 'UV-beständig', 'Hochglanz', 'Selbstklebend'],
    material: 'Hochglanz-Folie',
    sizes: [
      { label: '5 × 3 cm', value: '5x3', width: 5, height: 3 },
      { label: '7 × 4 cm', value: '7x4', width: 7, height: 4 },
      { label: '10 × 5 cm', value: '10x5', width: 10, height: 5 },
      { label: '15 × 7 cm', value: '15x7', width: 15, height: 7 },
    ],
    quantities: [50, 100, 250, 500, 1000],
    prices: {
      '5x3':  { 50: 10.90, 100: 16.90, 250: 28.90, 500: 46.90, 1000: 76.90 },
      '7x4':  { 50: 13.90, 100: 21.90, 250: 37.90, 500: 62.90, 1000: 104.90 },
      '10x5': { 50: 16.90, 100: 26.90, 250: 47.90, 500: 79.90, 1000: 134.90 },
      '15x7': { 50: 21.90, 100: 34.90, 250: 62.90, 500: 104.90, 1000: 174.90 },
    },
    baseLink: 'https://www.onlineprinters.de/p/eckige-aufkleber-im-freiformat?depvar_index_setparent=%3cP7AFFXX%3e%3cP7AFFXX.AK3.1X10%3e&depvar_qty=10&depvar_index_set_1=%3cZ7AFFA3S%3e%3cZ7AFFA3SX99%3e&depvar_index_set_2=%3cZXXXX93N%3e%3cZXXXX93NN90%3e&depvar_index_set_3=%3cZXXXXX2D%3e%3cZXXXXX2DD00%3e&depvar_index_set_4=%3cZ7AFFA3Y%3e%3cZ7AFFA3YY34%3e',
    opCode: 'P7AFFXX',
    color: '#10B981',
    colorGradient: 'linear-gradient(135deg, #10B981, #FFD23F)',
    image: 'images/Rechteck Sticker.webp',
  },
  {
    id: 'sticker-oval',
    name: 'Ovale Sticker',
    tagline: 'Elegant und einzigartig',
    description: 'Ovale Sticker verbinden das Beste aus runden und eckigen Stickern. Ein elegantes Format für Premium-Marken und besondere Produkte.',
    category: 'rund',
    shape: 'oval',
    emoji: '🥚',
    popular: false,
    features: ['Wetterfest', 'UV-beständig', 'Hochglanz', 'Selbstklebend'],
    material: 'Hochglanz-Folie',
    sizes: [
      { label: '5 × 3 cm', value: '5x3', width: 5, height: 3 },
      { label: '7 × 5 cm', value: '7x5', width: 7, height: 5 },
      { label: '10 × 6 cm', value: '10x6', width: 10, height: 6 },
    ],
    quantities: [50, 100, 250, 500, 1000],
    prices: {
      '5x3':  { 50: 11.90, 100: 17.90, 250: 30.90, 500: 49.90, 1000: 82.90 },
      '7x5':  { 50: 14.90, 100: 23.90, 250: 42.90, 500: 70.90, 1000: 119.90 },
      '10x6': { 50: 17.90, 100: 27.90, 250: 51.90, 500: 86.90, 1000: 144.90 },
    },
    color: '#FFB703',
    colorGradient: 'linear-gradient(135deg, #FFB703, #F59E0B)',
    image: 'images/Oval Sticker.webp',
  },
  {
    id: 'sticker-freigestanzt',
    name: 'Freigestanzte Sticker',
    tagline: 'Deine Form, dein Sticker',
    description: 'Freigestanzte Sticker folgen exakt der Kontur deines Designs. Kein weißer Rand – reines Design. Die Premium-Option für beeindruckende Sticker.',
    category: 'freigestanzt',
    shape: 'star',
    emoji: '⭐',
    popular: true,
    features: ['Wetterfest', 'UV-beständig', 'Hochglanz', 'Konturschnitt', 'Selbstklebend'],
    material: 'Hochglanz-Folie',
    sizes: [
      { label: 'bis 5 × 5 cm', value: '5x5', width: 5, height: 5 },
      { label: 'bis 7 × 7 cm', value: '7x7', width: 7, height: 7 },
      { label: 'bis 10 × 10 cm', value: '10x10', width: 10, height: 10 },
    ],
    quantities: [50, 100, 250, 500, 1000],
    prices: {
      '5x5':   { 50: 16.90, 100: 26.90, 250: 46.90, 500: 78.90, 1000: 129.90 },
      '7x7':   { 50: 21.90, 100: 34.90, 250: 62.90, 500: 104.90, 1000: 174.90 },
      '10x10': { 50: 27.90, 100: 44.90, 250: 79.90, 500: 134.90, 1000: 224.90 },
    },
    color: '#F59E0B',
    colorGradient: 'linear-gradient(135deg, #F59E0B, #FFB703)',
    image: 'images/Freigestanzte Sticker.webp',
  },
  {
    id: 'sticker-transparent',
    name: 'Transparente Sticker',
    tagline: 'Unsichtbarer Hintergrund, maximaler Effekt',
    description: 'Transparente Sticker verschmelzen perfekt mit jeder Oberfläche. Der Hintergrund verschwindet – dein Design bleibt sichtbar.',
    category: 'transparent',
    shape: 'circle',
    emoji: '💎',
    popular: false,
    features: ['Durchsichtig', 'Wetterfest', 'UV-beständig', 'Selbstklebend'],
    material: 'Transparente PVC-Folie',
    sizes: [
      { label: '5 × 5 cm', value: '5x5', width: 5, height: 5 },
      { label: '7 × 7 cm', value: '7x7', width: 7, height: 7 },
      { label: '10 × 10 cm', value: '10x10', width: 10, height: 10 },
    ],
    quantities: [50, 100, 250, 500, 1000],
    prices: {
      '5x5':   { 50: 14.90, 100: 22.90, 250: 39.90, 500: 66.90, 1000: 109.90 },
      '7x7':   { 50: 18.90, 100: 29.90, 250: 52.90, 500: 87.90, 1000: 144.90 },
      '10x10': { 50: 23.90, 100: 37.90, 250: 67.90, 500: 112.90, 1000: 184.90 },
    },
    color: '#FFD23F',
    colorGradient: 'linear-gradient(135deg, rgba(255,210,63,0.6), rgba(255,210,63,0.6))',
    image: 'images/Transparente Sticker.webp',
  },
  {
    id: 'design-robot',
    name: 'Robot Sticker',
    tagline: 'Retro Vibes',
    description: 'Fertiges Design. Wetterfest und langlebig. Perfekt für deinen Laptop.',
    category: 'fertige-designs',
    shape: 'freigestanzt',
    emoji: '',
    popular: true,
    features: ['Wetterfest', 'Hochglanz'],
    material: 'Premium-Vinyl',
    sizes: [
      { label: '5 × 5 cm', value: '5x5', width: 5, height: 5 },
      { label: '7 × 7 cm', value: '7x7', width: 7, height: 7 },
    ],
    quantities: [5, 10, 50, 100],
    prices: {
      '5x5': { 5: 3.90, 10: 5.90, 50: 19.90, 100: 29.90 },
      '7x7': { 5: 4.90, 10: 7.90, 50: 24.90, 100: 39.90 },
    },
    color: '#FFD23F',
    image: 'assets/hero_transparent/hero_robot_1784152930155.png',
  },
  {
    id: 'design-ufo',
    name: 'UFO Abduction',
    tagline: 'I want to believe',
    description: 'Extraterrestrischer Style. Freigestanzt und in lebendigen Farben gedruckt.',
    category: 'fertige-designs',
    shape: 'freigestanzt',
    emoji: '',
    popular: false,
    features: ['Wetterfest', 'Matt'],
    material: 'Premium-Vinyl',
    sizes: [
      { label: '5 × 5 cm', value: '5x5', width: 5, height: 5 },
    ],
    quantities: [5, 10, 50, 100],
    prices: {
      '5x5': { 5: 3.90, 10: 5.90, 50: 19.90, 100: 29.90 },
    },
    color: '#10B981',
    image: 'assets/hero_transparent/hero_ufo_1784152980353.png',
  },
  {
    id: 'design-tiger',
    name: 'Neon Tiger',
    tagline: 'Roar!',
    description: 'Farbintensiver Tiger im Retro-Neon-Look. Garantiert ein Hingucker.',
    category: 'fertige-designs',
    shape: 'freigestanzt',
    emoji: '',
    popular: true,
    features: ['Wetterfest', 'Hochglanz'],
    material: 'Premium-Vinyl',
    sizes: [
      { label: '5 × 5 cm', value: '5x5', width: 5, height: 5 },
      { label: '7 × 7 cm', value: '7x7', width: 7, height: 7 },
    ],
    quantities: [5, 10, 50, 100],
    prices: {
      '5x5': { 5: 3.90, 10: 5.90, 50: 19.90, 100: 29.90 },
      '7x7': { 5: 4.90, 10: 7.90, 50: 24.90, 100: 39.90 },
    },
    color: '#F59E0B',
    image: 'assets/hero_transparent/hero_tiger_1784152972666.png',
  },
  {
    id: 'design-boombox',
    name: 'Retro Boombox',
    tagline: '80s Classic',
    description: 'Für alle Retro- und Musik-Fans. Dicker Vinyl-Aufkleber mit starker Klebkraft.',
    category: 'fertige-designs',
    shape: 'freigestanzt',
    emoji: '',
    popular: false,
    features: ['Wetterfest', 'Hochglanz'],
    material: 'Premium-Vinyl',
    sizes: [
      { label: '5 × 5 cm', value: '5x5', width: 5, height: 5 },
    ],
    quantities: [5, 10, 50, 100],
    prices: {
      '5x5': { 5: 3.90, 10: 5.90, 50: 19.90, 100: 29.90 },
    },
    color: '#FFB703',
    image: 'assets/hero_transparent/hero_boombox_1784152956731.png',
  }
];

// MATERIALIEN (Zentral definiert)
const MATERIALS = [
  { id: 'glossy', label: '90 µm PP weiß, glänzend', code: '.AK3.1X10' },
  { id: 'matte', label: '90 µm PP weiß, matt', code: '.AK3.1X11' }, // Platzhalter-Code
  { id: 'transparent', label: 'Transparente Folie', code: '.AK3.1X12' } // Platzhalter-Code
];

// Kategorien
const CATEGORIES = [
  { id: 'alle', label: 'Alle Sticker', emoji: '' },
  { id: 'fertige-designs', label: 'Fertige Designs', emoji: '' },
  { id: 'rund', label: 'Rund', emoji: '⭕' },
  { id: 'eckig', label: 'Eckig', emoji: '⬛' },
  { id: 'freigestanzt', label: 'Freigestanzt', emoji: '⭐' },
  { id: 'transparent', label: 'Transparent', emoji: '💎' },
];

// Preis eines Produkts berechnen (statisch)
function getPrice(productId, size, quantity) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return 0;
  const sizeKey = size || product.sizes[0].value;
  const qty = parseInt(quantity) || product.quantities[0];
  return product.prices[sizeKey]?.[qty] || 0;
}

// NEU: Asynchroner Live-Preis von Onlineprinters via Supabase Edge Function
async function getLivePrice(productId, size, quantity, country = 'DEU') {
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
      .replace(/depvar_qty=\d+/, `depvar_qty=${qty}`)
      .replace('{{quantity}}', qty).replace('{{qty}}', qty);
      
    if (product.opCode) {
      processedLink += `&ws_areaproduct_width_${product.opCode}=${sizeObj.width}&ws_areaproduct_length_${product.opCode}=${sizeObj.height}`;
    }

    const { data, error } = await db.functions.invoke('onlineprinters/pricing', {
      body: { country: country, articleDeepLink: processedLink, mode: 'storefront', product_id: productId }
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
async function getLivePriceDetails(productId, size, quantity, materialCode, country = 'DEU') {
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
      .replace(/depvar_qty=\d+/, `depvar_qty=${qty}`)
      .replace('{{quantity}}', qty).replace('{{qty}}', qty);
      
    // Replace the default material code with the selected one
    if (materialCode) {
      processedLink = processedLink.replace(/\.AK3\.1X10/g, materialCode);
    }
      
    if (product.opCode) {
      let w = sizeObj.width;
      let h = sizeObj.height;
      if (w > h) {
        const t = w;
        w = h;
        h = t;
      }
      processedLink += `&ws_areaproduct_width_${product.opCode}=${w}&ws_areaproduct_length_${product.opCode}=${h}`;
    }

    const { data, error } = await db.functions.invoke('onlineprinters/pricing', {
      body: { country, articleDeepLink: processedLink, mode: 'storefront', product_id: productId }
    });

    if (error) throw error;

    let price = staticPrice;
    if (data?.storefront_price) {
      price = data.final_gross;
    } else if (data?.total?.total?.amount) {
      price = parseFloat(data.total.total.amount);
    }

    return { price, sku: null };
  } catch (err) {
    console.warn('API Price Details fetch failed:', err);
    return { price: staticPrice, sku: null };
  }
}

// Preis pro Sticker
function getPricePerUnit(productId, size, quantity) {
  const total = getPrice(productId, size, quantity);
  return total / parseInt(quantity);
}

// Preis formatieren
function formatPrice(amount) {
  return amount.toFixed(2).replace('.', ',') + ' €';
}

// Produkt nach ID
function getProductById(id) {
  return PRODUCTS.find(p => p.id === id) || null;
}

// Produkte nach Kategorie filtern
function getProductsByCategory(category) {
  if (category === 'alle') return PRODUCTS;
  return PRODUCTS.filter(p => p.category === category);
}

