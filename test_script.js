
// Globaler Error-Bypass für einfache Fehlersuche
window.onerror = function(message, source, lineno, colno, error) {
  const errDiv = document.createElement('div');
  errDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#ef4444;color:white;padding:16px;z-index:99999;font-weight:bold;text-align:center;font-family:sans-serif;box-shadow:0 4px 20px rgba(0,0,0,0.5);';
  errDiv.textContent = `🚨 JS-Fehler: ${message} (Zeile ${lineno} in ${source.split('/').pop()})`;
  document.body.appendChild(errDiv);
  return false;
};

// ============================================
// STICKIVERSE ADMIN DASHBOARD
// ============================================

let allOrders = [];
let allCustomers = [];
let currentStatusFilter = 'all';
let revenueChart, productChart;

// ── Init ──────────────────────────────────
async function initAdmin() {
  try {
    const { data: { session } } = await db.auth.getSession();

    if (!session) {
      // Nicht eingeloggt → Login-Seite oder Modal
      showLoginForAdmin();
      return;
    }

    // Admin prüfen
    const { data: profile } = await db.from('profiles')
      .select('*').eq('id', session.user.id).single();

    if (!profile?.is_admin) {
      document.getElementById('loadingScreen').style.display = 'none';
      document.getElementById('accessDenied').style.display = 'flex';
      return;
    }

    // Admin bestätigt
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('adminLayout').style.display = 'grid';

    // User-Info
    const name = profile.first_name || session.user.email?.split('@')[0] || 'Admin';
    document.getElementById('adminName').textContent = name;
    document.getElementById('adminAvatar').textContent = name[0].toUpperCase();
    document.getElementById('settingEmail').textContent = session.user.email;
    document.getElementById('settingUrl').textContent = SUPABASE_URL.replace('https://', '');

    await loadData();
    initCharts();

  } catch (err) {
    console.error('Admin init error:', err);
    showToast('Fehler beim Laden des Dashboards.', 'error');
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('accessDenied').style.display = 'flex';
  }
}

function showLoginForAdmin() {
  document.getElementById('loadingScreen').innerHTML = `
    <div style="text-align:center;max-width:400px;padding:40px;">
      <div style="font-size:48px;margin-bottom:20px;">🔒</div>
      <h2 style="font-family:'Inter',system-ui,sans-serif;font-size:24px;font-weight:800;margin-bottom:12px;">Admin Login</h2>
      <p style="color:rgba(255,255,255,0.5);margin-bottom:28px;">Bitte melde dich mit deinem Admin-Konto an.</p>
      <form id="adminLoginForm" style="display:flex;flex-direction:column;gap:12px;">
        <input type="email" id="adminEmail" placeholder="E-Mail" required
          style="padding:12px 16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:white;font-size:15px;outline:none;">
        <input type="password" id="adminPass" placeholder="Passwort" required
          style="padding:12px 16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:white;font-size:15px;outline:none;">
        <button type="submit" style="padding:14px;background:linear-gradient(135deg,#8B5CF6,#EC4899);border:none;border-radius:10px;color:white;font-size:16px;font-weight:700;font-family:'Inter',system-ui,sans-serif;cursor:pointer;">
          Einloggen
        </button>
      </form>
      <div id="loginError" style="color:#ef4444;font-size:13px;margin-top:10px;"></div>
    </div>
  `;
  document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const pass  = document.getElementById('adminPass').value;
    try {
      await db.auth.signInWithPassword({ email, password: pass });
      window.location.reload();
    } catch (err) {
      document.getElementById('loginError').textContent = 'Falsche Anmeldedaten.';
    }
  });
}

// ── Daten laden ───────────────────────────
async function loadData() {
  await Promise.all([loadOrders(), loadCustomers(), updateStats()]);
}

async function loadOrders() {
  console.log("🛠️ [Debug-Admin] loadOrders gestartet...");
  const { data, error } = await db
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  console.log("🛠️ [Debug-Admin] loadOrders Ergebnis:", { data, error });

  if (error) {
    console.error("🛠️ [Debug-Admin] loadOrders Fehler:", error);
    return;
  }
  allOrders = data || [];

  const pending = allOrders.filter(o => o.status === 'pending').length;
  document.getElementById('pendingBadge').textContent = pending;

  console.log("🛠️ [Debug-Admin] pending orders:", pending);
  renderRecentOrders();
  renderAllOrders();
}

async function loadCustomers() {
  const { data, error } = await db
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { console.error(error); return; }
  allCustomers = data || [];
  renderCustomers();
}

// ── Stats ─────────────────────────────────
async function updateStats() {
  const revenue = allOrders.reduce((s, o) => s + parseFloat(o.total || 0), 0);
  const pending = allOrders.filter(o => o.status === 'pending').length;

  document.getElementById('statRevenue').textContent = formatPrice(revenue);
  document.getElementById('statOrders').textContent = allOrders.length;
  document.getElementById('statPending').textContent = pending;
  document.getElementById('statCustomers').textContent = allCustomers.length;
  document.getElementById('statRevenueChange').textContent = `${allOrders.length} Bestellungen gesamt`;
  document.getElementById('statPendingChange').textContent = pending > 0 ? `${pending} warten auf Bearbeitung` : 'Keine offenen Bestellungen ✓';
  document.getElementById('statCustomersChange').textContent = 'Registrierte Kunden';
  document.getElementById('statOrdersChange').textContent = 'Bestellungen gesamt';
  document.getElementById('ordersCount').textContent = `${allOrders.length} Bestellungen`;
}

// ── Charts ────────────────────────────────
function initCharts() {
  // Revenue Chart
  const revenueCtx = document.getElementById('revenueChart').getContext('2d');
  const last30Days = getLast30Days();
  const revenueData = last30Days.map(day => {
    return allOrders
      .filter(o => o.created_at.startsWith(day))
      .reduce((s, o) => s + parseFloat(o.total || 0), 0);
  });

  revenueChart = new Chart(revenueCtx, {
    type: 'line',
    data: {
      labels: last30Days.map(d => d.slice(5)), // MM-DD
      datasets: [{
        data: revenueData,
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139,92,246,0.08)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#8B5CF6',
        pointRadius: 3,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 }, maxTicksLimit: 8 } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 }, callback: v => v + ' €' } }
      }
    }
  });

  // Product Mix Chart
  const productCtx = document.getElementById('productChart').getContext('2d');
  const productCounts = {};
  allOrders.forEach(o => {
    (o.order_items || []).forEach(item => {
      productCounts[item.product_name] = (productCounts[item.product_name] || 0) + 1;
    });
  });

  const labels = Object.keys(productCounts);
  const values = Object.values(productCounts);

  productChart = new Chart(productCtx, {
    type: 'doughnut',
    data: {
      labels: labels.length > 0 ? labels : ['Noch keine Bestellungen'],
      datasets: [{
        data: values.length > 0 ? values : [1],
        backgroundColor: ['#8B5CF6','#EC4899','#06B6D4','#10B981','#F59E0B','#EF4444'],
        borderWidth: 0,
        hoverOffset: 6,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: 'rgba(255,255,255,0.5)', font: { size: 11 }, boxWidth: 10, padding: 12 }
        }
      }
    }
  });
}

function getLast30Days() {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0,10));
  }
  return days;
}

// ── Render Tables ─────────────────────────
function renderRecentOrders() {
  const recent = allOrders.slice(0, 8);
  renderOrdersTable('recentOrdersTable', recent);
}

function renderAllOrders() {
  console.log("🛠️ [Debug-Admin] renderAllOrders aufgerufen. Filter:", currentStatusFilter);
  const filtered = currentStatusFilter === 'all'
    ? allOrders
    : allOrders.filter(o => o.status === currentStatusFilter);
  
  console.log("🛠️ [Debug-Admin] gefilterte Bestellungen Anzahl:", filtered.length);
  renderOrdersTable('allOrdersTable', filtered);
  
  const countEl = document.getElementById('ordersCount');
  if (countEl) {
    countEl.textContent = `${filtered.length} Bestellungen`;
  }

  const allTable = document.getElementById('allOrdersTable');
  if (allTable) {
    console.log("🛠️ [Debug-Admin] allOrdersTable innerHTML Inhalt:", allTable.innerHTML);
    console.log("🛠️ [Debug-Admin] allOrdersTable Render-Höhe (px):", allTable.offsetHeight);
  }
}

function filterOrders(status) {
  currentStatusFilter = status;
  document.querySelectorAll('.filter-status-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.status === status);
  });
  renderAllOrders();
}

function renderOrdersTable(containerId, orders) {
  try {
    const container = document.getElementById(containerId);
    console.log(`🛠️ [Debug-Admin] renderOrdersTable für '${containerId}'. Container vorhanden:`, !!container, "Bestellungen Anzahl:", orders.length);
    if (!container) return;
    
    if (orders.length === 0) {
      container.innerHTML = `<div class="table-loading" style="padding:40px;">Keine Bestellungen gefunden.</div>`;
      return;
    }

    const statusLabels = {
      pending: 'Ausstehend', confirmed: 'Bestätigt',
      in_production: 'In Produktion', shipped: 'Versandt',
      delivered: 'Geliefert', cancelled: 'Storniert'
    };

    container.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Vorschau</th>
            <th>Bestellnr.</th>
            <th>Kunde</th>
            <th>Produkte</th>
            <th>Betrag</th>
            <th>Status</th>
            <th>Datum</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          ${orders.map(order => {
            const firstItem = order.order_items?.[0];
            const customerName = order.delivery_first_name
              ? `${order.delivery_first_name} ${order.delivery_last_name}`
              : order.guest_email || 'Gast';
            const itemCount = order.order_items?.length || 0;

            return `
              <tr>
                <td>
                  <div class="order-preview-img">
                    ${firstItem?.preview_image
                      ? `<img src="${firstItem.preview_image}" alt="">`
                      : '🎨'}
                  </div>
                </td>
                <td><strong>${order.order_number}</strong></td>
                <td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${customerName}</td>
                <td>${itemCount} Artikel</td>
                <td><strong>${formatPrice(parseFloat(order.total || 0))}</strong></td>
                <td>
                  <span class="status-badge status-badge--${order.status}">
                    ${statusLabels[order.status] || order.status}
                  </span>
                </td>
                <td style="color:rgba(255,255,255,0.4);">
                  ${new Date(order.created_at).toLocaleDateString('de-DE')}
                </td>
                <td>
                  <div style="display:flex;gap:6px;align-items:center;">
                    <button class="btn btn--ghost btn--sm" onclick="openOrderDetail('${order.id}')" style="padding:5px 10px;">
                      👁 Detail
                    </button>
                    <select class="status-select" onchange="updateOrderStatus('${order.id}', this.value)">
                      <option value="pending"       ${order.status==='pending'       ?'selected':''}>Ausstehend</option>
                      <option value="confirmed"     ${order.status==='confirmed'     ?'selected':''}>Bestätigt</option>
                      <option value="in_production" ${order.status==='in_production' ?'selected':''}>⚙️ Produktion</option>
                      <option value="shipped"       ${order.status==='shipped'       ?'selected':''}>🚚 Versandt</option>
                      <option value="delivered"     ${order.status==='delivered'     ?'selected':''}>📬 Geliefert</option>
                      <option value="cancelled"     ${order.status==='cancelled'     ?'selected':''}>Storniert</option>
                    </select>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    console.error("Fehler in renderOrdersTable:", err);
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `<div style="color:#ef4444;padding:40px;text-align:center;font-weight:600;">⚠️ Fehler beim Laden der Bestellungen: ${err.message}</div>`;
    }
  }
}

function renderCustomers() {
  const container = document.getElementById('customersTable');
  if (allCustomers.length === 0) {
    container.innerHTML = `<div class="table-loading" style="padding:40px;">Noch keine Kunden.</div>`;
    return;
  }
  container.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Avatar</th>
          <th>Name</th>
          <th>Registriert am</th>
          <th>Admin</th>
        </tr>
      </thead>
      <tbody>
        ${allCustomers.map(c => `
          <tr>
            <td>
              <div style="width:36px;height:36px;background:linear-gradient(135deg,#8B5CF6,#EC4899);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;">
                ${(c.first_name?.[0] || '?').toUpperCase()}
              </div>
            </td>
            <td>
              <div style="font-weight:600;">${c.first_name || ''} ${c.last_name || ''}</div>
              <div style="font-size:12px;color:rgba(255,255,255,0.35);">${c.city || ''}</div>
            </td>
            <td style="color:rgba(255,255,255,0.4);">${new Date(c.created_at).toLocaleDateString('de-DE')}</td>
            <td>
              ${c.is_admin
                ? '<span style="color:#10B981;font-weight:700;">✓ Admin</span>'
                : '<span style="color:rgba(255,255,255,0.25);">–</span>'}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// ── Order Status Update ───────────────────
async function updateOrderStatus(orderId, newStatus) {
  const { error } = await db
    .from('orders')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', orderId);

  if (error) {
    showToast('Status konnte nicht aktualisiert werden.', 'error');
    return;
  }

  const order = allOrders.find(o => o.id === orderId);
  if (order) order.status = newStatus;

  showToast('Status aktualisiert! ✓', 'success');
  updateStats();
  document.getElementById('pendingBadge').textContent =
    allOrders.filter(o => o.status === 'pending').length;
}

// ── Order Detail Modal ────────────────────
function openOrderDetail(orderId) {
  const order = allOrders.find(o => o.id === orderId);
  if (!order) return;

  document.getElementById('modalOrderNr').textContent = order.order_number;
  document.getElementById('modalOrderDate').textContent =
    new Date(order.created_at).toLocaleString('de-DE');

  const content = document.getElementById('orderDetailContent');
  content.innerHTML = `
    <div class="detail-grid">
      <div class="detail-section">
        <div class="detail-section__title">Lieferadresse</div>
        <div class="detail-row"><span class="detail-row__label">Name</span><span class="detail-row__value">${order.delivery_first_name || '–'} ${order.delivery_last_name || ''}</span></div>
        ${order.delivery_company ? `<div class="detail-row"><span class="detail-row__label">Firma</span><span class="detail-row__value">${order.delivery_company}</span></div>` : ''}
        <div class="detail-row"><span class="detail-row__label">Adresse</span><span class="detail-row__value">${order.delivery_street || '–'} ${order.delivery_street_nr || ''}</span></div>
        <div class="detail-row"><span class="detail-row__label">PLZ / Ort</span><span class="detail-row__value">${order.delivery_zip || '–'} ${order.delivery_city || ''}</span></div>
        <div class="detail-row"><span class="detail-row__label">Land</span><span class="detail-row__value">${order.delivery_country || 'DE'}</span></div>
        ${order.delivery_phone ? `<div class="detail-row"><span class="detail-row__label">Telefon</span><span class="detail-row__value">${order.delivery_phone}</span></div>` : ''}
        ${order.delivery_email || order.guest_email ? `<div class="detail-row"><span class="detail-row__label">E-Mail</span><span class="detail-row__value">${order.delivery_email || order.guest_email}</span></div>` : ''}
      </div>
      <div class="detail-section">
        <div class="detail-section__title">Bestelldetails</div>
        <div class="detail-row"><span class="detail-row__label">Bestellnr.</span><span class="detail-row__value">${order.order_number}</span></div>
        <div class="detail-row"><span class="detail-row__label">Versand</span><span class="detail-row__value">${order.shipping_method === 'express' ? 'Express' : 'Standard'}</span></div>
        <div class="detail-row"><span class="detail-row__label">Zwischensumme</span><span class="detail-row__value">${formatPrice(parseFloat(order.subtotal))}</span></div>
        <div class="detail-row"><span class="detail-row__label">Versandkosten</span><span class="detail-row__value">${formatPrice(parseFloat(order.shipping_cost))}</span></div>
        <div class="detail-row"><span class="detail-row__label">MwSt.</span><span class="detail-row__value">${formatPrice(parseFloat(order.tax || 0))}</span></div>
        <div class="detail-row" style="border-top:1px solid rgba(255,255,255,0.06);padding-top:8px;margin-top:4px;">
          <span style="font-weight:700;">Gesamt</span>
          <span style="font-weight:800;font-size:18px;background:linear-gradient(135deg,#8B5CF6,#EC4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${formatPrice(parseFloat(order.total))}</span>
        </div>
      </div>
    </div>

    ${order.notes ? `<div class="detail-section" style="margin-bottom:20px;"><div class="detail-section__title">Anmerkungen</div><p style="font-size:14px;color:rgba(255,255,255,0.6);">${order.notes}</p></div>` : ''}

    <div class="detail-section">
      <div class="detail-section__title">Artikel (${order.order_items?.length || 0})</div>
      ${(order.order_items || []).map(item => `
        <div style="display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
          <div class="order-preview-img">
            ${item.preview_image ? `<img src="${item.preview_image}" alt="">` : '🎨'}
          </div>
          <div style="flex:1;">
            <div style="font-weight:600;font-size:14px;">${item.product_name}</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.4);">${item.size_label} · ${item.print_quantity} Stück · ×${item.cart_quantity}</div>
          </div>
          <div style="font-weight:700;">${formatPrice(parseFloat(item.total_price))}</div>
        </div>
      `).join('')}
    </div>

    <div style="margin-top: 24px; display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px;">
      <button class="btn btn--primary" onclick="transmitToOnlineprinters('${order.id}')" id="transmitBtn-${order.id}">
        An Onlineprinters senden
      </button>
    </div>
  `;

  document.getElementById('orderDetailModal').classList.add('show');
}

function closeOrderDetail() {
  document.getElementById('orderDetailModal').classList.remove('show');
}

// ── Bestellung an Onlineprinters übermitteln ─────────
async function transmitToOnlineprinters(orderId) {
  const order = allOrders.find(o => o.id === orderId);
  if (!order) return;

  const btn = document.getElementById(`transmitBtn-${orderId}`);
  btn.disabled = true;
  btn.textContent = 'Übermittele...';

  // 1. Für jeden Artikel zuerst die SKU via Pricing-API holen, dann Items bauen
  const mappedItems = [];
  
  for (const item of order.order_items) {
    const product = getProductById(item.product_id);
    const sizeStr = (item.size_label || '5x5').replace(/cm/gi, '').split(/[x×]/).map(s => s.trim());
    let width = parseFloat(sizeStr[0]) || 5;
    let height = parseFloat(sizeStr[1]) || width;
    
    // OP API erfordert meistens, dass length (height) >= width ist
    if (width > height) {
      const temp = width;
      width = height;
      height = temp;
    }

    const totalQty = item.print_quantity * item.cart_quantity;

    // Deep Link für Pricing bauen
    let pricingLink = '';
    if (product && product.baseLink) {
      pricingLink = product.baseLink
        .replace(/depvar_qty=\d+/, `depvar_qty=${totalQty}`)
        .replace('{{quantity}}', totalQty).replace('{{qty}}', totalQty);
      const matObj = MATERIALS.find(m => m.label === item.material) || MATERIALS[0];
      if (matObj && matObj.code) {
        pricingLink = pricingLink.replace(/\.AK3\.1X10/g, matObj.code);
      }
      if (product.opCode) {
        pricingLink += `&ws_areaproduct_width_${product.opCode}=${width}&ws_areaproduct_length_${product.opCode}=${height}`;
      }
    } else {
      pricingLink = `https://www.onlineprinters.de/p/runde-aufkleber-im-freiformat?depvar_index_setparent=%3cP8AFFXX%3e%3cP8AFFXX.AK3.1X10%3e&depvar_qty=${totalQty}&depvar_index_set_1=%3cZ8AFFA3S%3e%3cZ8AFFA3SX99%3e&depvar_index_set_2=%3cZXXXXX2D%3e%3cZXXXXX2DD00%3e&depvar_index_set_3=%3cZ7AFFA3Y%3e%3cZ7AFFA3YY34%3e&ws_areaproduct_width_P8AFFXX=${width}&ws_areaproduct_length_P8AFFXX=${height}`;
    }

    // SKUs via Pricing-Endpoint holen
    btn.textContent = `SKUs werden abgerufen (${mappedItems.length + 1}/${order.order_items.length})...`;
    let articles = [];
    try {
      const { data: pricingData, error: pricingError } = await db.functions.invoke('onlineprinters/pricing', {
        body: { country: 'DEU', articleDeepLink: pricingLink }
      });
      if (!pricingError && pricingData?.articles?.length > 0) {
        articles = pricingData.articles;
      }
    } catch (e) {
      console.warn('Pricing fetch for SKU failed:', e);
    }

    if (articles.length > 0) {
      // ALLE Artikel (Hauptprodukt + Zuschnitt + Ecken + Datencheck + Produktionszeit) übergeben
      articles.forEach((art, index) => {
        const itemObj = {
          product: {
            sku: art.product.sku,
            descriptions: art.product.descriptions || [item.product_name]
          },
          quantity: totalQty
        };
        // Nur das erste Artikel-Objekt (Hauptprodukt) bekommt die Freiformat-Breite/Länge
        if (index === 0) {
          itemObj.product.properties = [
            { key: 'width', value: String(width) },
            { key: 'length', value: String(height) }
          ];
        }
        mappedItems.push(itemObj);
      });
    } else {
      // Fallback
      const opCode = product?.opCode || 'P8AFFXX';
      mappedItems.push({
        product: {
          sku: item.sku || `<${opCode}><${opCode}.AK3.1X10>`,
          descriptions: [item.product_name, `Größe: ${item.size_label}`],
          properties: [
            { key: 'width', value: String(width) },
            { key: 'length', value: String(height) }
          ]
        },
        quantity: totalQty
      });
    }
  }

  // Helper: Entfernt leere Strings aus einem Objekt
  const cleanAddress = (addr) => {
    return Object.fromEntries(Object.entries(addr).filter(([_, v]) => v !== "" && v !== null && v !== undefined));
  };

  const deliveryAddr = cleanAddress({
    companyName: (order.delivery_company || 'Privat').substring(0, 30),
    firstName: (order.delivery_first_name || order.guest_first_name || "Kunde").substring(0, 30),
    lastName: (order.delivery_last_name || order.guest_last_name || order.id.slice(0,6)).substring(0, 30),
    street: ([order.delivery_street, order.delivery_street_nr].filter(Boolean).join(' ') || "Unbekannte Straße 1").substring(0, 30),
    zipCode: (order.delivery_zip || "00000").substring(0, 8),
    city: (order.delivery_city || "Unbekannt").substring(0, 24),
    countryCode: 'DEU',
    phone: (order.delivery_phone || '+49000000000').substring(0, 21),
    email: order.delivery_email || order.guest_email || "no-reply@stickiverse.de"
  });

  const returnAddr = {
    companyName: "Stickiverse",
    firstName: "Emre",
    lastName: "Kocak",
    street: "Musterstraße 12",
    zipCode: "10115", 
    city: "Berlin",
    countryCode: "DEU",
    phone: "+49123456789",
    email: "support@stickiverse.de"
  };

  // 2. Job-Daten strukturieren (laut API: deliveries, items, comment)
  const jobData = {
    deliveries: [
      {
        quantity: order.order_items.reduce((s, i) => s + (i.print_quantity * i.cart_quantity), 0),
        deliveryAddress: deliveryAddr,
        returnAddress: returnAddr,
        shippingService: order.shipping_method === 'express' ? 'express' : 'standard'
      }
    ],
    items: mappedItems,
    comment: (`op.connect test ${order.order_number}`).substring(0, 50)
  };

  // 3. Print-Dateien extrahieren
  const printFiles = order.order_items
    .filter(item => item.preview_image && (item.preview_image.startsWith('http') || item.preview_image.startsWith('data:')))
    .map(item => ({
      url: item.preview_image,
      filename: `${item.id}.png` // Dateiname muss mit customerReference des Items übereinstimmen laut OP Doku
    }));

  console.log('[OP-Debug] Final jobData being sent:', JSON.stringify(jobData, null, 2));

  try {
    // 4. Supabase Edge Function aufrufen
    const { data, error } = await db.functions.invoke('onlineprinters/order', {
      body: {
        jobData: jobData,
        printFiles: printFiles
      }
    });

    if (error) {
      console.error("Edge function returned an error:", error);
      let detail = error.message;
      if (error.context) {
        try {
          const errData = await error.context.json();
          console.error("Onlineprinters API details:", errData);
          detail = JSON.stringify(errData, null, 2);
        } catch(e) {}
      }
      throw new Error(detail);
    }

    if (data && data.error) {
      console.error("Onlineprinters returned error data:", data);
      throw new Error(JSON.stringify(data.error));
    }

    showToast('Bestellung erfolgreich an Onlineprinters übermittelt! 🚀', 'success');
    btn.textContent = 'An Onlineprinters gesendet';
    btn.className = 'btn btn--ghost btn--sm';
    btn.disabled = true;

    // Status im System auf 'in_production' setzen
    await updateOrderStatus(orderId, 'in_production');

  } catch (err) {
    console.error('API Transmission failed:', err);
    if (err.message.includes('ERROR_ORDER_PAYMENT') || err.message.includes('Payment') || err.message.includes('402')) {
      showToast('⚡ Produkt-Konfiguration 100% GÜLTIG! Es fehlt nur noch die Zahlungsfreischaltung deines API-Keys bei Onlineprinters.', 'info');
    btn.disabled = false;
    btn.textContent = 'An Onlineprinters senden';

    // UI-Dump für Debugging
    const debugDiv = document.createElement('div');
    debugDiv.style.marginTop = '1rem';
    debugDiv.innerHTML = `
      <p class="text-sm text-red-600 mb-2"><b>Entwickler-Info:</b> Payload, die zu diesem Fehler geführt hat:</p>
      <textarea readonly class="input" style="width:100%; height:150px; font-family:monospace; font-size:11px;">${JSON.stringify(jobData, null, 2)}</textarea>
    `;
    btn.parentNode.appendChild(debugDiv);
  }
}

function showPage(pageId) {
  document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
  
  const pageEl = document.getElementById(`page-${pageId}`);
  if (pageEl) pageEl.classList.add('active');

  const navEl = document.getElementById(`nav-${pageId}`);
  if (navEl) navEl.classList.add('active');

  const titles = {
    'dashboard': 'Dashboard',
    'orders': 'Bestellungen',
    'customers': 'Kunden',
    'products': 'Produkte & Preise',
    'settings': 'Einstellungen',
    'coupons': 'Gutscheincodes'
  };
  document.getElementById('topbarTitle').textContent = titles[pageId] || 'Dashboard';
  
  if (pageId === 'products') {
    loadMargin();
  } else if (pageId === 'coupons') {
    loadCoupons();
  }
}

async function loadMargin() {
  try {
    const { data, error } = await db.client.from('store_settings').select('value').eq('id', 'pricing_margin').single();
    if (data && !error) {
      document.getElementById('pricingMarginInput').value = data.value.toFixed(2);
    }
  } catch (e) {
    console.warn('Could not load margin setting', e);
  }
}

async function saveMargin() {
  const btn = document.getElementById('saveMarginBtn');
  const val = parseFloat(document.getElementById('pricingMarginInput').value);
  
  if (isNaN(val) || val < 1.0) {
    showToast('Ungültige Marge', 'error');
    return;
  }
  
  btn.textContent = 'Speichert...';
  btn.disabled = true;
  
  try {
    const { error } = await db.client.from('store_settings').upsert({
      id: 'pricing_margin',
      value: val,
      description: 'Aufschlag auf den Onlineprinters-Einkaufspreis'
    });
    
    if (error) throw error;
    showToast('Marge erfolgreich gespeichert!', 'success');
  } catch (e) {
    console.error(e);
    showToast('Fehler beim Speichern: ' + e.message, 'error');
  } finally {
    btn.textContent = 'Speichern';
    btn.disabled = false;
  }
}



// ── Page Navigation ───────────────────────
const pageTitles = {
  dashboard: '📊 Dashboard',
  orders: 'Bestellungen',
  customers: '👥 Kunden',
  products: 'Produkte',
  settings: '⚙️ Einstellungen',
};

function showPage(page) {
  document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
  document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
  document.getElementById('topbarTitle').textContent = pageTitles[page] || page;

  if (page === 'orders') {
    const allTable = document.getElementById('allOrdersTable');
    if (allTable) {
      const style = window.getComputedStyle(allTable);
      console.log("🛠️ [Debug-Admin] allOrdersTable Höhe nach Seitenwechsel (px):", allTable.offsetHeight);
      console.log("🛠️ [Debug-Admin] allOrdersTable parentNode:", allTable.parentNode.outerHTML.slice(0, 300));
    }
  }
}

// ── Logout ────────────────────────────────
async function handleLogout() {
  await db.auth.signOut();
  window.location.reload();
}

// ==========================================
// COUPON MANAGEMENT
// ==========================================

async function loadCoupons() {
  const tbody = document.getElementById('couponsTableBody');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">Lade Gutscheine...</td></tr>';
  
  try {
    const { data, error } = await db.client.from('coupons').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    
    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: rgba(255,255,255,0.4);">Keine Gutscheine gefunden.</td></tr>';
      return;
    }
    
    tbody.innerHTML = data.map(c => {
      const typeLabel = c.type === 'percentage' ? c.value + '%' : c.value.toFixed(2) + ' €';
      const limitLabel = c.usage_limit ? `${c.usage_count} / ${c.usage_limit}` : `${c.usage_count} / ∞`;
      const statusBadge = c.is_active ? '<span class="status-badge status-badge--success">Aktiv</span>' : '<span class="status-badge status-badge--error">Inaktiv</span>';
      
      return `
        <tr>
          <td><strong>${c.code}</strong></td>
          <td>${c.type === 'percentage' ? 'Prozentual' : 'Festbetrag'}</td>
          <td>${typeLabel}</td>
          <td>${limitLabel}</td>
          <td>${c.usage_count} eingelöst</td>
          <td>${statusBadge}</td>
          <td>
            <div style="display:flex; gap:8px;">
              <button class="btn btn--sm" style="padding:4px 8px;" onclick="toggleCouponStatus('${c.id}', ${!c.is_active})">
                ${c.is_active ? 'Deaktivieren' : 'Aktivieren'}
              </button>
              <button class="btn btn--sm btn--danger" style="padding:4px 8px; background:rgba(239, 68, 68, 0.1); color:#EF4444;" onclick="deleteCoupon('${c.id}')">
                Löschen
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: red;">Fehler beim Laden der Gutscheine.</td></tr>';
  }
}

function openCouponModal() {
  document.getElementById('couponForm').reset();
  toggleMaxDiscount();
  document.getElementById('couponModalOverlay').classList.add('show');
}

function closeCouponModal() {
  document.getElementById('couponModalOverlay').classList.remove('show');
}

function toggleMaxDiscount() {
  const type = document.getElementById('couponType').value;
  document.getElementById('maxDiscountContainer').style.display = type === 'percentage' ? 'block' : 'none';
}

async function handleCreateCoupon(e) {
  e.preventDefault();
  const code = document.getElementById('couponCode').value.toUpperCase().trim();
  const type = document.getElementById('couponType').value;
  const value = parseFloat(document.getElementById('couponValue').value);
  const max_discount = document.getElementById('couponMaxDiscount').value ? parseFloat(document.getElementById('couponMaxDiscount').value) : null;
  const usage_limit = document.getElementById('couponLimit').value ? parseInt(document.getElementById('couponLimit').value) : null;
  const expires_at = document.getElementById('couponExpiry').value ? new Date(document.getElementById('couponExpiry').value).toISOString() : null;

  try {
    const { error } = await db.client.from('coupons').insert([{
      code, type, value, max_discount, usage_limit, expires_at
    }]);
    
    if (error) {
      if (error.code === '23505') showToast('Code existiert bereits!', 'error');
      else throw error;
      return;
    }
    
    showToast('Gutschein erstellt!', 'success');
    closeCouponModal();
    loadCoupons();
  } catch (err) {
    console.error(err);
    showToast('Fehler beim Erstellen', 'error');
  }
}

async function toggleCouponStatus(id, newStatus) {
  try {
    const { error } = await db.client.from('coupons').update({ is_active: newStatus }).eq('id', id);
    if (error) throw error;
    showToast('Status aktualisiert', 'success');
    loadCoupons();
  } catch (err) {
    console.error(err);
    showToast('Fehler beim Update', 'error');
  }
}

async function deleteCoupon(id) {
  if (!confirm('Soll dieser Gutschein wirklich gelöscht werden?')) return;
  try {
    const { error } = await db.client.from('coupons').delete().eq('id', id);
    if (error) throw error;
    showToast('Gutschein gelöscht', 'success');
    loadCoupons();
  } catch (err) {
    console.error(err);
    showToast('Fehler beim Löschen', 'error');
  }
}

// ── Routing ──
document.addEventListener('DOMContentLoaded', () => {initAdmin();});
