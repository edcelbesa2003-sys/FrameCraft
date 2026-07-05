/* ============================================================
   FRAMECRAFT — deliverystat.js
   ============================================================ */

// ── INITIAL MOCK DATA ────────────────────────────────────────
const MOCK_ORDERS = [
  {
    orderId: "FC-92815",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    delivery: {
      fullName: "Juan dela Cruz",
      phone: "09171234567",
      address: "45 Orchid St, Barangay Kapitolyo",
      city: "Pasig City",
      state: "Metro Manila",
      zipCode: "1603",
      country: "Philippines"
    },
    items: [
      { productId: 1, name: "Classic Aviator", qty: 2, price: 129.99 },
      { productId: 2, name: "Cat Eye Elegance", qty: 1, price: 109.99 }
    ],
    summary: { subtotal: 369.97, shipping: 100, tax: 44.40, total: 514.37 },
    payment: { method: "gcash", gcashMobile: "0917***4567" },
    status: "Order Placed"
  },
  {
    orderId: "FC-38104",
    timestamp: new Date(Date.now() - 3600000 * 14).toISOString(), // 14 hours ago
    delivery: {
      fullName: "Maria Clara",
      phone: "09187654321",
      address: "12 Rizal Ave, Taft",
      city: "Manila",
      state: "Metro Manila",
      zipCode: "1000",
      country: "Philippines"
    },
    items: [
      { productId: 3, name: "Luxury Round", qty: 1, price: 249.99 }
    ],
    summary: { subtotal: 249.99, shipping: 100, tax: 30.00, total: 379.99 },
    payment: { method: "credit-card", cardNumber: "**** **** **** 8832" },
    status: "Pending"
  },
  {
    orderId: "FC-77291",
    timestamp: new Date(Date.now() - 3600000 * 26).toISOString(), // 26 hours ago
    delivery: {
      fullName: "Crisostomo Ibarra",
      phone: "09059998888",
      address: "88 Noli Lane",
      city: "Calamba",
      state: "Laguna",
      zipCode: "4027",
      country: "Philippines"
    },
    items: [
      { productId: 4, name: "Sport Vision Pro", qty: 1, price: 159.99 },
      { productId: 5, name: "Navigator Square", qty: 2, price: 139.99 }
    ],
    summary: { subtotal: 439.97, shipping: 0, tax: 52.80, total: 492.77 },
    payment: { method: "paypal", paypalEmail: "ibarra@noli.ph" },
    status: "Out for Delivery"
  },
  {
    orderId: "FC-12490",
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
    delivery: {
      fullName: "Basilio Santos",
      phone: "09228887777",
      address: "74 San Diego St",
      city: "Quezon City",
      state: "Metro Manila",
      zipCode: "1100",
      country: "Philippines"
    },
    items: [
      { productId: 6, name: "Retro Oval", qty: 3, price: 99.99 }
    ],
    summary: { subtotal: 299.97, shipping: 100, tax: 36.00, total: 435.97 },
    payment: { method: "maya", mayaMobile: "0922***7777" },
    status: "Failed Attempt"
  },
  {
    orderId: "FC-55610",
    timestamp: new Date(Date.now() - 3600000 * 72).toISOString(), // 3 days ago
    delivery: {
      fullName: "Padre Damaso",
      phone: "09995554444",
      address: "1 Convent Road",
      city: "San Diego",
      state: "Bulacan",
      zipCode: "3000",
      country: "Philippines"
    },
    items: [
      { productId: 7, name: "Feather Cat", qty: 1, price: 119.99 }
    ],
    summary: { subtotal: 119.99, shipping: 100, tax: 14.40, total: 234.39 },
    payment: { method: "credit-card", cardNumber: "**** **** **** 1111" },
    status: "Cancelled"
  },
  {
    orderId: "FC-88412",
    timestamp: new Date(Date.now() - 3600000 * 96).toISOString(), // 4 days ago
    delivery: {
      fullName: "Juan dela Cruz",
      phone: "09171234567",
      address: "45 Orchid St, Barangay Kapitolyo",
      city: "Pasig City",
      state: "Metro Manila",
      zipCode: "1603",
      country: "Philippines"
    },
    items: [
      { productId: 8, name: "Trail Blazer", qty: 1, price: 179.99 },
      { productId: 1, name: "Classic Aviator", qty: 1, price: 129.99 }
    ],
    summary: { subtotal: 309.98, shipping: 0, tax: 37.20, total: 347.18 },
    payment: { method: "gcash", gcashMobile: "0917***4567" },
    status: "Delivered"
  }
];

// ── APP STATE ────────────────────────────────────────────────
let currentFilter = "All";

// ── DOM LOADED ───────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  // Display user greeting
  const userGreeting = document.getElementById('userGreeting');
  if (userGreeting) {
    userGreeting.textContent = `👤 ${user.name}`;
  }

  initOrdersData();
  setupFilterControls();
  renderDashboard();
});

// Initialize order data in localStorage if empty (Personalized to current user)
function initOrdersData() {
  const user = JSON.parse(localStorage.getItem('user'));
  const existing = localStorage.getItem("orders");
  if (!existing || JSON.parse(existing).length === 0) {
    // Map initial mock orders to the current logged-in user
    const personalizedMock = MOCK_ORDERS.map(order => ({
      ...order,
      user: user,
      delivery: {
        ...order.delivery,
        fullName: user ? user.name : order.delivery.fullName,
        email: user ? user.email : "user@example.com"
      }
    }));
    localStorage.setItem("orders", JSON.stringify(personalizedMock));
    showToast("Loaded default mock delivery orders", "success");
  }
}

// ── FILTERS & SEARCH ─────────────────────────────────────────
function setupFilterControls() {
  const filterTabs = document.querySelectorAll("#filterTabs .filter-tab");
  filterTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      filterTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentFilter = tab.dataset.filter;
      renderDashboard();
    });
  });
}

// ── RENDERING LOGIC ──────────────────────────────────────────
function renderDashboard() {
  renderOrdersCards();
}

function getStatusEmoji(status) {
  if (status === "Pending") return "⏳";
  if (status === "Out for Delivery") return "🚚";
  if (status === "Delivered") return "✅";
  if (status === "Failed Attempt") return "⚠️";
  if (status === "Cancelled") return "❌";
  return "🛒";
}

function getStatusKey(status) {
  if (status === "Pending") return "pending";
  if (status === "Out for Delivery") return "out";
  if (status === "Failed Attempt") return "failed";
  if (status === "Cancelled") return "cancelled";
  if (status === "Delivered") return "delivered";
  return "placed";
}

function renderOrdersCards() {
  const user = JSON.parse(localStorage.getItem('user'));
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  const userOrders = orders.filter(o => o.user && o.user.email === user.email);
  
  const grid = document.getElementById("ordersGrid");
  if (!grid) return;

  grid.innerHTML = "";

  userOrders.forEach(order => {
    if (!order.status) order.status = "Order Placed";
  });

  const filtered = userOrders.filter(order => {
    if (currentFilter === "All") return true;
    if (currentFilter === "Active") {
      return ["Order Placed", "Pending", "Out for Delivery"].includes(order.status);
    }
    if (currentFilter === "Delivered") {
      return order.status === "Delivered";
    }
    if (currentFilter === "Cancelled") {
      return ["Cancelled", "Failed Attempt"].includes(order.status);
    }
    return true;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="no-orders-row" style="text-align: center; padding: 40px; color: var(--slate); font-weight: 500;">No orders found. <a href="shop.html" style="color: var(--blue); font-weight: 700; text-decoration: none;">Explore our shop</a> to track your first order!</div>`;
    return;
  }

  // Sort orders descending by timestamp
  filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  filtered.forEach(order => {
    const formattedDate = new Date(order.timestamp).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    let itemsHtml = "";
    if (order.items && Array.isArray(order.items)) {
      itemsHtml = order.items.map(it => {
        const qty = it.quantity || it.qty || 1;
        const name = it.name || 'Glasses';
        return `<div class="order-card-item">📦 <span>${qty}x ${name}</span></div>`;
      }).join('');
    } else {
      itemsHtml = `<div class="order-card-item">📦 <span>${order.items || '1x Glasses'}</span></div>`;
    }

    const totalCost = order.summary ? order.summary.total : 0;
    const totalDisplay = `₱${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    let progressPercentage = 0;
    if (order.status === "Order Placed") progressPercentage = 15;
    else if (order.status === "Pending") progressPercentage = 45;
    else if (order.status === "Out for Delivery") progressPercentage = 75;
    else if (order.status === "Delivered") progressPercentage = 100;
    else if (order.status === "Failed Attempt") progressPercentage = 100;
    else if (order.status === "Cancelled") progressPercentage = 100;

    let progressColor = "var(--green)";
    if (order.status === "Failed Attempt") progressColor = "var(--red)";
    if (order.status === "Cancelled") progressColor = "var(--slate)";

    let extraActionBtn = "";
    if (order.status === "Order Placed") {
      extraActionBtn = `<button class="btn-card-action btn-cancel-order" onclick="cancelOrder('${order.orderId}')">❌ Cancel Order</button>`;
    } else if (order.status === "Delivered") {
      extraActionBtn = `<button class="btn-card-action btn-reorder" onclick="reorderItems('${order.orderId}')">🛒 Buy Again</button>`;
    }

    const card = document.createElement("div");
    card.className = "order-card";
    card.innerHTML = `
      <div class="order-card-header">
        <div class="order-card-meta">
          <h3>Order ID: ${order.orderId}</h3>
          <div class="order-date">${formattedDate}</div>
        </div>
        <span class="status-badge bg-${getStatusKey(order.status)}">
          ${getStatusEmoji(order.status)} ${order.status}
        </span>
      </div>
      <div class="order-card-body">
        <div class="order-card-items">
          ${itemsHtml}
        </div>
        <div class="order-card-tracking">
          <div class="tracking-status-text">
            <span>Tracking Status</span>
            <span class="color-${getStatusKey(order.status)}">${order.status}</span>
          </div>
          <div class="tracking-progress-bar-bg">
            <div class="tracking-progress-bar-fill" style="width: ${progressPercentage}%; background-color: ${progressColor};"></div>
          </div>
        </div>
      </div>
      <div class="order-card-footer">
        <div class="order-card-cost">
          <span class="total-label">Total Amount</span>
          <span class="total-val">${totalDisplay}</span>
        </div>
        <div class="order-card-actions">
          ${extraActionBtn}
          <button class="btn-card-action" onclick="openDetailsModal('${order.orderId}')">View Details & Receipt</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Helper: Check if user has reviewed a specific product in a specific order
function hasUserReviewedItem(orderId, productId) {
  const reviews = JSON.parse(localStorage.getItem('productReviews') || '{}');
  const prodReviews = reviews[productId] || [];
  return prodReviews.some(r => r.orderId === orderId);
}

// ── ORDER DETAILS MODAL ──────────────────────────────────────
window.openDetailsModal = function(orderId) {
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  const order = orders.find(o => o.orderId === orderId);
  if (!order) return;

  const modal = document.getElementById("orderDetailsModal");
  const content = document.getElementById("orderDetailsContent");
  if (!modal || !content) return;

  const dateString = new Date(order.timestamp).toLocaleString();
  
  let paymentDetails = 'N/A';
  if (order.payment) {
    if (order.payment.method === "credit-card") {
      paymentDetails = `Credit/Debit Card (Ending in ${order.payment.cardLast4 || (order.payment.cardNumber && order.payment.cardNumber.slice(-4)) || '****'})`;
    } else {
      const detailsVal = order.payment.email || order.payment.mobile || order.payment.paypalEmail || order.payment.mayaMobile || order.payment.gcashMobile || 'Saved Account';
      paymentDetails = `${order.payment.method.toUpperCase()} (${detailsVal})`;
    }
  }

  let itemsHtml = "";
  if (order.items && Array.isArray(order.items)) {
    itemsHtml = order.items.map(it => {
      const name = it.name || 'Custom Frame';
      const qty = it.quantity || it.qty || 1;
      const priceVal = typeof it.price === 'string'
        ? parseFloat(it.price.replace('₱', '').replace(/,/g, ''))
        : (it.price || 0);

      const productId = it.productId || parseInt(String(it.id).split('-')[0]);

      // Star review button next to each item if order is Delivered
      let reviewBtnHtml = "";
      if (order.status === "Delivered" && productId) {
        const reviewed = hasUserReviewedItem(order.orderId, productId);
        if (reviewed) {
          reviewBtnHtml = `<button class="btn-review-item reviewed" disabled>✓ Reviewed</button>`;
        } else {
          reviewBtnHtml = `<button class="btn-review-item" onclick="openReviewModal('${order.orderId}', ${productId}, '${name.replace(/'/g, "\\'")}')">⭐ Rate & Review</button>`;
        }
      }

      return `
        <div class="modal-item-row" style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
          <div>
            <div class="item-qty-name">${qty}x ${name}</div>
            <div class="item-specs">Premium Crafted Border</div>
          </div>
          <div style="display: flex; align-items: center; gap: 16px;">
            <strong>₱${(priceVal * qty).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            ${reviewBtnHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  // Determine stepper states based on order status
  let step1Class = "step-node";
  let step2Class = "step-node";
  let step3Class = "step-node";
  let step4Class = "step-node";
  let progressWidth = "0%";
  let step4Label = "Delivered";
  let step4Icon = "✨";

  const status = order.status || "Order Placed";
  if (status === "Order Placed") {
    step1Class += " active";
    progressWidth = "0%";
  } else if (status === "Pending") {
    step1Class += " completed";
    step2Class += " active";
    progressWidth = "33%";
  } else if (status === "Out for Delivery") {
    step1Class += " completed";
    step2Class += " completed";
    step3Class += " active";
    progressWidth = "66%";
  } else if (status === "Failed Attempt") {
    step1Class += " completed";
    step2Class += " completed";
    step3Class += " completed";
    step4Class += " failed";
    step4Label = "Failed Attempt";
    step4Icon = "⚠️";
    progressWidth = "100%";
  } else if (status === "Cancelled") {
    step1Class += " completed";
    step2Class += " completed";
    step3Class += " completed";
    step4Class += " cancelled";
    step4Label = "Cancelled";
    step4Icon = "❌";
    progressWidth = "100%";
  } else {
    step1Class += " completed";
    step2Class += " completed";
    step3Class += " completed";
    step4Class += " completed";
    progressWidth = "100%";
  }

  const stepperHtml = `
    <div class="order-tracking-stepper">
      <div class="stepper-progress-bar" style="width: ${progressWidth};"></div>
      <div class="${step1Class}">
        <div class="step-icon">🛒</div>
        <span class="step-label">Placed</span>
      </div>
      <div class="${step2Class}">
        <div class="step-icon">⏳</div>
        <span class="step-label">Pending</span>
      </div>
      <div class="${step3Class}">
        <div class="step-icon">🚚</div>
        <span class="step-label">In Transit</span>
      </div>
      <div class="${step4Class}">
        <div class="step-icon">${step4Icon}</div>
        <span class="step-label">${step4Label}</span>
      </div>
    </div>
  `;

  const subtotal = order.summary ? (order.summary.subtotal || 0) : 0;
  const tax = order.summary ? (order.summary.tax || 0) : 0;
  const shipping = order.summary ? (order.summary.shipping || 0) : 0;
  const total = order.summary ? (order.summary.total || 0) : 0;

  let discountHtml = "";
  if (order.summary && order.summary.discount) {
    const disc = order.summary.discount;
    discountHtml = `
      <div class="summary-row" style="color: var(--green);">
        <span>Discount (${disc.code})</span>
        <span>-₱${disc.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
    `;
  }

  content.innerHTML = `
    <div class="modal-order-header">
      <div>
        <h3>Order ID: ${order.orderId}</h3>
        <span class="order-date">${dateString}</span>
      </div>
      <span class="status-badge bg-${getStatusKey(order.status)}">
        ${getStatusEmoji(order.status)} ${order.status}
      </span>
    </div>

    <!-- Stepper Timeline -->
    ${stepperHtml}

    <div class="modal-receipt-section">
      <h4>📍 Delivery Address</h4>
      <div class="modal-receipt-grid">
        <div class="receipt-info-block">
          <span class="label">Customer Name</span>
          <span class="val">${order.delivery.fullName}</span>
        </div>
        <div class="receipt-info-block">
          <span class="label">Phone Number</span>
          <span class="val">${order.delivery.phone}</span>
        </div>
        <div class="receipt-info-block" style="grid-column: span 2;">
          <span class="label">Street Address</span>
          <span class="val">${order.delivery.address}, ${order.delivery.city}, ${order.delivery.state} ${order.delivery.zipCode}</span>
        </div>
      </div>
    </div>

    <div class="modal-receipt-section">
      <h4>💳 Payment Method</h4>
      <div class="modal-receipt-grid">
        <div class="receipt-info-block" style="grid-column: span 2;">
          <span class="label">Gateway / Account Details</span>
          <span class="val">${paymentDetails}</span>
        </div>
      </div>
    </div>

    <div class="modal-receipt-section">
      <h4>🛒 Items Ordered</h4>
      <div class="modal-items-list">
        ${itemsHtml}
      </div>
    </div>

    <div class="modal-summary-card">
      <div class="summary-row">
        <span>Subtotal</span>
        <span>₱${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
      ${discountHtml}
      <div class="summary-row">
        <span>Estimated Tax (12%)</span>
        <span>₱${tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
      <div class="summary-row">
        <span>Courier Shipping</span>
        <span>₱${shipping.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
      <div class="summary-row">
        <span>Grand Total</span>
        <span>₱${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
    </div>
  `;

  modal.classList.add("show");
};

window.closeDetailsModal = function() {
  const modal = document.getElementById("orderDetailsModal");
  if (modal) modal.classList.remove("show");
};

// ── REVIEW MODAL CONTROLS ─────────────────────────────────────
window.openReviewModal = function(orderId, productId, productName) {
  document.getElementById("reviewProductId").value = productId;
  document.getElementById("reviewOrderId").value = orderId;
  document.getElementById("reviewProductName").textContent = productName;
  
  document.getElementById("reviewComment").value = "";
  const stars = document.getElementsByName("rating");
  stars.forEach(s => s.checked = false);

  closeDetailsModal();
  const modal = document.getElementById("reviewModal");
  if (modal) modal.classList.add("show");
};

window.closeReviewModal = function() {
  const modal = document.getElementById("reviewModal");
  if (modal) modal.classList.remove("show");
};

window.submitReview = function(event) {
  event.preventDefault();
  
  const productId = parseInt(document.getElementById("reviewProductId").value);
  const orderId = document.getElementById("reviewOrderId").value;
  const comment = document.getElementById("reviewComment").value.trim();
  
  let ratingVal = 0;
  const stars = document.getElementsByName("rating");
  for (let s of stars) {
    if (s.checked) {
      ratingVal = parseInt(s.value);
      break;
    }
  }

  if (ratingVal === 0) {
    showToast("Please select a star rating!", "error");
    return;
  }

  const user = JSON.parse(localStorage.getItem('user'));
  const userName = user ? user.name : "Valued Customer";

  const allReviews = JSON.parse(localStorage.getItem('productReviews') || '{}');
  if (!allReviews[productId]) {
    allReviews[productId] = [];
  }
  
  if (allReviews[productId].some(r => r.orderId === orderId)) {
    showToast("You have already reviewed this item for this order!", "error");
    closeReviewModal();
    return;
  }

  const newReview = {
    orderId: orderId,
    userName: userName,
    rating: ratingVal,
    comment: comment,
    date: new Date().toISOString()
  };

  allReviews[productId].push(newReview);
  localStorage.setItem('productReviews', JSON.stringify(allReviews));

  const products = JSON.parse(localStorage.getItem('products') || '[]');
  const product = products.find(p => p.id === productId);
  if (product) {
    const oldReviewsCount = product.reviews || 0;
    const oldRating = product.rating || 0;
    const newReviewsCount = oldReviewsCount + 1;
    const newRating = parseFloat(((oldRating * oldReviewsCount + ratingVal) / newReviewsCount).toFixed(1));
    
    product.reviews = newReviewsCount;
    product.rating = newRating;
    
    localStorage.setItem('products', JSON.stringify(products));
  }

  closeReviewModal();
  showToast("Thank you for your rating & review!", "success");

  renderDashboard();
  setTimeout(() => {
    openDetailsModal(orderId);
  }, 400);
};

// ── CUSTOM POST-PURCHASE ACTIONS (CANCEL & REORDER) ───────────
window.reorderItems = function(orderId) {
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  const order = orders.find(o => o.orderId === orderId);
  if (!order) return;

  const cart = getCart();
  let itemsAdded = 0;
  
  const productStock = JSON.parse(localStorage.getItem('productStock') || '{}');

  order.items.forEach(item => {
    const pId = item.productId || parseInt(String(item.id).split('-')[0]);
    const size = item.size || 'M';
    const qty = item.qty || item.quantity || 1;
    
    const stock = productStock[pId];
    if (stock && (!stock.inStock || stock.limit <= 0)) {
      return;
    }

    const cartItemId = `${pId}-${size}`;
    const existing = cart.find(i => i.id === cartItemId);
    
    const currentCartQty = existing ? existing.quantity : 0;
    const finalQty = currentCartQty + qty;
    if (stock && finalQty > stock.limit) {
      if (existing) {
        existing.quantity = stock.limit;
      } else {
        cart.push({
          id: cartItemId,
          productId: pId,
          name: item.name,
          price: typeof item.price === 'string' ? item.price : `₱${item.price}`,
          size: size,
          quantity: stock.limit,
          image: item.image || ''
        });
      }
      itemsAdded += (stock.limit - currentCartQty);
    } else {
      if (existing) {
        existing.quantity += qty;
      } else {
        cart.push({
          id: cartItemId,
          productId: pId,
          name: item.name,
          price: typeof item.price === 'string' ? item.price : `₱${item.price}`,
          size: size,
          quantity: qty,
          image: item.image || ''
        });
      }
      itemsAdded += qty;
    }
  });

  if (itemsAdded > 0) {
    saveCart(cart);
    updateCartBadge();
    showToast(`Successfully reordered items! Added to cart.`, "success");
  } else {
    showToast(`Could not reorder. Items are out of stock!`, "error");
  }
};

window.cancelOrder = function(orderId) {
  showCustomConfirm(
    `Are you sure you want to cancel order ${orderId}?`,
    () => {
      const orders = JSON.parse(localStorage.getItem("orders") || "[]");
      const order = orders.find(o => o.orderId === orderId);
      if (!order) return;

      order.status = "Cancelled";
      localStorage.setItem("orders", JSON.stringify(orders));

      // Return stock levels
      const productStock = JSON.parse(localStorage.getItem('productStock') || '{}');
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const pId = item.productId || parseInt(String(item.id).split('-')[0]);
          const qty = item.qty || item.quantity || 1;
          if (pId && productStock[pId]) {
            const currentStock = productStock[pId];
            const newLimit = currentStock.limit + qty;
            productStock[pId] = {
              inStock: newLimit > 0,
              limit: newLimit
            };
          }
        });
        localStorage.setItem('productStock', JSON.stringify(productStock));
      }

      showToast(`Order ${orderId} has been cancelled. Stock levels returned.`, "success");
      renderDashboard();
    }
  );
};

// Backdrop click listeners to close modals
window.addEventListener("click", e => {
  const detailsModal = document.getElementById("orderDetailsModal");
  if (e.target === detailsModal) closeDetailsModal();

  const reviewModal = document.getElementById("reviewModal");
  if (e.target === reviewModal) closeReviewModal();
});

// ── TOAST NOTIFICATIONS ──────────────────────────────────────
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

  setTimeout(() => {
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
