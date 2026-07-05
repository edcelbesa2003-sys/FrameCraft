/* ============================================================
   FRAMECRAFT — admin.js
   ============================================================ */

// ── INITIAL SYSTEM VERIFICATION ──────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // Check role authentication
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || user.role !== 'admin') {
    window.location.href = 'index.html';
    return;
  }

  // Set greeting name
  const greeting = document.getElementById('adminGreetingName');
  if (greeting) {
    greeting.textContent = user.name;
  }

  // Setup tab listeners
  setupTabNavigation();
  
  // Setup image upload drag-and-drop
  setupImageUploadEvents();
  
  // Render active data
  refreshDashboard();
});

// ── TAB SYSTEM ───────────────────────────────────────────────
function setupTabNavigation() {
  const tabs = document.querySelectorAll(".nav-item");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      
      const targetTab = tab.dataset.tab;
      switchTab(targetTab);
    });
  });
}

function switchTab(tabId) {
  // Show section
  const sections = document.querySelectorAll(".admin-section");
  sections.forEach(sec => sec.classList.remove("active"));
  document.getElementById(`tab-${tabId}`).classList.add("active");
  
  // Update sidebar active buttons in case of programmatically triggered switches
  const navBtns = document.querySelectorAll(".nav-item");
  navBtns.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tabId);
  });

  // Load specific tab data
  if (tabId === 'overview') refreshDashboard();
  else if (tabId === 'users') renderUsers();
  else if (tabId === 'catalog') renderCatalog();
  else if (tabId === 'orders') renderOrders();
  else if (tabId === 'coupons') renderCoupons();
}

// ── ANALYTICS & REFRESH ──────────────────────────────────────
function refreshDashboard() {
  const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
  const products = JSON.parse(localStorage.getItem('products') || '[]');
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  
  // Calculate active sales
  const salesCount = products.filter(p => p.originalPrice || p.badge === 'sale').length;

  // Set values
  document.getElementById('kpi-total-users').textContent = accounts.length;
  document.getElementById('kpi-total-catalog').textContent = products.length;
  document.getElementById('kpi-total-orders').textContent = orders.length;
  document.getElementById('kpi-total-sales').textContent = salesCount;
}

// ── USER ACCOUNTS MANAGEMENT ─────────────────────────────────
function renderUsers() {
  const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
  const searchQuery = document.getElementById('searchUsersInput').value.toLowerCase().trim();
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  const filtered = accounts.filter(acc => {
    return acc.name.toLowerCase().includes(searchQuery) ||
           acc.email.toLowerCase().includes(searchQuery) ||
           (acc.role || 'user').toLowerCase().includes(searchQuery);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-secondary);padding:40px;">No accounts found.</td></tr>`;
    return;
  }

  filtered.forEach((acc, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <strong style="display:block;font-size:14.5px;">${acc.name}</strong>
        <span style="font-size:11.5px;color:var(--text-muted);">Registered Profile</span>
      </td>
      <td><span style="font-family:monospace;font-size:13px;">${acc.email}</span></td>
      <td><span class="badge-role ${acc.role || 'user'}">${(acc.role || 'user').toUpperCase()}</span></td>
      <td><span style="color:var(--text-secondary);">${acc.joinDate || 'N/A'}</span></td>
      <td>
        <button class="btn btn-secondary btn-small" onclick="editUserAccount('${acc.email}')">Edit</button>
        <button class="btn btn-danger-outline btn-small" onclick="deleteUserAccount('${acc.email}')" ${acc.role === 'admin' && acc.email === 'admin@framecraft.com' ? 'disabled' : ''}>Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openAddUserModal() {
  document.getElementById('userModalTitle').textContent = 'Add Account';
  document.getElementById('userForm').reset();
  document.getElementById('editUserIndex').value = '';
  document.getElementById('editUserEmail').value = '';
  document.getElementById('emailFormGroup').style.display = 'flex';
  document.getElementById('userEmailInput').required = true;
  
  document.getElementById('userModal').classList.add('show');
}

function editUserAccount(email) {
  const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
  const account = accounts.find(a => a.email === email);
  if (!account) return;

  document.getElementById('userModalTitle').textContent = 'Edit Account Details';
  document.getElementById('editUserEmail').value = account.email;
  document.getElementById('userNameInput').value = account.name;
  document.getElementById('userPasswordInput').value = account.password;
  document.getElementById('userRoleInput').value = account.role || 'user';
  
  // Hide email field since it is the key identity
  document.getElementById('emailFormGroup').style.display = 'none';
  document.getElementById('userEmailInput').required = false;

  document.getElementById('userModal').classList.add('show');
}

function closeUserModal() {
  document.getElementById('userModal').classList.remove('show');
}

function saveUserAccount(e) {
  e.preventDefault();
  const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
  
  const editEmail = document.getElementById('editUserEmail').value;
  const name = document.getElementById('userNameInput').value.trim();
  const password = document.getElementById('userPasswordInput').value;
  const role = document.getElementById('userRoleInput').value;

  if (editEmail) {
    // Edit Mode
    const idx = accounts.findIndex(a => a.email === editEmail);
    if (idx !== -1) {
      accounts[idx].name = name;
      accounts[idx].password = password;
      accounts[idx].role = role;
      
      // Update session if editing self
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (currentUser && currentUser.email === editEmail) {
        currentUser.name = name;
        currentUser.role = role;
        localStorage.setItem('user', JSON.stringify(currentUser));
        document.getElementById('adminGreetingName').textContent = name;
      }
    }
  } else {
    // Add Mode
    const email = document.getElementById('userEmailInput').value.trim();
    if (accounts.some(a => a.email.toLowerCase() === email.toLowerCase())) {
      showToast('Account with this email already exists!', 'error');
      return;
    }
    accounts.push({
      name,
      email,
      password,
      role,
      joinDate: new Date().toLocaleDateString()
    });
  }

  localStorage.setItem('accounts', JSON.stringify(accounts));
  closeUserModal();
  showToast('Account saved successfully!', 'success');
  renderUsers();
}

function deleteUserAccount(email) {
  const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
  const currentUser = JSON.parse(localStorage.getItem('user'));
  
  if (currentUser && currentUser.email === email) {
    showToast('You cannot delete your own account while logged in!', 'error');
    return;
  }

  if (confirm(`Are you sure you want to delete user account: ${email}?`)) {
    const filtered = accounts.filter(a => a.email !== email);
    localStorage.setItem('accounts', JSON.stringify(filtered));
    showToast('Account deleted successfully', 'success');
    renderUsers();
  }
}

// ── CATALOG & PRODUCTS MANAGEMENT ───────────────────────────
function renderCatalog() {
  const products = JSON.parse(localStorage.getItem('products') || '[]');
  const search = document.getElementById('searchCatalogInput').value.toLowerCase().trim();
  const categoryFilter = document.getElementById('filterCategorySelect').value;
  const container = document.getElementById('catalogContainer');
  if (!container) return;

  container.innerHTML = '';

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search) || 
                          p.category.toLowerCase().includes(search) || 
                          (p.badgeLabel || '').toLowerCase().includes(search);
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="grid-column: 1 / -1; text-align:center; color:var(--text-secondary); padding: 40px;">No product items found matching criteria.</div>`;
    return;
  }

  filtered.forEach(p => {
    const badgeHTML = p.badge 
      ? `<span class="catalog-badge ${p.badge}">${p.badgeLabel || p.badge}</span>` 
      : '';
    const origHTML = p.originalPrice 
      ? `<span class="original-price">₱${p.originalPrice}</span>` 
      : '';

    const priceDisplay = typeof p.price === 'string' && p.price.startsWith('₱') ? p.price : `₱${p.price}`;
    const stock = productStock[p.id];
    const isOutOfStock = !stock.inStock || stock.limit <= 0;
    const stockStatusHTML = isOutOfStock 
      ? `<span class="stock-badge out-of-stock">Out of Stock</span>`
      : `<span class="stock-badge in-stock">${stock.limit} in stock</span>`;

    const card = document.createElement('div');
    card.className = isOutOfStock ? 'catalog-item-card out-of-stock' : 'catalog-item-card';
    card.innerHTML = `
      <div class="catalog-item-image">
        ${badgeHTML}
        ${p.image ? `<img src="${p.image}" alt="${p.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%230088ee\'%3E%3Ccircle cx=\'12\' cy=\'8\' r=\'4\'/%3E%3C/svg%3E'">` : '<div style="font-size:36px;">🕶️</div>'}
      </div>
      <div class="catalog-item-info">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span style="font-size:11px;font-weight:700;color:var(--blue);text-transform:uppercase;margin:0;">${p.category}</span>
          ${stockStatusHTML}
        </div>
        <h4>${p.name}</h4>
        <p>${p.desc}</p>
        <div class="price-row">
          <span class="current-price">${priceDisplay}</span>
          ${origHTML}
        </div>
        <div class="card-actions">
          <button class="btn btn-secondary btn-small" onclick="editProductItem(${p.id})">Edit</button>
          <button class="btn btn-danger-outline btn-small" onclick="deleteProductItem(${p.id})">Delete</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function openAddProductModal() {
  document.getElementById('productModalTitle').textContent = 'Add Eyeglasses Frame';
  document.getElementById('productForm').reset();
  document.getElementById('editProductId').value = '';
  document.getElementById('prodStockLimit').value = 10;
  document.getElementById('prodInStock').checked = true;
  
  // Reset image upload preview zone
  const imagePreview = document.getElementById('imagePreview');
  const btnRemove = document.getElementById('btnRemoveImage');
  const dragZone = document.getElementById('imageDragZone');
  const hiddenInput = document.getElementById('prodImage');
  if (imagePreview && btnRemove && dragZone) {
    hiddenInput.value = '';
    imagePreview.removeAttribute('src');
    imagePreview.style.display = 'none';
    btnRemove.style.display = 'none';
    const contentPlaceholder = dragZone.querySelector('.drag-zone-content');
    if (contentPlaceholder) contentPlaceholder.style.display = 'flex';
  }

  document.getElementById('productModal').classList.add('show');
}

function editProductItem(id) {
  const products = JSON.parse(localStorage.getItem('products') || '[]');
  const p = products.find(prod => prod.id === id);
  if (!p) return;

  document.getElementById('productModalTitle').textContent = 'Edit Product Details';
  document.getElementById('editProductId').value = p.id;
  document.getElementById('prodName').value = p.name;
  document.getElementById('prodCategory').value = p.category;
  
  // Strip ₱ currency symbol for editable inputs
  document.getElementById('prodPrice').value = typeof p.price === 'string' ? p.price.replace('₱', '') : p.price;
  document.getElementById('prodOriginalPrice').value = p.originalPrice ? (typeof p.originalPrice === 'string' ? p.originalPrice.replace('₱', '') : p.originalPrice) : '';
  
  document.getElementById('prodBadge').value = p.badge || '';
  document.getElementById('prodBadgeLabel').value = p.badgeLabel || '';
  document.getElementById('prodDesc').value = p.desc;
  
  // Load and show Image Preview if image exists
  const hiddenInput = document.getElementById('prodImage');
  const imagePreview = document.getElementById('imagePreview');
  const btnRemove = document.getElementById('btnRemoveImage');
  const dragZone = document.getElementById('imageDragZone');
  
  hiddenInput.value = p.image || '';
  if (p.image && imagePreview && btnRemove && dragZone) {
    imagePreview.src = p.image;
    imagePreview.style.display = 'block';
    btnRemove.style.display = 'flex';
    const contentPlaceholder = dragZone.querySelector('.drag-zone-content');
    if (contentPlaceholder) contentPlaceholder.style.display = 'none';
  } else if (imagePreview && btnRemove && dragZone) {
    imagePreview.removeAttribute('src');
    imagePreview.style.display = 'none';
    btnRemove.style.display = 'none';
    const contentPlaceholder = dragZone.querySelector('.drag-zone-content');
    if (contentPlaceholder) contentPlaceholder.style.display = 'flex';
  }

  document.getElementById('prodRating').value = p.rating || 4.8;
  document.getElementById('prodReviews').value = p.reviews || 120;

  const stock = productStock[p.id];
  document.getElementById('prodStockLimit').value = stock.limit;
  document.getElementById('prodInStock').checked = stock.inStock;

  document.getElementById('productModal').classList.add('show');
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('show');
}

function updateBadgeLabel() {
  const badgeVal = document.getElementById('prodBadge').value;
  const labelInput = document.getElementById('prodBadgeLabel');
  if (badgeVal === 'sale') labelInput.value = 'Sale';
  else if (badgeVal === 'new') labelInput.value = 'New';
  else if (badgeVal === 'hot') labelInput.value = 'Hot';
  else if (badgeVal === 'luxury') labelInput.value = 'Luxury';
  else if (badgeVal === 'trending') labelInput.value = 'Trending';
  else labelInput.value = '';
}

function saveProductItem(e) {
  e.preventDefault();
  const products = JSON.parse(localStorage.getItem('products') || '[]');
  
  const editId = document.getElementById('editProductId').value;
  const name = document.getElementById('prodName').value.trim();
  const category = document.getElementById('prodCategory').value;
  const price = '₱' + parseFloat(document.getElementById('prodPrice').value).toFixed(2);
  
  const originalPriceVal = document.getElementById('prodOriginalPrice').value;
  const originalPrice = originalPriceVal ? '₱' + parseFloat(originalPriceVal).toFixed(2) : null;
  
  const badge = document.getElementById('prodBadge').value;
  const badgeLabel = document.getElementById('prodBadgeLabel').value.trim();
  const desc = document.getElementById('prodDesc').value.trim();
  const image = document.getElementById('prodImage').value.trim();
  const rating = parseFloat(document.getElementById('prodRating').value) || 4.8;
  const reviews = parseInt(document.getElementById('prodReviews').value) || 120;

  const stockLimit = parseInt(document.getElementById('prodStockLimit').value) || 0;
  let inStock = document.getElementById('prodInStock').checked;
  if (stockLimit <= 0) {
    inStock = false;
  }

  if (editId) {
    // Edit mode
    const idx = products.findIndex(p => p.id === parseInt(editId));
    if (idx !== -1) {
      products[idx] = {
        ...products[idx],
        name, category, filter: category.toLowerCase().replace(' ', '-'),
        price, originalPrice, badge, badgeLabel, desc, image, rating, reviews
      };
      productStock[parseInt(editId)] = { inStock, limit: stockLimit };
    }
  } else {
    // Add mode
    const maxId = products.reduce((max, p) => p.id > max ? p.id : max, 0);
    const newId = maxId + 1;
    products.push({
      id: newId,
      name, category, filter: category.toLowerCase().replace(' ', '-'),
      price, originalPrice, badge, badgeLabel, desc, image, rating, reviews,
      colors: ['#1c2b3a', '#b8860b'], // default placeholders
      gradient: ['#e8eff8', '#d0dff0'],
      svgType: category.toLowerCase().replace(' ', '-')
    });
    productStock[newId] = { inStock, limit: stockLimit };
  }

  localStorage.setItem('products', JSON.stringify(products));
  closeProductModal();
  showToast('Eyeglasses catalog updated!', 'success');
  renderCatalog();
}

function deleteProductItem(id) {
  if (confirm('Are you sure you want to delete this eyeglasses frame from the catalog?')) {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem('products', JSON.stringify(filtered));
    delete productStock[id];
    showToast('Product deleted from catalog', 'success');
    renderCatalog();
  }
}

// ── ORDER TRACKING & APPROVALS ──────────────────────────────
function renderOrders() {
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const search = document.getElementById('searchOrdersInput').value.toLowerCase().trim();
  const tbody = document.getElementById('ordersTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  const filtered = orders.filter(o => {
    return o.orderId.toLowerCase().includes(search) ||
           o.delivery.fullName.toLowerCase().includes(search) ||
           o.delivery.phone.includes(search) ||
           o.delivery.city.toLowerCase().includes(search);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-secondary);padding:40px;">No user orders found.</td></tr>`;
    return;
  }

  // Render orders descending (newest first)
  filtered.reverse().forEach(o => {
    const formattedDate = new Date(o.timestamp).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    let itemsSummary = '1x Custom Selection';
    if (o.items && Array.isArray(o.items)) {
      itemsSummary = o.items.map(it => `${it.quantity || it.qty || 1}x ${(it.name || 'Frame').split(' (')[0]}`).join(', ');
    } else if (o.items && typeof o.items === 'string') {
      itemsSummary = o.items;
    }

    const totalCost = o.summary ? o.summary.total : 0;
    const totalDisplay = `₱${totalCost.toLocaleString()}`;
    const status = o.status || 'Order Placed';

    // Check if order is approved/confirmed or waiting
    const isUnconfirmed = o.isConfirmed === false;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <strong style="color:var(--blue);font-family:monospace;font-size:14px;">${o.orderId}</strong>
        <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${formattedDate}</div>
      </td>
      <td>
        <strong style="display:block;">${o.delivery.fullName}</strong>
        <span style="font-size:12px;color:var(--text-secondary);">${o.delivery.city}, ${o.delivery.state} • ☎️ ${o.delivery.phone}</span>
      </td>
      <td>
        <div style="font-size:13px;max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${itemsSummary}">${itemsSummary}</div>
      </td>
      <td><strong style="color:var(--text-primary);">${totalDisplay}</strong></td>
      <td>
        <select class="status-update-select" onchange="changeOrderStatus('${o.orderId}', this.value)" ${isUnconfirmed ? 'disabled' : ''}>
          <option value="Order Placed" ${status === 'Order Placed' ? 'selected' : ''}>🛒 Placed</option>
          <option value="Pending" ${status === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
          <option value="Out for Delivery" ${status === 'Out for Delivery' ? 'selected' : ''}>🚚 In Transit</option>
          <option value="Failed Attempt" ${status === 'Failed Attempt' ? 'selected' : ''}>⚠️ Failed Attempt</option>
          <option value="Cancelled" ${status === 'Cancelled' ? 'selected' : ''}>❌ Cancelled</option>
          <option value="Delivered" ${status === 'Delivered' ? 'selected' : ''}>✅ Delivered</option>
        </select>
      </td>
      <td>
        ${isUnconfirmed 
          ? `<button class="btn btn-primary btn-small" onclick="approveUserOrder('${o.orderId}')">✔️ Confirm Order</button>` 
          : `<span class="badge-status placed" style="background:#22c55e1a;color:#22c55e;">Confirmed</span>`}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function approveUserOrder(orderId) {
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const idx = orders.findIndex(o => o.orderId === orderId);
  if (idx !== -1) {
    orders[idx].isConfirmed = true;
    orders[idx].status = 'Pending'; // progress status to pending once confirmed
    
    // In case the order doesn't have an orderId starting with FC, let's keep it or generate one
    localStorage.setItem('orders', JSON.stringify(orders));
    showToast(`Order ${orderId} confirmed successfully! Tracking number generated.`, 'success');
    renderOrders();
  }
}

function changeOrderStatus(orderId, newStatus) {
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const idx = orders.findIndex(o => o.orderId === orderId);
  if (idx !== -1) {
    orders[idx].status = newStatus;
    localStorage.setItem('orders', JSON.stringify(orders));
    showToast(`Order ${orderId} updated to: ${newStatus}`, 'success');
    renderOrders();
  }
}

// ── UTILITIES & DEFAULTS ─────────────────────────────────────
function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type === "success" ? "toast-success" : "toast-error"}`;
  
  const icon = type === "success" ? "✓" : "✗";
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
  `;
  
  container.appendChild(toast);

  // Auto remove toast after 3.5 seconds
  setTimeout(() => {
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function getStatusKey(status) {
  if (status === "Pending") return "pending";
  if (status === "Out for Delivery") return "out";
  if (status === "Failed Attempt") return "failed";
  if (status === "Cancelled") return "cancelled";
  if (status === "Delivered") return "delivered";
  return "placed";
}

function resetSystemData() {
  if (confirm("⚠️ WARNING: This will restore accounts, catalog products, and delete order mock data. Do you want to restore original default state?")) {
    localStorage.removeItem('orders');
    localStorage.removeItem('products');
    localStorage.removeItem('accounts');
    localStorage.removeItem('productStock');
    
    showToast('Database reset successfully. Reloading...', 'success');
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  }
}

// ── PRODUCT IMAGE UPLOAD DRAG & DROP EVENTS ──────────────────
function setupImageUploadEvents() {
  const dragZone = document.getElementById('imageDragZone');
  const fileInput = document.getElementById('prodImageFile');
  const imagePreview = document.getElementById('imagePreview');
  const btnRemove = document.getElementById('btnRemoveImage');
  const hiddenInput = document.getElementById('prodImage');
  
  if (!dragZone || !fileInput) return;

  const contentPlaceholder = dragZone.querySelector('.drag-zone-content');

  // Click drag zone -> trigger hidden file select click
  dragZone.addEventListener('click', (e) => {
    if (e.target.closest('#btnRemoveImage')) return;
    fileInput.click();
  });

  // Handle manual file selection change
  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files[0]) {
      handleImageFile(fileInput.files[0]);
    }
  });

  // Drag over state hover
  dragZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dragZone.classList.add('dragover');
  });

  // Drag leave state reset
  dragZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragZone.classList.remove('dragover');
  });

  // Drop file handler
  dragZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dragZone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  });

  // Remove selected/dropped image
  btnRemove.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    resetDragZone();
  });

  function handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file (PNG, JPG, JPEG, SVG)', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      hiddenInput.value = dataUrl;
      imagePreview.src = dataUrl;
      imagePreview.style.display = 'block';
      btnRemove.style.display = 'flex';
      if (contentPlaceholder) contentPlaceholder.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }

  function resetDragZone() {
    hiddenInput.value = '';
    fileInput.value = '';
    imagePreview.removeAttribute('src');
    imagePreview.style.display = 'none';
    btnRemove.style.display = 'none';
    if (contentPlaceholder) contentPlaceholder.style.display = 'flex';
  }
}

// ── PROMO COUPONS MANAGEMENT ─────────────────────────────────
function renderCoupons() {
  // Initialize default coupons if they don't exist
  if (!localStorage.getItem('promoCoupons')) {
    const defaultCoupons = [
      { code: 'WELCOME10', type: 'percentage', value: 10 },
      { code: 'FREESHIP', type: 'free-shipping', value: 0 },
      { code: 'FRAMECRAFT500', type: 'fixed', value: 500 }
    ];
    localStorage.setItem('promoCoupons', JSON.stringify(defaultCoupons));
  }

  const coupons = JSON.parse(localStorage.getItem('promoCoupons') || '[]');
  const tbody = document.getElementById('couponsTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (coupons.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-secondary);padding:40px;">No coupons found.</td></tr>`;
    return;
  }

  coupons.forEach((coupon, idx) => {
    let typeDisplay = '';
    let valueDisplay = '';
    
    if (coupon.type === 'percentage') {
      typeDisplay = 'Percentage Discount (%)';
      valueDisplay = `${coupon.value}%`;
    } else if (coupon.type === 'fixed') {
      typeDisplay = 'Fixed Amount (₱)';
      valueDisplay = `₱${parseFloat(coupon.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (coupon.type === 'free-shipping') {
      typeDisplay = 'Free Shipping';
      valueDisplay = '—';
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span style="font-family:monospace;font-size:14.5px;font-weight:700;color:var(--blue);text-transform:uppercase;">${coupon.code}</span></td>
      <td><span style="color:var(--text-primary);font-weight:500;">${typeDisplay}</span></td>
      <td><strong style="color:var(--text-primary);">${valueDisplay}</strong></td>
      <td>
        <button class="btn btn-danger-outline btn-small" onclick="deleteCoupon(${idx})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openAddCouponModal() {
  document.getElementById('couponForm').reset();
  toggleCouponValuePlaceholder();
  document.getElementById('couponModal').classList.add('show');
}

function closeCouponModal() {
  document.getElementById('couponModal').classList.remove('show');
}

function toggleCouponValuePlaceholder() {
  const type = document.getElementById('couponTypeSelect').value;
  const valueGroup = document.getElementById('couponValueGroup');
  const valueInput = document.getElementById('couponValueInput');
  if (type === 'free-shipping') {
    valueGroup.style.display = 'none';
    valueInput.required = false;
    valueInput.value = '0';
  } else {
    valueGroup.style.display = 'block';
    valueInput.required = true;
    if (type === 'percentage') {
      valueInput.placeholder = 'e.g. 10';
      valueInput.value = '10';
    } else {
      valueInput.placeholder = 'e.g. 100';
      valueInput.value = '100';
    }
  }
}

function saveCouponAccount(e) {
  e.preventDefault();
  const code = document.getElementById('couponCodeInput').value.trim().toUpperCase();
  const type = document.getElementById('couponTypeSelect').value;
  let value = parseFloat(document.getElementById('couponValueInput').value) || 0;

  if (type === 'free-shipping') {
    value = 0;
  }

  if (!code) {
    showToast('Coupon code is required!', 'error');
    return;
  }

  const coupons = JSON.parse(localStorage.getItem('promoCoupons') || '[]');

  if (coupons.some(c => c.code === code)) {
    showToast('A coupon with this code already exists!', 'error');
    return;
  }

  coupons.push({ code, type, value });
  localStorage.setItem('promoCoupons', JSON.stringify(coupons));

  closeCouponModal();
  showToast('Coupon added successfully!', 'success');
  renderCoupons();
}

function deleteCoupon(idx) {
  const coupons = JSON.parse(localStorage.getItem('promoCoupons') || '[]');
  const coupon = coupons[idx];
  if (!coupon) return;

  if (confirm(`Are you sure you want to delete coupon code: ${coupon.code}?`)) {
    coupons.splice(idx, 1);
    localStorage.setItem('promoCoupons', JSON.stringify(coupons));
    showToast('Coupon deleted successfully', 'success');
    renderCoupons();
  }
}
