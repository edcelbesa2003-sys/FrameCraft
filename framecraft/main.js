// ============================================================
// FRAMECRAFT — main.js
// ============================================================

// ── PRODUCT DATA ───────────────────────────────────────────
const PRODUCTS_DEFAULT = [
  {
    id: 1, name: 'Classic Aviator', category: 'Aviator', filter: 'aviator',
    desc: 'Timeless teardrop lenses in gold titanium. The original pilot\'s frame, perfected.',
    price: '₱129.99', badge: 'new', badgeLabel: 'New',
    colors: ['#b8860b', '#1c2b3a', '#c0392b'],
    rating: 4.8, reviews: 312,
    gradient: ['#e8eff8', '#d0dff0'], lensColor: '#4db8ff', strokeColor: '#0077ee',
    svgType: 'aviator', image: 'img/Classic Viator Blue.png'
  },
  {
    id: 2, name: 'Cat Eye Elegance', category: 'Cat Eye', filter: 'cat-eye',
    desc: 'Bold, feminine lines with an upswept corner. Understated drama for every occasion.',
    price: '₱109.99', originalPrice: '₱129.99', badge: 'sale', badgeLabel: 'Sale',
    colors: ['#7c3aed', '#1c2b3a', '#c2410c'],
    rating: 4.9, reviews: 198,
    gradient: ['#f3e8ff', '#ddd6fe'], lensColor: '#c084fc', strokeColor: '#9333ea',
    svgType: 'cat-eye', image: 'img/Cat Eye Elegance.png'
  },
  {
    id: 3, name: 'Luxury Round', category: 'Round', filter: 'round',
    desc: 'Hand-polished titanium circles with 24k gold detailing. Wear an heirloom.',
    price: '₱249.99', badge: 'luxury', badgeLabel: 'Luxury',
    colors: ['#d4af37', '#1c1c1c', '#c0c0c0'],
    rating: 5.0, reviews: 87,
    gradient: ['#fef9c3', '#fde68a'], lensColor: '#fde68a', strokeColor: '#d4af37',
    svgType: 'round', image: 'img/luxury gold.png'
  },
  {
    id: 4, name: 'Sport Vision Pro', category: 'Sport', filter: 'sport',
    desc: 'Wrap-around shield with UV400 and IPX6 waterproofing. From trail to street.',
    price: '₱159.99', badge: 'hot', badgeLabel: 'Hot',
    colors: ['#ea580c', '#1c2b3a', '#16a34a'],
    rating: 4.7, reviews: 445,
    gradient: ['#ffedd5', '#fed7aa'], lensColor: '#fb923c', strokeColor: '#ea580c',
    svgType: 'sport', image: 'img/Sport Vision Pro.png'
  },
  {
    id: 5, name: 'Navigator Square', category: 'Aviator', filter: 'aviator',
    desc: 'Angular precision with a matte acetate build. For the decisive and deliberate.',
    price: '₱139.99',
    colors: ['#1c2b3a', '#713f12', '#166534'],
    rating: 4.6, reviews: 221,
    gradient: ['#dbeafe', '#bfdbfe'], lensColor: '#60a5fa', strokeColor: '#2563eb',
    svgType: 'square', image: 'img/Navigator Square.png'
  },
  {
    id: 6, name: 'Retro Oval', category: 'Round', filter: 'round',
    desc: 'Soft oval silhouette channeling 70s cool. Lightweight and endlessly wearable.',
    price: '₱99.99',
    colors: ['#92400e', '#065f46', '#1e3a5f'],
    rating: 4.5, reviews: 163,
    gradient: ['#d1fae5', '#a7f3d0'], lensColor: '#34d399', strokeColor: '#059669',
    svgType: 'oval', image: 'img/Retro Oval.png'
  },
  {
    id: 7, name: 'Feather Cat', category: 'Cat Eye', filter: 'cat-eye',
    desc: 'Ultra-thin bio-acetate frames with a delicate upswept line. Effortlessly chic.',
    price: '₱119.99',
    colors: ['#be185d', '#1c2b3a', '#d4af37'],
    rating: 4.8, reviews: 274,
    gradient: ['#fce7f3', '#fbcfe8'], lensColor: '#f472b6', strokeColor: '#db2777',
    svgType: 'cat-eye', image: 'img/Feather Cat.png'
  },
  {
    id: 8, name: 'Trail Blazer', category: 'Sport', filter: 'sport',
    desc: 'Polarised lenses with anti-fog coating and a grippy rubber temple. Adventure-proof.',
    price: '₱179.99',
    colors: ['#1d4ed8', '#166534', '#1c2b3a'],
    rating: 4.9, reviews: 389,
    gradient: ['#dbeafe', '#bfdbfe'], lensColor: '#3b82f6', strokeColor: '#1d4ed8',
    svgType: 'sport', image: 'img/Trail Blazer.png'
  },
];

// Initialize database storage
if (!localStorage.getItem('products')) {
  localStorage.setItem('products', JSON.stringify(PRODUCTS_DEFAULT));
}
const PRODUCTS = JSON.parse(localStorage.getItem('products')) || PRODUCTS_DEFAULT;

const DEFAULT_ACCOUNTS = [
  { name: "Admin", email: "admin@framecraft.com", password: "adminpassword", role: "admin", joinDate: "06/01/2026" },
  { name: "Juan Dela Cruz", email: "juan@gmail.com", password: "password123", role: "user", joinDate: "06/15/2026" }
];
let accountsDb = JSON.parse(localStorage.getItem('accounts') || '[]');
if (accountsDb.length === 0) {
  localStorage.setItem('accounts', JSON.stringify(DEFAULT_ACCOUNTS));
} else if (!accountsDb.some(a => a.email.toLowerCase() === 'admin@framecraft.com')) {
  accountsDb.push(DEFAULT_ACCOUNTS[0]);
  localStorage.setItem('accounts', JSON.stringify(accountsDb));
}

// ── INIT ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
  renderProducts('all');
  setupNavigation();
  setupContactForm();
  setupHamburger();
  setupAuthForms();
  setupFilterTabs();
  initHeroSlider();
});

// ── AUTHENTICATION ─────────────────────────────────────────
function openLoginModal()  { document.getElementById('loginModal').classList.add('show'); }
function closeLoginModal() { document.getElementById('loginModal').classList.remove('show'); }
function openSignupModal() { document.getElementById('signupModal').classList.add('show'); }
function closeSignupModal(){ document.getElementById('signupModal').classList.remove('show'); }
function switchToSignup()  { closeLoginModal();  openSignupModal(); }
function switchToLogin()   { closeSignupModal(); openLoginModal(); }

function setupAuthForms() {
  document.getElementById('loginForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const email    = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    if (email && password) { login(email, password); }
  });

  document.getElementById('signupForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const name     = document.getElementById('signupName').value;
    const email    = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirm  = document.getElementById('signupConfirmPassword').value;
    if (password !== confirm) { showToast('Passwords do not match!', 'error'); return; }
    if (name && email && password) { signup(name, email, password); }
  });
}

function login(email, password) {
  const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
  const account = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
  if (!account) {
    showToast('No account found with this email!', 'error');
    return;
  }
  if (account.password !== password) {
    showToast('Incorrect password!', 'error');
    return;
  }

  const sessionUser = { email: account.email, name: account.name, role: account.role || 'user', joinDate: account.joinDate };
  localStorage.setItem('user', JSON.stringify(sessionUser));
  updateAuthUI();
  closeLoginModal();
  document.getElementById('loginForm')?.reset();
  showToast('Login successful!', 'success');

  if (account.role === 'admin') {
    setTimeout(() => {
      window.location.href = 'admin.html';
    }, 1000);
  }
}

function signup(name, email, password) {
  const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
  if (accounts.some(a => a.email.toLowerCase() === email.toLowerCase())) {
    showToast('Email is already registered!', 'error');
    return;
  }

  const newAccount = {
    name,
    email,
    password,
    role: 'user',
    joinDate: new Date().toLocaleDateString()
  };
  accounts.push(newAccount);
  localStorage.setItem('accounts', JSON.stringify(accounts));

  const sessionUser = { email: newAccount.email, name: newAccount.name, role: newAccount.role, joinDate: newAccount.joinDate };
  localStorage.setItem('user', JSON.stringify(sessionUser));
  updateAuthUI();
  closeSignupModal();
  document.getElementById('signupForm')?.reset();
  showToast('Account created successfully!', 'success');
}

function logout() {
  localStorage.removeItem('user');
  localStorage.removeItem('cart');
  updateAuthUI();
  if (window.location.pathname.includes('shop') || window.location.pathname.includes('checkout') || window.location.pathname.includes('deliverystat') || window.location.pathname.includes('admin')) window.location.href = 'index.html';
  showToast('Logged out successfully.', 'success');
}

function checkAuthStatus() { if (localStorage.getItem('user')) updateAuthUI(); }

function updateAuthUI() {
  const user          = JSON.parse(localStorage.getItem('user'));
  const loginBtn      = document.getElementById('loginBtn');
  const signupBtn     = document.getElementById('signupBtn');
  const logoutBtn     = document.getElementById('logoutBtn');
  const userGreeting  = document.getElementById('userGreeting');
  const shopLink      = document.getElementById('shopLink');
  const cartGroup     = document.getElementById('cartGroup');
  const profileGroup  = document.getElementById('profileGroup');
  const authButtons   = document.getElementById('authButtons');

  if (user) {
    if (authButtons)   authButtons.style.display     = 'none';
    if (cartGroup)     cartGroup.style.display       = 'flex';
    if (profileGroup)  profileGroup.style.display    = 'flex';
    
    if (logoutBtn)     logoutBtn.style.display       = 'block';
    if (userGreeting)  userGreeting.style.display    = 'none';
    if (shopLink)      shopLink.style.display        = 'block';
    
    updateCartBadge();
    loadProfileData();
  } else {
    if (authButtons)   authButtons.style.display     = 'flex';
    if (cartGroup)     cartGroup.style.display       = 'none';
    if (profileGroup)  profileGroup.style.display    = 'none';
    
    if (logoutBtn)     logoutBtn.style.display       = 'none';
    if (userGreeting)  userGreeting.style.display    = 'none';
    if (shopLink)      shopLink.style.display        = 'none';
  }
}

function goToDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.role === 'admin') {
    window.location.href = 'admin.html';
  } else {
    window.location.href = 'shop.html';
  }
}
function goToProducts() {
  JSON.parse(localStorage.getItem('user')) ? goToDashboard() : openLoginModal();
}

// ── CART ───────────────────────────────────────────────────
function getCart()        { return JSON.parse(localStorage.getItem('cart') || '[]'); }
function saveCart(cart)   { localStorage.setItem('cart', JSON.stringify(cart)); }

// ── MODAL STATE ──────────────────────────────────────────
let currentProductId = null;
let selectedSize = null;
let selectedQuantity = 1;

// ── PRODUCT STOCK DATA ──────────────────────────────────
const DEFAULT_PRODUCT_STOCK = {
  1: { inStock: true, limit: 12 },
  2: { inStock: true, limit: 8 },
  3: { inStock: false, limit: 0 },
  4: { inStock: true, limit: 15 },
  5: { inStock: true, limit: 5 },
  6: { inStock: true, limit: 20 },
  7: { inStock: false, limit: 0 },
  8: { inStock: true, limit: 10 }
};

if (!localStorage.getItem('productStock')) {
  localStorage.setItem('productStock', JSON.stringify(DEFAULT_PRODUCT_STOCK));
}

const productStock = new Proxy({}, {
  get(target, prop) {
    const localData = JSON.parse(localStorage.getItem('productStock') || '{}');
    if (prop in localData) {
      return localData[prop];
    }
    // Default fallback for new/uninitialized products
    return { inStock: true, limit: 10 };
  },
  set(target, prop, value) {
    const localData = JSON.parse(localStorage.getItem('productStock') || '{}');
    localData[prop] = value;
    localStorage.setItem('productStock', JSON.stringify(localData));
    return true;
  },
  deleteProperty(target, prop) {
    const localData = JSON.parse(localStorage.getItem('productStock') || '{}');
    delete localData[prop];
    localStorage.setItem('productStock', JSON.stringify(localData));
    return true;
  }
});


// ── HELPER: PARSE PRICE ─────────────────────────────────
function parsePrice(priceStr) {
  return parseFloat(priceStr.replace('₱', '').replace(/,/g, ''));
}

// Open Add to Cart Modal
function openCartModal(productId) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) { openLoginModal(); return; }

  // Load latest product details to ensure dynamic reviews/ratings sync
  const latestProducts = JSON.parse(localStorage.getItem('products')) || PRODUCTS;
  const product = latestProducts.find(p => p.id === productId);
  const stock = productStock[productId];

  if (!product || !stock) return;

  currentProductId = productId;
  selectedSize = null;
  selectedQuantity = 1;

  // Update modal with product data
  document.getElementById('modalProductName').textContent = product.name;
  document.getElementById('modalProductDesc').textContent = product.desc;
  document.getElementById('modalProductImage').src = product.image || '';
  
  // Render stars dynamically based on rounded rating
  const filledStars = Math.round(product.rating);
  document.getElementById('modalRating').textContent = '⭐'.repeat(filledStars) + '☆'.repeat(5 - filledStars);
  document.getElementById('modalReviews').textContent = `${product.rating.toFixed(1)} (${product.reviews} reviews)`;
  
  const isOutOfStock = !stock.inStock || stock.limit <= 0;
  const stockText = isOutOfStock ? 'Out of Stock' : `${stock.limit} items in stock`;
  const stockClass = isOutOfStock ? 'out-of-stock' : '';
  document.getElementById('modalStock').textContent = stockText;
  document.getElementById('modalStock').className = `stock-count ${stockClass}`;

  // Update price display
  updatePriceDisplay(product);

  // Reset size buttons
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Reset quantity
  document.getElementById('quantityInput').value = 1;
  selectedQuantity = 1;

  // Inject reviews list dynamically
  const modalContent = document.querySelector('#cartModal .cart-modal-content');
  if (modalContent) {
    let reviewsSection = modalContent.querySelector('.modal-reviews-section');
    if (!reviewsSection) {
      reviewsSection = document.createElement('div');
      reviewsSection.className = 'modal-reviews-section';
      modalContent.appendChild(reviewsSection);
    }
    
    const allReviews = JSON.parse(localStorage.getItem('productReviews') || '{}');
    const prodReviews = allReviews[productId] || [];
    
    if (prodReviews.length === 0) {
      reviewsSection.innerHTML = `
        <h3 class="reviews-section-title">Customer Reviews</h3>
        <p class="no-reviews-msg">No reviews yet for this product. Be the first to purchase and share your experience!</p>
      `;
    } else {
      const sortedReviews = [...prodReviews].sort((a, b) => new Date(b.date) - new Date(a.date));
      const reviewsListHtml = sortedReviews.map(r => {
        const starsStr = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
        const reviewDate = new Date(r.date).toLocaleDateString(undefined, {
          month: 'short', day: 'numeric', year: 'numeric'
        });
        return `
          <div class="review-item">
            <div class="review-item-header">
              <div class="review-user-rating">
                <span class="review-user">${r.userName}</span>
                <span class="review-stars">${starsStr}</span>
              </div>
              <span class="review-date">${reviewDate}</span>
            </div>
            <p class="review-comment">${r.comment}</p>
          </div>
        `;
      }).join('');
      
      reviewsSection.innerHTML = `
        <h3 class="reviews-section-title">Customer Reviews (${prodReviews.length})</h3>
        <div class="reviews-list">
          ${reviewsListHtml}
        </div>
      `;
    }
  }

  // Show modal
  document.getElementById('cartModal').classList.add('show');
}

// Update Price Display
function updatePriceDisplay(product) {
  const totalPrice = parsePrice(product.price) * selectedQuantity;
  document.getElementById('modalPrice').textContent = `₱${totalPrice.toFixed(2)}`;
  
  if (product.originalPrice) {
    const totalOriginal = parsePrice(product.originalPrice) * selectedQuantity;
    document.getElementById('modalOriginalPrice').style.display = 'inline';
    document.getElementById('modalOriginalPrice').textContent = `₱${totalOriginal.toFixed(2)}`;
  } else {
    document.getElementById('modalOriginalPrice').style.display = 'none';
  }
}

// Close Cart Modal
function closeCartModal() {
  document.getElementById('cartModal').classList.remove('show');
  currentProductId = null;
  selectedSize = null;
  selectedQuantity = 1;
}

// Select Size
function selectSize(size) {
  selectedSize = size;
  document.getElementById('selectedSize').value = size;

  // Update active button
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent === size) {
      btn.classList.add('active');
    }
  });
}

// Increase Quantity
function increaseQuantity() {
  const input = document.getElementById('quantityInput');
  const product = PRODUCTS.find(p => p.id === currentProductId);
  const stock = productStock[currentProductId];
  if (!product || !stock) return;

  if (parseInt(input.value) >= stock.limit) {
    showToast(`Cannot exceed available stock of ${stock.limit}`, 'warning');
    return;
  }

  selectedQuantity = parseInt(input.value) + 1;
  input.value = selectedQuantity;
  updatePriceDisplay(product);
}

// Decrease Quantity
function decreaseQuantity() {
  const input = document.getElementById('quantityInput');
  if (parseInt(input.value) > 1) {
    selectedQuantity = parseInt(input.value) - 1;
    input.value = selectedQuantity;
    
    // Update price
    const product = PRODUCTS.find(p => p.id === currentProductId);
    if (product) updatePriceDisplay(product);
  }
}

// Confirm Add to Cart
function confirmAddToCart() {
  if (!selectedSize) {
    showToast('Please select a size', 'warning');
    return;
  }

  const product = PRODUCTS.find(p => p.id === currentProductId);
  const stock = productStock[currentProductId];
  if (!product || !stock) return;

  const cart = getCart();
  const cartItemId = `${currentProductId}-${selectedSize}`;
  const existing = cart.find(i => i.id === cartItemId);

  const currentCartQty = existing ? existing.quantity : 0;
  if (currentCartQty + selectedQuantity > stock.limit) {
    showToast(`You already have ${currentCartQty} in cart. Cannot exceed available stock of ${stock.limit}`, 'warning');
    return;
  }

  if (existing) {
    existing.quantity += selectedQuantity;
  } else {
    cart.push({
      id: cartItemId,
      productId: currentProductId,
      name: product.name,
      price: product.price,
      size: selectedSize,
      quantity: selectedQuantity,
      image: product.image
    });
  }

  saveCart(cart);
  updateCartBadge();
  closeCartModal();
  showToast(`${product.name} (Size ${selectedSize}, Qty: ${selectedQuantity}) added to cart!`, 'success');
}

// Legacy fallback wrapper
function addToCart(id) {
  openCartModal(id);
}

// ── PRODUCT RENDERING ──────────────────────────────────────
function buildFrameSVG(p) {
  const lc = p.lensColor, sc = p.strokeColor, id = 'pc' + p.id;

  const defs = `
    <defs>
      <linearGradient id="lg${id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stop-color="${lc}" stop-opacity=".5"/>
        <stop offset="100%" stop-color="${sc}" stop-opacity=".28"/>
      </linearGradient>
      <filter id="gf${id}">
        <feGaussianBlur stdDeviation="3" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>`;

  const shapes = {
    aviator: `<g filter="url(#gf${id})">
      <ellipse cx="88" cy="108" rx="68" ry="60" fill="url(#lg${id})" stroke="${sc}" stroke-width="4"/>
      <ellipse cx="202" cy="108" rx="68" ry="60" fill="url(#lg${id})" stroke="${sc}" stroke-width="4"/>
      <path d="M156 108 Q145 118 134 108" fill="none" stroke="${sc}" stroke-width="3" stroke-linecap="round"/>
      <line x1="20" y1="84"  x2="2"   y2="70" stroke="${sc}" stroke-width="4" stroke-linecap="round"/>
      <line x1="270" y1="84" x2="288" y2="70" stroke="${sc}" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="72"  cy="96" rx="14" ry="8" fill="white" opacity=".2" transform="rotate(-20 72  96)"/>
      <ellipse cx="186" cy="96" rx="14" ry="8" fill="white" opacity=".2" transform="rotate(-20 186 96)"/>
    </g>`,
    'cat-eye': `<g filter="url(#gf${id})">
      <path d="M22 116 Q30 80 70 66 Q110 54 134 82 Q145 98 132 120 Q110 142 72 140 Q36 138 22 116 Z" fill="url(#lg${id})" stroke="${sc}" stroke-width="4"/>
      <path d="M158 82 Q182 54 222 66 Q262 80 270 116 Q254 138 216 140 Q178 140 158 120 Q146 98 158 82 Z" fill="url(#lg${id})" stroke="${sc}" stroke-width="4"/>
      <path d="M132 100 Q145 108 158 100" fill="none" stroke="${sc}" stroke-width="3" stroke-linecap="round"/>
      <line x1="22"  y1="112" x2="2"   y2="100" stroke="${sc}" stroke-width="4" stroke-linecap="round"/>
      <line x1="270" y1="112" x2="290" y2="100" stroke="${sc}" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="60"  cy="100" rx="13" ry="7" fill="white" opacity=".22" transform="rotate(-15 60  100)"/>
      <ellipse cx="198" cy="100" rx="13" ry="7" fill="white" opacity=".22" transform="rotate(-15 198 100)"/>
    </g>`,
    round: `<g filter="url(#gf${id})">
      <circle cx="90"  cy="110" r="70" fill="url(#lg${id})" stroke="${sc}" stroke-width="5"/>
      <circle cx="202" cy="110" r="70" fill="url(#lg${id})" stroke="${sc}" stroke-width="5"/>
      <path d="M162 110 Q146 120 130 110" fill="none" stroke="${sc}" stroke-width="4" stroke-linecap="round"/>
      <line x1="20"  y1="90" x2="2"   y2="78" stroke="${sc}" stroke-width="4" stroke-linecap="round"/>
      <line x1="272" y1="90" x2="290" y2="78" stroke="${sc}" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="72"  cy="94" rx="16" ry="9" fill="white" opacity=".22" transform="rotate(-20 72  94)"/>
      <ellipse cx="184" cy="94" rx="16" ry="9" fill="white" opacity=".22" transform="rotate(-20 184 94)"/>
    </g>`,
    sport: `<g filter="url(#gf${id})">
      <path d="M12 94 Q8 132 20 158 Q52 178 88 176 Q122 174 138 158 Q146 174 172 176 Q210 178 270 158 Q282 132 280 94 Q258 64 196 64 Q158 62 146 80 Q142 88 130 80 Q104 62 66 64 Q32 64 12 94 Z" fill="url(#lg${id})" stroke="${sc}" stroke-width="4"/>
      <rect x="128" y="84" width="16" height="14" rx="3" fill="${sc}" opacity=".65"/>
      <line x1="12"  y1="120" x2="0"   y2="108" stroke="${sc}" stroke-width="5" stroke-linecap="round"/>
      <line x1="280" y1="120" x2="292" y2="108" stroke="${sc}" stroke-width="5" stroke-linecap="round"/>
      <ellipse cx="74"  cy="120" rx="20" ry="10" fill="white" opacity=".18" transform="rotate(-10 74  120)"/>
      <ellipse cx="200" cy="120" rx="20" ry="10" fill="white" opacity=".18" transform="rotate(-10 200 120)"/>
    </g>`,
    square: `<g filter="url(#gf${id})">
      <rect x="20"  y="60" width="120" height="100" rx="10" fill="url(#lg${id})" stroke="${sc}" stroke-width="4"/>
      <rect x="152" y="60" width="120" height="100" rx="10" fill="url(#lg${id})" stroke="${sc}" stroke-width="4"/>
      <path d="M140 110 Q146 118 152 110" fill="none" stroke="${sc}" stroke-width="3" stroke-linecap="round"/>
      <line x1="20"  y1="90" x2="2"   y2="78" stroke="${sc}" stroke-width="4" stroke-linecap="round"/>
      <line x1="272" y1="90" x2="290" y2="78" stroke="${sc}" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="52"  cy="92" rx="14" ry="8" fill="white" opacity=".2" transform="rotate(-10 52  92)"/>
      <ellipse cx="182" cy="92" rx="14" ry="8" fill="white" opacity=".2" transform="rotate(-10 182 92)"/>
    </g>`,
    oval: `<g filter="url(#gf${id})">
      <ellipse cx="88"  cy="110" rx="68" ry="52" fill="url(#lg${id})" stroke="${sc}" stroke-width="4"/>
      <ellipse cx="204" cy="110" rx="68" ry="52" fill="url(#lg${id})" stroke="${sc}" stroke-width="4"/>
      <path d="M156 110 Q146 118 136 110" fill="none" stroke="${sc}" stroke-width="3" stroke-linecap="round"/>
      <line x1="20"  y1="88" x2="2"   y2="74" stroke="${sc}" stroke-width="4" stroke-linecap="round"/>
      <line x1="272" y1="88" x2="290" y2="74" stroke="${sc}" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="70"  cy="96" rx="13" ry="7" fill="white" opacity=".2" transform="rotate(-15 70  96)"/>
      <ellipse cx="186" cy="96" rx="13" ry="7" fill="white" opacity=".2" transform="rotate(-15 186 96)"/>
    </g>`,
  };

  return `<svg class="product-frame-svg" viewBox="0 0 292 200" xmlns="http://www.w3.org/2000/svg">${defs}${shapes[p.svgType] || ''}</svg>`;
}

function renderProducts(filter = 'all') {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  const currentProducts = JSON.parse(localStorage.getItem('products')) || PRODUCTS_DEFAULT;
  const list = filter === 'all' ? currentProducts : currentProducts.filter(p => p.filter === filter);
  const badgeClass = { new: 'badge-new', sale: 'badge-sale', hot: 'badge-hot', luxury: 'badge-luxury' };

  grid.innerHTML = list.map(p => {
    const stock = productStock[p.id];
    const isOutOfStock = !stock.inStock || stock.limit <= 0;
    const stockClass = isOutOfStock ? 'out-of-stock' : '';

    const badgeHTML = p.badge
      ? `<span class="product-badge ${badgeClass[p.badge]}">${p.badgeLabel}</span>` : '';
    const outOfStockBadgeHTML = isOutOfStock
      ? `<span class="product-badge product-badge-stock">Out of Stock</span>` : '';
    const origHTML  = p.originalPrice
      ? `<div class="product-price-original">${p.originalPrice}</div>` : '';
    const starsHTML = '★'.repeat(Math.floor(p.rating)) + (p.rating % 1 ? '½' : '');
    const svgHTML   = buildFrameSVG(p);
    const imageHTML = p.image
      ? `<img src="${p.image}" alt="${p.name}" class="product-image-img"
             onerror="this.style.display='none';this.nextElementSibling.style.display='block';">
         <span class="product-image-fallback" style="display:none">${svgHTML}</span>`
      : svgHTML;
    const bgStyle = p.image
      ? 'background:#f0f2f5'
      : `background:linear-gradient(135deg,${p.gradient[0]},${p.gradient[1]})`;

    return `
    <div class="product-card ${stockClass}" data-id="${p.id}">
      ${badgeHTML}
      ${outOfStockBadgeHTML}
      <div class="product-image" style="${bgStyle}">${imageHTML}</div>
      <div class="product-info">
        <div class="product-meta-row">
          <span class="product-category">${p.category}</span>
          <div class="product-rating">
            <span class="stars">${starsHTML}</span>
            <span>${p.rating} (${p.reviews})</span>
          </div>
        </div>
        <div class="product-name">${p.name}</div>
        <div class="product-description">${p.desc}</div>
        <div class="product-footer">
          <div class="product-price-block">
            <div class="product-price">${p.price}</div>
            ${origHTML}
          </div>
          <button class="btn-add-to-cart" onclick="event.stopPropagation(); addToCart(${p.id})" ${isOutOfStock ? 'disabled' : ''}>
            ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function setupFilterTabs() {
  document.getElementById('filterTabs')?.addEventListener('click', e => {
    const tab = e.target.closest('.filter-tab');
    if (!tab) return;
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderProducts(tab.dataset.filter);
  });
}

// ── HERO SLIDER ────────────────────────────────────────────
function initHeroSlider() {
  const slides   = document.querySelectorAll('.hero-slide');
  if (slides.length === 0) return;

  const dots     = document.querySelectorAll('.hero-dot');
  const bar      = document.getElementById('heroProgressBar');
  const DURATION = 5000;
  const TRANSITION_TIME = 700;
  let current = 0;
  let timer = null;
  let transitionTimer = null;
  let isTransitioning = false;

  function goTo(idx) {
    clearTimeout(timer);
    clearTimeout(transitionTimer);

    if (bar) {
      bar.style.transition = 'none';
      bar.style.width = '0%';
    }

    if (slides[current]) {
      slides[current].classList.remove('active');
      slides[current].classList.add('leaving');
    }
    if (dots[current]) {
      dots[current].classList.remove('active');
    }
    
    current = (idx + slides.length) % slides.length;
    
    if (slides[current]) {
      slides[current].classList.add('active');
    }
    if (dots[current]) {
      dots[current].classList.add('active');
    }
    
    isTransitioning = true;

    transitionTimer = setTimeout(() => {
      document.querySelectorAll('.hero-slide.leaving').forEach(s => s.classList.remove('leaving'));
      isTransitioning = false;
      startProgressBar();
    }, TRANSITION_TIME);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startProgressBar() {
    clearTimeout(timer);
    if (bar) {
      bar.style.transition = 'none';
      bar.style.width = '0%';
      // Force a synchronous reflow to flush CSS styles immediately
      void bar.offsetWidth; 
      bar.style.transition = `width ${DURATION}ms linear`;
      bar.style.width = '100%';
    }
    timer = setTimeout(next, DURATION);
  }

  document.getElementById('heroNext')?.addEventListener('click', next);
  document.getElementById('heroPrev')?.addEventListener('click', prev);
  dots.forEach(d => d.addEventListener('click', () => goTo(+d.dataset.idx)));
  document.addEventListener('keydown', e => {
    // Only trigger if no modal is active
    if (document.querySelector('.modal.show')) return;
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft')  prev();
  });

  // Touch / swipe
  let touchX = null;
  const slider = document.getElementById('heroSlider');
  if (slider) {
    slider.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend',   e => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
      touchX = null;
    }, { passive: true });
  }

  startProgressBar();
}

// ── UI HELPERS ─────────────────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) { alert(message); return; }
  const icons = { success: '✓', error: '✕', warning: '⚠' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || '✓'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add('hide'); setTimeout(() => toast.remove(), 260); }, 3000);
}

function setupNavigation() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href?.startsWith('#')) {
        e.preventDefault();
        document.getElementById(href.substring(1))?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

function setupContactForm() {
  document.getElementById('contactForm')?.addEventListener('submit', e => {
    e.preventDefault();
    showToast('Thank you for your message! We\'ll get back to you soon.', 'success');
    e.target.reset();
  });
}

function setupHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('navMenu');
  hamburger?.addEventListener('click', () => {
    navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
    hamburger.classList.toggle('active');
  });
}

// Close modals when clicking backdrop
window.addEventListener('click', e => {
  if (e.target === document.getElementById('loginModal'))  closeLoginModal();
  if (e.target === document.getElementById('signupModal')) closeSignupModal();
  if (e.target === document.getElementById('profileModal')) closeProfileModal();
  if (e.target === document.getElementById('cartModal'))    closeCartModal();
});

// ── CART ICON & UPDATE ─────────────────────────────────────

function updateCartBadge() {
  const cartBadge = document.getElementById('cartBadge');
  if (cartBadge) {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
    cartBadge.style.display = totalItems > 0 ? 'block' : 'none';
  }
}

function openCart() {
  window.location.href = 'checkout.html';
}

// ── PROFILE MODAL ──────────────────────────────────────────
function openProfileModal() {
  const modal = document.getElementById('profileModal');
  if (modal) {
    modal.classList.add('show');
    switchProfileTab('account');
    loadProfileData();
  }
}

function closeProfileModal() {
  const modal = document.getElementById('profileModal');
  if (modal) modal.classList.remove('show');
}

const DEFAULT_PROFILE_PIC = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230088ee'%3E%3Ccircle cx='12' cy='8' r='4'/%3E%3Cpath d='M12 14c-6 0-8 3-8 3v5h16v-5s-2-3-8-3z'/%3E%3C/svg%3E";

function loadProfileData() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return;

  // Load profile picture
  if (user.profilePicture) {
    document.getElementById('profileImage').src = user.profilePicture;
    document.getElementById('profilePictureModal').src = user.profilePicture;
  } else {
    document.getElementById('profileImage').src = DEFAULT_PROFILE_PIC;
    document.getElementById('profilePictureModal').src = DEFAULT_PROFILE_PIC;
  }

  updateRemovePictureButton();

  // Load addresses list
  displayAddressesList();
  
  // Load payment methods
  displayPaymentMethods();
}

function displayAddressesList() {
  const user = JSON.parse(localStorage.getItem('user'));
  const addressesList = document.getElementById('addressesList');
  
  if (!user || !user.addresses || user.addresses.length === 0) {
    addressesList.innerHTML = '<p style="color:#8fa4bb;">No saved addresses yet</p>';
    return;
  }

  addressesList.innerHTML = user.addresses.map((addr, idx) => `
    <div class="address-card ${addr.isDefault ? 'default' : ''}">
      <div class="address-header">
        <h4>${addr.name}</h4>
        ${addr.isDefault ? '<span class="default-badge">Default</span>' : ''}
      </div>
      <p>${addr.street}, ${addr.city}</p>
      <p>${addr.state}, ${addr.zipCode} ${addr.country}</p>
      <p>📞 ${addr.phone}</p>
      <div class="address-actions">
        <button type="button" class="btn-small" onclick="editAddress(${idx})">Edit</button>
        <button type="button" class="btn-small" onclick="deleteAddress(${idx})">Delete</button>
        ${!addr.isDefault ? `<button type="button" class="btn-small" onclick="setDefaultAddress(${idx})">Set Default</button>` : ''}
      </div>
    </div>
  `).join('');
}

function openAddAddressForm() {
  document.getElementById('addressIndex').value = '';
  document.getElementById('addressForm').style.display = 'block';
  document.getElementById('addressName').value = '';
  document.getElementById('addressPhone').value = '';
  document.getElementById('addressStreet').value = '';
  document.getElementById('addressCity').value = '';
  document.getElementById('addressState').value = '';
  document.getElementById('addressZip').value = '';
  document.getElementById('addressCountry').value = 'Philippines';
  document.getElementById('setDefault').checked = false;
}

function editAddress(idx) {
  const user = JSON.parse(localStorage.getItem('user'));
  const addr = user.addresses[idx];
  
  document.getElementById('addressIndex').value = idx;
  document.getElementById('addressName').value = addr.name;
  document.getElementById('addressPhone').value = addr.phone;
  document.getElementById('addressStreet').value = addr.street;
  document.getElementById('addressCity').value = addr.city;
  document.getElementById('addressState').value = addr.state;
  document.getElementById('addressZip').value = addr.zipCode;
  document.getElementById('addressCountry').value = addr.country;
  document.getElementById('setDefault').checked = addr.isDefault;
  
  document.getElementById('addressForm').style.display = 'block';
}

function saveAddress() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return;

  if (!user.addresses) user.addresses = [];

  const address = {
    name: document.getElementById('addressName').value,
    phone: document.getElementById('addressPhone').value,
    street: document.getElementById('addressStreet').value,
    city: document.getElementById('addressCity').value,
    state: document.getElementById('addressState').value,
    zipCode: document.getElementById('addressZip').value,
    country: document.getElementById('addressCountry').value,
    isDefault: document.getElementById('setDefault').checked
  };

  const idx = document.getElementById('addressIndex').value;

  if (idx === '') {
    // New address
    // If this is the first address, make it default
    if (user.addresses.length === 0) address.isDefault = true;
    user.addresses.push(address);
  } else {
    // Edit existing
    if (address.isDefault) {
      // Unset other defaults
      user.addresses.forEach(a => a.isDefault = false);
    }
    user.addresses[idx] = address;
  }

  localStorage.setItem('user', JSON.stringify(user));
  showToast('Address saved successfully!', 'success');
  cancelAddressForm();
  displayAddressesList();
}

function deleteAddress(idx) {
  if (confirm('Delete this address?')) {
    const user = JSON.parse(localStorage.getItem('user'));
    user.addresses.splice(idx, 1);
    
    // If deleted address was default, set first as default
    if (user.addresses.length > 0 && !user.addresses.some(a => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }
    
    localStorage.setItem('user', JSON.stringify(user));
    showToast('Address deleted', 'success');
    displayAddressesList();
  }
}

function setDefaultAddress(idx) {
  const user = JSON.parse(localStorage.getItem('user'));
  user.addresses.forEach(a => a.isDefault = false);
  user.addresses[idx].isDefault = true;
  localStorage.setItem('user', JSON.stringify(user));
  displayAddressesList();
}

function cancelAddressForm() {
  document.getElementById('addressForm').style.display = 'none';
}

// ── PAYMENT METHODS MANAGEMENT ────────────────────────────
function displayPaymentMethods() {
  const user = JSON.parse(localStorage.getItem('user'));
  const container = document.getElementById('paymentMethodsList');
  const infoText = document.getElementById('paymentInfoText');
  
  if (!container) return;
  
  if (!user || !user.paymentMethods || user.paymentMethods.length === 0) {
    container.innerHTML = '<p style="color: #8fa4bb; font-size: 14px;">No saved payment methods yet. They will appear here after you save them during checkout.</p>';
    if (infoText) infoText.style.display = 'none';
    return;
  }
  
  if (infoText) infoText.style.display = 'block';
  
  container.innerHTML = user.paymentMethods.map((payment, idx) => {
    let icon = '';
    let title = '';
    let description = '';
    
    if (payment.method === 'credit-card') {
      icon = '💳';
      title = `Card ending in ${payment.cardNumber.slice(-4)}`;
      description = `${payment.cardName} • Expires ${payment.cardExpiry}`;
    } else if (payment.method === 'paypal') {
      icon = '🅿️';
      title = 'PayPal';
      description = payment.paypalEmail;
    } else if (payment.method === 'maya') {
      icon = '🏦';
      title = 'Maya';
      description = `${payment.mayaEmail} • ${payment.mayaMobile}`;
    } else if (payment.method === 'gcash') {
      icon = '📱';
      title = 'GCash';
      description = payment.gcashMobile;
    }
    
    return `
      <div class="payment-method-card ${payment.isDefault ? 'default' : ''}">
        <div class="payment-method-info">
          <div class="payment-method-icon">${icon}</div>
          <div class="payment-method-details">
            <strong>${title}</strong>
            <small>${description}</small>
          </div>
          ${payment.isDefault ? '<span class="payment-method-badge">Default</span>' : ''}
        </div>
        <div class="payment-method-actions">
          ${!payment.isDefault ? `<button type="button" class="btn-payment-action" onclick="setDefaultPayment(${idx})">Set Default</button>` : ''}
          <button type="button" class="btn-payment-action btn-payment-delete" onclick="deletePaymentMethod(${idx})">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

function deletePaymentMethod(idx) {
  if (confirm('Delete this payment method?')) {
    const user = JSON.parse(localStorage.getItem('user'));
    const wasDefault = user.paymentMethods[idx].isDefault;
    
    user.paymentMethods.splice(idx, 1);
    
    // If deleted was default and methods remain, set first as default
    if (wasDefault && user.paymentMethods.length > 0) {
      user.paymentMethods[0].isDefault = true;
    }
    
    localStorage.setItem('user', JSON.stringify(user));
    showToast('Payment method deleted', 'success');
    displayPaymentMethods();
  }
}

function setDefaultPayment(idx) {
  const user = JSON.parse(localStorage.getItem('user'));
  user.paymentMethods.forEach(p => p.isDefault = false);
  user.paymentMethods[idx].isDefault = true;
  localStorage.setItem('user', JSON.stringify(user));
  showToast('Default payment method updated', 'success');
  displayPaymentMethods();
}

// ── ADD/EDIT PAYMENT METHOD FORM ──────────────────────────
function openAddPaymentForm() {
  // Reset form completely
  const form = document.getElementById('paymentMethodForm');
  if (form) {
    form.reset();
  }
  
  // Clear all input values
  const typeSelect = document.getElementById('paymentMethodType');
  typeSelect.value = '';
  
  document.getElementById('paymentMethodIndex').value = '';
  document.getElementById('setDefaultPayment').checked = false;
  
  // Clear all payment fields
  clearAllPaymentFields();
  
  // Hide all field groups
  document.getElementById('creditCardFields').style.display = 'none';
  document.getElementById('paypalFields').style.display = 'none';
  document.getElementById('mayaFields').style.display = 'none';
  document.getElementById('gcashFields').style.display = 'none';
  
  // Show the form
  form.style.display = 'block';
}

function clearAllPaymentFields() {
  document.getElementById('paymentCardName').value = '';
  document.getElementById('paymentCardNumber').value = '';
  document.getElementById('paymentCardExpiry').value = '';
  document.getElementById('paymentCardCvv').value = '';
  document.getElementById('paymentPaypalEmail').value = '';
  document.getElementById('paymentPaypalPassword').value = '';
  document.getElementById('paymentMayaEmail').value = '';
  document.getElementById('paymentMayaMobile').value = '';
  document.getElementById('paymentGcashMobile').value = '';
  document.getElementById('paymentGcashPin').value = '';
}

function cancelPaymentForm() {
  document.getElementById('paymentMethodForm').style.display = 'none';
  clearAllPaymentFields();
}

function updatePaymentForm() {
  const type = document.getElementById('paymentMethodType').value;
  
  // Hide all field groups first
  document.getElementById('creditCardFields').style.display = 'none';
  document.getElementById('paypalFields').style.display = 'none';
  document.getElementById('mayaFields').style.display = 'none';
  document.getElementById('gcashFields').style.display = 'none';
  
  // Show selected field group
  switch(type) {
    case 'credit-card':
      document.getElementById('creditCardFields').style.display = 'block';
      break;
    case 'paypal':
      document.getElementById('paypalFields').style.display = 'block';
      break;
    case 'maya':
      document.getElementById('mayaFields').style.display = 'block';
      break;
    case 'gcash':
      document.getElementById('gcashFields').style.display = 'block';
      break;
  }
}

function savePaymentMethod() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return;
  
  if (!user.paymentMethods) {
    user.paymentMethods = [];
  }
  
  const methodType = document.getElementById('paymentMethodType').value;
  if (!methodType) {
    showToast('Please select a payment method type', 'error');
    return;
  }
  
  let paymentData = {
    method: methodType,
    isDefault: document.getElementById('setDefaultPayment').checked || user.paymentMethods.length === 0
  };
  
  // Validate and collect data based on type
  if (methodType === 'credit-card') {
    const cardName = document.getElementById('paymentCardName').value.trim();
    const cardNumber = document.getElementById('paymentCardNumber').value.trim();
    const cardExpiry = document.getElementById('paymentCardExpiry').value.trim();
    const cardCvv = document.getElementById('paymentCardCvv').value.trim();
    
    if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
      showToast('Please fill in all credit card fields', 'error');
      return;
    }
    
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      showToast('Card number must be 16 digits', 'error');
      return;
    }
    
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test(cardExpiry)) {
      showToast('Please enter expiry date in MM/YY format', 'error');
      return;
    }
    
    if (cardCvv.length !== 3 || isNaN(cardCvv)) {
      showToast('CVV must be 3 digits', 'error');
      return;
    }
    
    paymentData = {
      ...paymentData,
      cardName: cardName,
      cardNumber: cardNumber,
      cardExpiry: cardExpiry,
      cardCvv: cardCvv
    };
  } else if (methodType === 'paypal') {
    const email = document.getElementById('paymentPaypalEmail').value.trim();
    const password = document.getElementById('paymentPaypalPassword').value.trim();
    
    if (!email || !password) {
      showToast('Please fill in all PayPal fields', 'error');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    
    paymentData = {
      ...paymentData,
      paypalEmail: email,
      paypalPassword: password
    };
  } else if (methodType === 'maya') {
    const email = document.getElementById('paymentMayaEmail').value.trim();
    const mobile = document.getElementById('paymentMayaMobile').value.trim();
    
    if (!email || !mobile) {
      showToast('Please fill in all Maya fields', 'error');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    
    const phoneRegex = /^[\d\+\-\(\)\s]+$/;
    if (!phoneRegex.test(mobile) || mobile.length < 10) {
      showToast('Please enter a valid mobile number', 'error');
      return;
    }
    
    paymentData = {
      ...paymentData,
      mayaEmail: email,
      mayaMobile: mobile
    };
  } else if (methodType === 'gcash') {
    const mobile = document.getElementById('paymentGcashMobile').value.trim();
    const pin = document.getElementById('paymentGcashPin').value.trim();
    
    if (!mobile || !pin) {
      showToast('Please fill in all GCash fields', 'error');
      return;
    }
    
    const phoneRegex = /^[\d\+\-\(\)\s]+$/;
    if (!phoneRegex.test(mobile) || mobile.length < 10) {
      showToast('Please enter a valid GCash mobile number', 'error');
      return;
    }
    
    if (pin.length !== 4 || isNaN(pin)) {
      showToast('PIN must be 4 digits', 'error');
      return;
    }
    
    paymentData = {
      ...paymentData,
      gcashMobile: mobile,
      gcashPin: pin
    };
  }
  
  // Check for duplicates
  const exists = user.paymentMethods.some(pm => {
    if (pm.method !== methodType) return false;
    if (methodType === 'credit-card') return pm.cardNumber === paymentData.cardNumber;
    if (methodType === 'paypal') return pm.paypalEmail === paymentData.paypalEmail;
    if (methodType === 'maya') return pm.mayaEmail === paymentData.mayaEmail;
    if (methodType === 'gcash') return pm.gcashMobile === paymentData.gcashMobile;
    return false;
  });
  
  if (exists) {
    showToast('This payment method is already saved', 'warning');
    return;
  }
  
  // If setting as default, unset others
  if (paymentData.isDefault) {
    user.paymentMethods.forEach(p => p.isDefault = false);
  }
  
  user.paymentMethods.push(paymentData);
  localStorage.setItem('user', JSON.stringify(user));
  
  showToast('Payment method saved successfully!', 'success');
  cancelPaymentForm();
  displayPaymentMethods();
}

// ── PROFILE PICTURE UPLOAD ────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const profilePictureInput = document.getElementById('profilePictureInput');
  if (profilePictureInput) {
    profilePictureInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        showCustomConfirm(
          "Are you sure you want to change your profile picture?",
          // On Confirm
          () => {
            const reader = new FileReader();
            reader.onload = function(event) {
              const imageData = event.target.result;
              const user = JSON.parse(localStorage.getItem('user'));
              if (user) {
                user.profilePicture = imageData;
                localStorage.setItem('user', JSON.stringify(user));
                
                // Update both profile images
                document.getElementById('profileImage').src = imageData;
                document.getElementById('profilePictureModal').src = imageData;
                
                showToast('Profile picture updated!', 'success');
                updateRemovePictureButton();
              }
            };
            reader.readAsDataURL(file);
          },
          // On Cancel
          () => {
            profilePictureInput.value = "";
          }
        );
      }
    });
  }

  // Inject remove profile picture button dynamically
  const profilePicSection = document.querySelector('.profile-pic-section');
  if (profilePicSection) {
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-pic-btn';
    removeBtn.id = 'removeProfilePictureBtn';
    removeBtn.textContent = 'Remove Picture';
    removeBtn.style.display = 'none'; // hidden by default
    removeBtn.style.marginTop = '10px';

    profilePicSection.appendChild(removeBtn);

    removeBtn.addEventListener('click', function() {
      showCustomConfirm(
        "Are you sure you want to remove your profile picture?",
        // On Confirm
        () => {
          const user = JSON.parse(localStorage.getItem('user'));
          if (user) {
            delete user.profilePicture;
            localStorage.setItem('user', JSON.stringify(user));
            
            document.getElementById('profileImage').src = DEFAULT_PROFILE_PIC;
            document.getElementById('profilePictureModal').src = DEFAULT_PROFILE_PIC;
            
            const input = document.getElementById('profilePictureInput');
            if (input) input.value = "";
            
            showToast('Profile picture removed!', 'success');
            updateRemovePictureButton();
          }
        }
      );
    });
  }

  // Initialize auth UI and setup
  checkAuthStatus();
  setupNavigation();
  setupContactForm();
  setupHamburger();
});

function updateRemovePictureButton() {
  const user = JSON.parse(localStorage.getItem('user'));
  const removeBtn = document.getElementById('removeProfilePictureBtn');
  if (removeBtn) {
    if (user && user.profilePicture) {
      removeBtn.style.display = 'inline-block';
    } else {
      removeBtn.style.display = 'none';
    }
  }
}

function showCustomConfirm(message, onConfirm, onCancel) {
  const overlay = document.createElement('div');
  overlay.className = 'custom-confirm-overlay';
  
  const dialog = document.createElement('div');
  dialog.className = 'custom-confirm-dialog';
  
  dialog.innerHTML = `
    <div class="custom-confirm-content">
      <div class="custom-confirm-icon">👤</div>
      <p class="custom-confirm-message">${message}</p>
      <div class="custom-confirm-actions">
        <button class="btn-confirm-cancel">Cancel</button>
        <button class="btn-confirm-accept">Confirm</button>
      </div>
    </div>
  `;
  
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  
  dialog.querySelector('.btn-confirm-accept').addEventListener('click', () => {
    document.body.removeChild(overlay);
    if (onConfirm) onConfirm();
  });
  
  dialog.querySelector('.btn-confirm-cancel').addEventListener('click', () => {
    document.body.removeChild(overlay);
    if (onCancel) onCancel();
  });
}

// Scroll reveal animations
window.addEventListener('load', () => {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  });
  document.querySelectorAll('.product-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
});

// ── PROFILE TAB SWITCHING ──────────────────────────────────
function switchProfileTab(tabName) {
  // Update active tab button
  document.querySelectorAll('.profile-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  
  // Update active content pane
  document.querySelectorAll('.profile-tab-content').forEach(pane => {
    pane.classList.toggle('active', pane.id === `profileTab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
  });
}