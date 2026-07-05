// ============================================================
// SHOP PAGE FUNCTIONALITY
// ============================================================

// ── FILTER STATE ────────────────────────────────────────
const filterState = {
  search: '',
  type: 'all',
  price: 'all',
  stock: 'all',
  sales: 'all',
  sort: 'default'
};



// ── HELPER: PARSE PRICE ─────────────────────────────────
function parsePrice(priceStr) {
  return parseFloat(priceStr.replace('₱', ''));
}

// ── HELPER: CHECK PRICE RANGE ──────────────────────────
function isPriceInRange(price, rangeFilter) {
  const p = parsePrice(price);
  switch (rangeFilter) {
    case 'under-100':
      return p < 100;
    case '100-150':
      return p >= 100 && p < 150;
    case '150-200':
      return p >= 150 && p < 200;
    case 'above-200':
      return p >= 200;
    default:
      return true;
  }
}

// ── SHOP PAGE INIT ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Redirect if not logged in
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  // Display user greeting
  const shopGreeting = document.getElementById('shopGreeting');
  if (shopGreeting) {
    shopGreeting.textContent = `Welcome back, ${user.name}! Explore our exclusive eyewear collection.`;
  }

  const userGreeting = document.getElementById('userGreeting');
  if (userGreeting) {
    userGreeting.style.display = 'inline';
    userGreeting.textContent = `👤 ${user.name}`;
  }

  // Render all products initially
  renderShopProducts();
  updateCartBadge();
  setupHamburger();

  // Close modal when clicking outside
  window.onclick = function(event) {
    const modal = document.getElementById('cartModal');
    if (event.target === modal) {
      closeCartModal();
    }
  };
});

// ── APPLY FILTERS ───────────────────────────────────────
function applyFilters() {
  filterState.search = document.getElementById('searchInput').value.toLowerCase();
  filterState.type = document.getElementById('typeSelect').value;
  filterState.price = document.getElementById('priceSelect').value;
  filterState.stock = document.getElementById('stockSelect').value;
  filterState.sales = document.getElementById('saleSelect').value;
  filterState.sort = document.getElementById('sortSelect').value;

  renderShopProducts();
}

// ── GET FILTERED PRODUCTS ───────────────────────────────
function getFilteredProducts() {
  const currentProducts = JSON.parse(localStorage.getItem('products')) || PRODUCTS;
  return currentProducts.filter(product => {
    // Search filter
    if (filterState.search !== '') {
      const searchTerm = filterState.search;
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm) ||
        product.desc.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm);
      
      if (!matchesSearch) {
        return false;
      }
    }

    // Type filter
    if (filterState.type !== 'all' && product.filter !== filterState.type) {
      return false;
    }

    // Price filter
    if (filterState.price !== 'all' && !isPriceInRange(product.price, filterState.price)) {
      return false;
    }

    // Stock filter
    if (filterState.stock !== 'all') {
      const stock = productStock[product.id];
      const isOutOfStock = !stock.inStock || stock.limit <= 0;
      if (filterState.stock === 'in-stock' && isOutOfStock) {
        return false;
      }
      if (filterState.stock === 'out-of-stock' && !isOutOfStock) {
        return false;
      }
    }

    // Sales filter
    if (filterState.sales !== 'all') {
      const isOnSale = product.badge === 'sale';
      if (filterState.sales === 'on-sale' && !isOnSale) {
        return false;
      }
      if (filterState.sales === 'no-sale' && isOnSale) {
        return false;
      }
    }

    return true;
  });
}

// ── SHOP PRODUCT RENDERING ──────────────────────────────
function renderShopProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  const filtered = getFilteredProducts();

  // Apply sorting based on user selection
  if (filterState.sort === 'price-low') {
    filtered.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
  } else if (filterState.sort === 'price-high') {
    filtered.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
  } else if (filterState.sort === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="no-products"><p>No products found matching your filters.</p></div>';
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const stock = productStock[p.id];
    const isOutOfStock = !stock.inStock || stock.limit <= 0;
    const stockClass = isOutOfStock ? 'out-of-stock' : '';

    return `
      <div class="product-card ${stockClass}">
        <div class="product-image">
          ${p.image ? `<img src="${p.image}" alt="${p.name}">` : '<div class="placeholder-image">No Image</div>'}
          ${p.badge ? `<span class="product-badge product-badge-${p.badge}">${p.badgeLabel}</span>` : ''}
          ${isOutOfStock ? `<span class="product-badge product-badge-stock">Out of Stock</span>` : ''}
        </div>
        <div class="product-info">
          <div class="product-meta-row">
            <span class="product-category">${p.category}</span>
            <div class="product-rating">
              <span class="stars">${'⭐'.repeat(Math.floor(p.rating))}</span>
              <span class="rating-text">${p.rating} (${p.reviews})</span>
            </div>
          </div>
          <h3 class="product-name">${p.name}</h3>
          <p class="product-description">${p.desc}</p>
          <div class="product-footer">
            <div class="product-price-section">
              <span class="product-price">${p.price}</span>
              ${p.originalPrice ? `<span class="product-price-original">${p.originalPrice}</span>` : ''}
            </div>
            <button class="btn-add-to-cart" onclick="openCartModal(${p.id})" ${isOutOfStock ? 'disabled' : ''}>
              ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}


