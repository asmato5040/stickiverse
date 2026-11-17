// Schnellbestellung – benötigt products.js, designs.js, cart.js
// ── Schnellbestellung ────────────────────
(function () {
  // Eine Auswahlleiste für alle Formen (Tab-ID = Produkt-ID ohne 'sticker-')
  const TABS = [
    { id: 'alle', label: 'Alle' },
    { id: 'rund', label: 'Rund' },
    { id: 'quadrat', label: 'Quadratisch' },
    { id: 'rechteck', label: 'Rechteckig' },
    { id: 'oval', label: 'Oval' },
    { id: 'freigestanzt', label: 'Freigestanzt' },
    { id: 'transparent', label: 'Transparent' },
    { id: 'designs', label: 'Fertige Designs' },
  ];
  const ALIASES = { eckig: 'quadrat', 'fertige-designs': 'designs' }; // alte Links ?cat=...
  const tabOf = i => i.group === 'designs' ? 'designs' : i.id.replace('sticker-', '');
  const GROUPS = [
    { id: 'eigene', title: 'Eigene Sticker', sub: 'Form wählen, bestellen – Design hochladen vor oder nach dem Kauf',
      match: p => p.group === 'eigene' },
    { id: 'designs', title: 'Fertige Designs', sub: 'Sofort bestellbar, keine Datei nötig',
      match: p => p.group === 'designs' },
  ];

  const DESIGN_BASE = 'sticker-freigestanzt';
  function allItems() {
    const base = getProductById(DESIGN_BASE);
    const own = PRODUCTS.filter(p => p.category !== 'fertige-designs')
      .map(p => ({ ...p, baseId: p.id, group: 'eigene', detail: 'product-detail.html?product=' + p.id }));
    const designs = (typeof MOCK_DESIGNS !== 'undefined' ? MOCK_DESIGNS : []).map(d => ({
      id: d.id, baseId: DESIGN_BASE, group: 'designs', category: 'fertige-designs',
      name: d.title, tagline: 'von ' + d.creator, image: d.image, popular: d.isOfficial,
      sizes: base.sizes, quantities: base.quantities, material: base.material,
      detail: 'design-detail.html?id=' + d.id
    }));
    return [...own, ...designs];
  }
  const itemById = id => allItems().find(i => i.id === id);

  let activeTab = 'alle';
  const choice = {}; // productId -> { size, qty }

  const sel = (p) => (choice[p.id] = choice[p.id] || { size: p.sizes[0].value, qty: p.quantities[0] });

  function card(p) {
    const c = sel(p);
    const total = getPrice(p.baseId, c.size, c.qty);
    const unit = total / c.qty;
    return `
      <article class="oc" data-id="${p.id}">
        <div class="oc__img">
          ${p.popular ? '<span class="oc__badge">Bestseller</span>' : ''}
          <img src="${p.image}" alt="${p.name}" loading="lazy">
        </div>
        <div class="oc__body">
          <h3 class="oc__name">${p.name}</h3>
          <div class="oc__tag">${p.tagline}</div>
          <div class="oc__row">
            <label class="oc__field">Größe
              <select data-role="size">${p.sizes.map(s => `<option value="${s.value}" ${s.value === c.size ? 'selected' : ''}>${s.label}</option>`).join('')}</select>
            </label>
            <label class="oc__field">Menge
              <select data-role="qty">${p.quantities.map(q => `<option value="${q}" ${q === c.qty ? 'selected' : ''}>${q} Stk.</option>`).join('')}</select>
            </label>
          </div>
          <div class="oc__foot">
            <div class="oc__price" data-role="price">${formatPrice(total)}<span class="oc__unit">${formatPrice(unit)} pro Sticker</span></div>
            <button class="btn btn--primary btn--sm oc__btn" data-role="add">In den Warenkorb</button>
          </div>
          <a class="oc__more" href="${p.detail}">Details &amp; Material</a>
        </div>
      </article>`;
  }

  function render() {
    document.getElementById('shopTabs').innerHTML = TABS.map(t =>
      `<button class="shop__tab ${t.id === activeTab ? 'active' : ''}" role="tab" data-tab="${t.id}">${t.label}</button>`).join('');

    const html = GROUPS.map(g => {
      const items = allItems().filter(p => g.match(p) && (activeTab === 'alle' || tabOf(p) === activeTab));
      if (!items.length) return '';
      return `<div class="shop__group">
        <div class="shop__group-head"><h2 class="shop__group-title">${g.title}</h2><span class="shop__group-sub">${g.sub}</span></div>
        <div class="shop__grid">${items.map(card).join('')}</div></div>`;
    }).join('');
    document.getElementById('shopGroups').innerHTML = html;
  }

  function refreshCard(el) {
    const p = itemById(el.dataset.id);
    const c = sel(p);
    const total = getPrice(p.baseId, c.size, c.qty);
    el.querySelector('[data-role="price"]').innerHTML = `${formatPrice(total)}<span class="oc__unit">${formatPrice(total / c.qty)} pro Sticker</span>`;
  }

  function updateBar() {
    const bar = document.getElementById('cartBar');
    const n = getCartCount();
    bar.hidden = n === 0;
    document.getElementById('cartBarCount').textContent = n + (n === 1 ? ' Artikel' : ' Artikel');
    document.getElementById('cartBarTotal').textContent = formatPrice(getCartTotal()) + ' (zzgl. Versand)';
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Deep-Link: ?cat=rund usw. weiterhin unterstützen
    let cat = new URLSearchParams(location.search).get('cat');
    cat = ALIASES[cat] || cat;
    if (cat && TABS.some(t => t.id === cat)) activeTab = cat;
    render();
    updateBar();

    document.getElementById('shopTabs').addEventListener('click', e => {
      const b = e.target.closest('[data-tab]');
      if (!b) return;
      activeTab = b.dataset.tab;
      render();
    });

    document.getElementById('shopGroups').addEventListener('change', e => {
      const card = e.target.closest('.oc');
      const role = e.target.dataset.role;
      if (!card || !role) return;
      const p = itemById(card.dataset.id);
      sel(p)[role] = role === 'qty' ? parseInt(e.target.value) : e.target.value;
      refreshCard(card);
    });

    document.getElementById('shopGroups').addEventListener('click', e => {
      const btn = e.target.closest('[data-role="add"]');
      if (!btn) return;
      const card = btn.closest('.oc');
      const p = itemById(card.dataset.id);
      const c = sel(p);
      const sizeObj = p.sizes.find(s => s.value === c.size);
      const mat = p.category === 'transparent' ? MATERIALS[2] : MATERIALS[0];
      addToCart({
        productId: p.baseId,
        productName: p.name,
        size: c.size,
        sizeLabel: sizeObj ? sizeObj.label : c.size,
        quantity: c.qty,
        price: getPrice(p.baseId, c.size, c.qty),
        previewImage: p.image,
        material: mat.label,
        customDesign: p.group === 'designs',
        hasDesign: p.group === 'designs'
      });
      btn.textContent = '✓ Hinzugefügt';
      btn.classList.add('added');
      setTimeout(() => { btn.textContent = 'In den Warenkorb'; btn.classList.remove('added'); }, 1500);
      updateBar();
    });
  });
})();
