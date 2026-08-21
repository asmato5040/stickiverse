import re

def update_product_detail():
    filepath = '/Users/emrekocak/.gemini/antigravity/scratch/stickiverse/product-detail.html'
    with open(filepath, 'r') as f:
        content = f.read()

    js_code_to_insert = """
    function renderMaterials() {
      const grid = document.getElementById('materialGrid');
      grid.innerHTML = MATERIALS.map(m => `
        <div class="material-card ${m.id === selectedMaterial.id ? 'active' : ''}" data-material-id="${m.id}">
          <div class="material-name">${m.label.split(',')[1] ? m.label.split(',')[1].trim() : m.label}</div>
          <div class="material-desc">${m.label.split(',')[0]}</div>
        </div>
      `).join('');
      
      const cards = document.querySelectorAll('.material-card');
      cards.forEach(card => {
        card.addEventListener('click', () => {
          cards.forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          const matId = card.dataset.materialId;
          selectedMaterial = MATERIALS.find(m => m.id === matId) || MATERIALS[0];
          calculatePrice();
        });
      });
    }

    async function calculatePrice() {
      // Preis aus js/products.js holen (LIVE von API)
      let priceInfo = await getLivePriceDetails(product.id, selectedSize, selectedQty, selectedMaterial.code);
      let price = priceInfo.price;
      
      // Aufpreis für Holografisch (15%) - falls wir Holografisch als Fallback haben
      if (selectedMaterial.id === 'holographic') {
        price = price * 1.15;
      }

      totalPrice = price;
      const unitPrice = price / selectedQty;

      document.getElementById('priceTotal').textContent = formatPrice(totalPrice);
      document.getElementById('priceUnit').textContent = `${formatPrice(unitPrice)} / Stück`;
    }
"""

    # First, fix setupMaterialSelector to renderMaterials
    content = re.sub(
        r"function setupMaterialSelector\(\) \{[\s\S]*?\}\n\n    function calculatePrice\(\) \{[\s\S]*?\}",
        js_code_to_insert,
        content
    )
    
    # Also update the DOMContentLoaded variables
    content = content.replace("let selectedMaterial = 'Hochglanz-Folie';", "let selectedMaterial = MATERIALS[0];")
    content = content.replace("setupMaterialSelector();", "renderMaterials();")
    
    # And update addToCart to use selectedMaterial.label
    content = content.replace("material: selectedMaterial,", "material: selectedMaterial.label,")
    content = content.replace("material=${encodeURIComponent(selectedMaterial)}", "material=${encodeURIComponent(selectedMaterial.label)}")

    with open(filepath, 'w') as f:
        f.write(content)

update_product_detail()
