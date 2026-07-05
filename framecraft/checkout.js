// ============================================================
// CHECKOUT PAGE FUNCTIONALITY
// ============================================================

const SHIPPING_COST = 100;
const TAX_RATE = 0.12; // 12% tax
let savedDeliveryInfo = null; // Store saved addresses
let savedPaymentInfo = null; // Store saved payment methods
let currentSelectedAddressIdx = null; // Track selected address index
let isUsingSavedPayment = false; // Track if in saved payment mode
let activePromo = null; // Store active promo code details { code, type, value }

// ── INIT ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Initialize default coupons if they don't exist
  if (!localStorage.getItem('promoCoupons')) {
    const defaultCoupons = [
      { code: 'WELCOME10', type: 'percentage', value: 10 },
      { code: 'FREESHIP', type: 'free-shipping', value: 0 },
      { code: 'FRAMECRAFT500', type: 'fixed', value: 500 }
    ];
    localStorage.setItem('promoCoupons', JSON.stringify(defaultCoupons));
  }

  // Check authentication
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

  // Pre-fill email with user's email
  document.getElementById('email').value = user.email;

  // Load and store saved delivery information if available
  if (user.addresses && user.addresses.length > 0) {
    savedDeliveryInfo = user.addresses;
    populateSavedAddresses(savedDeliveryInfo);
    // Load default address or first address
    const defaultAddr = savedDeliveryInfo.find(a => a.isDefault) || savedDeliveryInfo[0];
    if (defaultAddr) {
      const defaultIdx = savedDeliveryInfo.indexOf(defaultAddr);
      currentSelectedAddressIdx = defaultIdx;
      // Set dropdown value first
      const selectElement = document.getElementById('savedAddressSelect');
      if (selectElement) {
        selectElement.value = defaultIdx;
      }
      // Fill form and display summary
      loadSavedDeliveryInfo(defaultAddr);
      displayAddressSummary(defaultAddr);
      // Show summary
      const summary = document.getElementById('selectedAddressSummary');
      if (summary) {
        summary.style.display = 'block';
      }
    }
  } else {
    // No saved addresses, show manual entry by default
    document.getElementById('manualEntryBtn').click();
  }

  // Load and store saved payment methods if available
  if (user.paymentMethods && user.paymentMethods.length > 0) {
    savedPaymentInfo = user.paymentMethods;
    document.getElementById('paymentModeToggle').style.display = 'flex';
    populateSavedPayments(savedPaymentInfo);
    // Auto-select default payment method and activate saved payment mode
    const defaultPayment = savedPaymentInfo.find(p => p.isDefault) || savedPaymentInfo[0];
    if (defaultPayment) {
      const defaultPaymentIdx = savedPaymentInfo.indexOf(defaultPayment);
      document.getElementById('savedPaymentSelect').value = defaultPaymentIdx;
      // Activate Use Saved Payment mode
      useSavedPayment();
    }
  }

  // Load and display cart
  displayCartSummary();

  // Setup payment method listeners
  setupPaymentMethodListeners();
});

// ── PAYMENT METHOD LISTENERS ────────────────────────────
function setupPaymentMethodListeners() {
  const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
  paymentRadios.forEach(radio => {
    radio.addEventListener('change', handlePaymentMethodChange);
  });
}

// ── LOAD SAVED DELIVERY INFO ────────────────────────────
function loadSavedDeliveryInfo(info) {
  if (!info) return; // No saved delivery info

  // Pre-fill form fields from saved profile data
  document.getElementById('fullName').value = info.name || '';
  // Ensure email is set from user account
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.email) {
    document.getElementById('email').value = user.email;
  }
  document.getElementById('phone').value = info.phone || '';
  document.getElementById('address').value = info.street || '';
  document.getElementById('city').value = info.city || '';
  document.getElementById('state').value = info.state || '';
  document.getElementById('zipCode').value = info.zipCode || '';
  document.getElementById('country').value = info.country || 'Philippines';
}

// ── POPULATE SAVED ADDRESSES DROPDOWN ────────────────────
function populateSavedAddresses(addresses) {
  const select = document.getElementById('savedAddressSelect');
  if (!select) return;
  
  select.innerHTML = addresses.map((addr, idx) => `
    <option value="${idx}">
      ${addr.name} - ${addr.street}, ${addr.city}
      ${addr.isDefault ? ' (Default)' : ''}
    </option>
  `).join('');
}

// ── LOAD SELECTED ADDRESS FROM DROPDOWN ──────────────────
function loadSelectedAddress() {
  const idx = document.getElementById('savedAddressSelect').value;
  if (idx === '') return;
  
  const address = savedDeliveryInfo[idx];
  if (address) {
    currentSelectedAddressIdx = idx;
    loadSavedDeliveryInfo(address);
    displayAddressSummary(address);
  }
}

// ── DISPLAY ADDRESS SUMMARY ──────────────────────────────
function displayAddressSummary(address) {
  const summary = document.getElementById('selectedAddressDisplay');
  if (!summary) return;
  
  summary.innerHTML = `
    <div class="address-summary-content">
      <p><strong>${address.name}</strong></p>
      <p>${address.street}</p>
      <p>${address.city}, ${address.state} ${address.zipCode}</p>
      <p>${address.country}</p>
      <p class="phone-summary">☎️ ${address.phone}</p>
    </div>
  `;
}

// ── USE SAVED INFO MODE ──────────────────────────────────
function useSavedInfo() {
  if (!savedDeliveryInfo || savedDeliveryInfo.length === 0) {
    showToast('No saved addresses available', 'warning');
    return;
  }
  
  // Update button states
  document.getElementById('useSavedBtn').classList.add('active');
  document.getElementById('manualEntryBtn').classList.remove('active');
  
  // Show/hide dropdown and summary
  const container = document.getElementById('savedAddressesContainer');
  if (container) {
    container.classList.remove('hidden');
  }
  
  const summary = document.getElementById('selectedAddressSummary');
  if (summary) {
    summary.style.display = 'block';
  }
  
  // Load selected address (or first if none selected)
  const dropdown = document.getElementById('savedAddressSelect');
  if (!dropdown.value) {
    dropdown.value = 0;
  }
  loadSelectedAddress();
}

// ── USE MANUAL ENTRY MODE ───────────────────────────────
function useManualEntry() {
  // Update button states
  document.getElementById('manualEntryBtn').classList.add('active');
  document.getElementById('useSavedBtn').classList.remove('active');
  
  // Hide dropdown
  const container = document.getElementById('savedAddressesContainer');
  if (container) {
    container.classList.add('hidden');
  }

  // Hide summary
  const summary = document.getElementById('selectedAddressSummary');
  if (summary) {
    summary.style.display = 'none';
  }
  
  // Clear all form fields
  document.getElementById('fullName').value = '';
  document.getElementById('phone').value = '';
  document.getElementById('address').value = '';
  document.getElementById('city').value = '';
  document.getElementById('state').value = '';
  document.getElementById('zipCode').value = '';
  document.getElementById('country').value = 'Philippines';
  // Keep email from user account
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    document.getElementById('email').value = user.email;
  }
}

// ── POPULATE SAVED PAYMENT METHODS DROPDOWN ──────────────
function populateSavedPayments(payments) {
  const select = document.getElementById('savedPaymentSelect');
  if (!select) return;
  
  select.innerHTML = payments.map((payment, idx) => {
    let label = '';
    if (payment.method === 'credit-card') {
      label = `💳 Card ending in ${payment.cardNumber.slice(-4)}`;
    } else if (payment.method === 'paypal') {
      label = `🅿️ PayPal - ${payment.paypalEmail}`;
    } else if (payment.method === 'maya') {
      label = `🏦 Maya - ${payment.mayaEmail}`;
    } else if (payment.method === 'gcash') {
      label = `📱 GCash - ${payment.gcashMobile}`;
    }
    
    return `
      <option value="${idx}">
        ${label}
        ${payment.isDefault ? ' (Default)' : ''}
      </option>
    `;
  }).join('');
}

// ── LOAD SELECTED PAYMENT METHOD ─────────────────────────
function loadSelectedPayment() {
  const idx = document.getElementById('savedPaymentSelect').value;
  if (idx === '' || !savedPaymentInfo || !savedPaymentInfo[idx]) return;
  
  const payment = savedPaymentInfo[idx];
  
  // Show the appropriate payment detail section
  showPaymentDetailSection(payment.method);
  
  // Fill in payment details
  if (payment.method === 'credit-card') {
    document.getElementById('cardName').value = payment.cardName || '';
    document.getElementById('cardNumber').value = payment.cardNumber || '';
    document.getElementById('cardExpiry').value = payment.cardExpiry || '';
    document.getElementById('cardCvv').value = payment.cardCvv || '';
  } else if (payment.method === 'paypal') {
    document.getElementById('paypalEmail').value = payment.paypalEmail || '';
    document.getElementById('paypalPassword').value = payment.paypalPassword || '';
  } else if (payment.method === 'maya') {
    document.getElementById('mayaEmail').value = payment.mayaEmail || '';
    document.getElementById('mayaMobile').value = payment.mayaMobile || '';
  } else if (payment.method === 'gcash') {
    document.getElementById('gcashMobile').value = payment.gcashMobile || '';
    document.getElementById('gcashPin').value = payment.gcashPin || '';
  }
}

// ── SHOW PAYMENT DETAIL SECTION ──────────────────────────
function showPaymentDetailSection(methodType) {
  const sections = {
    'credit-card': 'creditCardDetails',
    'paypal': 'paypalDetails',
    'maya': 'mayaDetails',
    'gcash': 'gcashDetails'
  };
  
  // Hide and remove class from all sections
  Object.values(sections).forEach(sectionId => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.classList.remove('show');
      section.style.display = 'none !important';
    }
  });
  
  // Show the selected section
  const sectionToShow = sections[methodType];
  if (sectionToShow) {
    const section = document.getElementById(sectionToShow);
    if (section) {
      section.classList.add('show');
      section.style.display = 'block !important';
    }
  }
}

// ── SELECT PAYMENT METHOD BY VALUE ───────────────────────
function selectPaymentMethod(methodValue) {
  const radioButton = document.querySelector(`input[name="paymentMethod"][value="${methodValue}"]`);
  if (radioButton) {
    radioButton.checked = true;
    radioButton.dispatchEvent(new Event('change'));
  }
}

// ── USE SAVED PAYMENT MODE ──────────────────────────────
function useSavedPayment() {
  if (!savedPaymentInfo || savedPaymentInfo.length === 0) {
    showToast('No saved payment methods available', 'warning');
    return;
  }
  
  isUsingSavedPayment = true;
  
  // Update button states
  document.getElementById('useSavedPaymentBtn').classList.add('active');
  document.getElementById('manualPaymentBtn').classList.remove('active');
  
  // Show/hide containers
  document.getElementById('savedPaymentContainer').style.display = 'block';
  document.getElementById('paymentForm').style.display = 'none';
  
  // Uncheck all radio buttons
  const radios = document.querySelectorAll('input[name="paymentMethod"]');
  radios.forEach(radio => {
    radio.checked = false;
  });
  
  // Hide all payment details using the payment details class
  const allDetails = document.querySelectorAll('.payment-details');
  allDetails.forEach(detail => {
    detail.classList.remove('show');
    detail.style.display = 'none !important';
  });
  
  // Load and display the selected payment method
  loadSelectedPayment();
}

// ── USE MANUAL PAYMENT MODE ─────────────────────────────
function useManualPayment() {
  isUsingSavedPayment = false;
  
  // Update button states
  document.getElementById('manualPaymentBtn').classList.add('active');
  document.getElementById('useSavedPaymentBtn').classList.remove('active');
  
  // Show/hide payment method selection
  document.getElementById('savedPaymentContainer').style.display = 'none';
  document.getElementById('paymentForm').style.display = 'block';
  
  // Clear payment fields
  document.getElementById('cardName').value = '';
  document.getElementById('cardNumber').value = '';
  document.getElementById('cardExpiry').value = '';
  document.getElementById('cardCvv').value = '';
  document.getElementById('paypalEmail').value = '';
  document.getElementById('paypalPassword').value = '';
  document.getElementById('mayaEmail').value = '';
  document.getElementById('mayaMobile').value = '';
  document.getElementById('gcashMobile').value = '';
  document.getElementById('gcashPin').value = '';
  
  // Reset to credit card by default
  document.getElementById('creditCard').checked = true;
  
  // Show credit card details
  const detailSections = ['creditCardDetails', 'paypalDetails', 'mayaDetails', 'gcashDetails'];
  detailSections.forEach(sectionId => {
    const section = document.getElementById(sectionId);
    if (section) {
      if (sectionId === 'creditCardDetails') {
        section.style.display = 'block !important';
        section.classList.add('show');
      } else {
        section.style.display = 'none !important';
        section.classList.remove('show');
      }
    }
  });
}

function handlePaymentMethodChange(e) {
  // Don't handle payment method changes in saved payment mode
  if (isUsingSavedPayment) {
    return;
  }
  
  const creditCardDetails = document.getElementById('creditCardDetails');
  const paypalDetails = document.getElementById('paypalDetails');
  const mayaDetails = document.getElementById('mayaDetails');
  const gcashDetails = document.getElementById('gcashDetails');

  // Hide all payment details first
  creditCardDetails.classList.remove('show');
  paypalDetails.classList.remove('show');
  mayaDetails.classList.remove('show');
  gcashDetails.classList.remove('show');

  // Show the selected payment method's details
  switch(e.target.value) {
    case 'credit-card':
      creditCardDetails.classList.add('show');
      break;
    case 'paypal':
      paypalDetails.classList.add('show');
      break;
    case 'maya':
      mayaDetails.classList.add('show');
      break;
    case 'gcash':
      gcashDetails.classList.add('show');
      break;
  }
}

// ── DISPLAY CART SUMMARY ────────────────────────────────
function displayCartSummary() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const cartItemsContainer = document.getElementById('cartItemsSummary');
  const checkoutContent = document.querySelector('.checkout-content');
  const emptyCartView = document.getElementById('emptyCartView');

  if (cart.length === 0) {
    if (checkoutContent) checkoutContent.style.display = 'none';
    if (emptyCartView) emptyCartView.style.display = 'block';
    if (cartItemsContainer) cartItemsContainer.innerHTML = '<p style="text-align:center;color:#8fa4bb;">Your cart is empty</p>';
    updateOrderTotal();
    return;
  } else {
    if (checkoutContent) checkoutContent.style.display = '';
    if (emptyCartView) emptyCartView.style.display = 'none';
  }

  cartItemsContainer.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-image">
        ${item.image ? `<img src="${item.image}" alt="${item.name}">` : '<span>🕶️</span>'}
      </div>
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-meta">
          Size: ${item.size}
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="decreaseQuantity('${item.id}')">−</button>
          <span class="qty-display">${item.quantity}</span>
          <button class="qty-btn" onclick="increaseQuantity('${item.id}')">+</button>
          <button class="remove-btn" onclick="removeItem('${item.id}')">Remove</button>
        </div>
      </div>
      <div class="cart-item-price">
        ₱${(parseFloat(item.price.replace('₱', '')) * item.quantity).toFixed(2)}
      </div>
    </div>
  `).join('');

  updateOrderTotal();
}

// ── UPDATE ORDER TOTAL ──────────────────────────────────
function updateOrderTotal() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');

  // If cart is empty, set all totals to 0
  if (cart.length === 0) {
    document.getElementById('subtotal').textContent = '₱0.00';
    document.getElementById('tax').textContent = '₱0.00';
    document.getElementById('total').textContent = '₱0.00';
    
    // Hide discount row
    const discountRow = document.getElementById('discountRow');
    if (discountRow) discountRow.style.display = 'none';

    // Disable Place Order button
    const placeOrderBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Place Order'));
    if (placeOrderBtn) {
      placeOrderBtn.disabled = true;
      placeOrderBtn.style.opacity = '0.5';
      placeOrderBtn.style.cursor = 'not-allowed';
    }
    return;
  }

  // Calculate subtotal
  const subtotal = cart.reduce((sum, item) => {
    const price = parseFloat(item.price.replace('₱', ''));
    return sum + (price * item.quantity);
  }, 0);

  let discount = 0;
  let shippingCost = SHIPPING_COST;

  // Apply active promo if set
  if (activePromo) {
    if (activePromo.type === 'percentage') {
      discount = subtotal * (activePromo.value / 100);
    } else if (activePromo.type === 'fixed') {
      discount = activePromo.value;
    } else if (activePromo.type === 'free-shipping') {
      discount = 0;
      shippingCost = 0;
    }
    discount = Math.min(discount, subtotal); // Discount cannot exceed subtotal
  }

  // Calculate tax on discounted subtotal
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const tax = discountedSubtotal * TAX_RATE;

  // Calculate total
  const total = discountedSubtotal + shippingCost + tax;

  // Update display
  document.getElementById('subtotal').textContent = `₱${subtotal.toFixed(2)}`;
  
  const discountRow = document.getElementById('discountRow');
  const discountName = document.getElementById('discountName');
  const discountValue = document.getElementById('discountValue');
  
  if (activePromo) {
    if (discountRow) discountRow.style.display = 'flex';
    if (discountName) discountName.textContent = activePromo.code;
    if (discountValue) {
      if (activePromo.type === 'free-shipping') {
        discountValue.textContent = '-₱100.00 (Free)';
      } else {
        discountValue.textContent = `-₱${discount.toFixed(2)}`;
      }
    }
  } else {
    if (discountRow) discountRow.style.display = 'none';
  }

  document.getElementById('shipping').textContent = `₱${shippingCost.toFixed(2)}`;
  document.getElementById('tax').textContent = `₱${tax.toFixed(2)}`;
  document.getElementById('total').textContent = `₱${total.toFixed(2)}`;

  // Enable Place Order button
  const placeOrderBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Place Order'));
  if (placeOrderBtn) {
    placeOrderBtn.disabled = false;
    placeOrderBtn.style.opacity = '1';
    placeOrderBtn.style.cursor = 'pointer';
  }
}

// ── VALIDATE DELIVERY FORM ──────────────────────────────
function validateDeliveryForm() {
  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const city = document.getElementById('city').value.trim();
  const state = document.getElementById('state').value.trim();
  const zipCode = document.getElementById('zipCode').value.trim();
  const country = document.getElementById('country').value.trim();

  if (!fullName || !email || !phone || !address || !city || !state || !zipCode || !country) {
    showToast('Please fill in all delivery information fields', 'error');
    return false;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showToast('Please enter a valid email address', 'error');
    return false;
  }

  // Phone validation
  const phoneRegex = /^[\d\+\-\(\)\s]+$/;
  if (!phoneRegex.test(phone) || phone.length < 10) {
    showToast('Please enter a valid phone number', 'error');
    return false;
  }

  return true;
}

// ── VALIDATE PAYMENT INFO ───────────────────────────────
function validatePaymentInfo() {
  // If using saved payment, just check that we have a selection
  if (isUsingSavedPayment) {
    const idx = document.getElementById('savedPaymentSelect').value;
    if (idx === '' || !savedPaymentInfo || !savedPaymentInfo[idx]) {
      showToast('Please select a payment method', 'error');
      return false;
    }
    return true;
  }
  
  // Otherwise validate the manual entry form
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
  if (!paymentMethod) {
    showToast('Please select a payment method', 'error');
    return false;
  }
  
  const method = paymentMethod.value;

  if (method === 'credit-card') {
    const cardName = document.getElementById('cardName').value.trim();
    const cardNumber = document.getElementById('cardNumber').value.trim();
    const cardExpiry = document.getElementById('cardExpiry').value.trim();
    const cardCvv = document.getElementById('cardCvv').value.trim();

    if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
      showToast('Please fill in all credit card details', 'error');
      return false;
    }

    // Card number validation (basic)
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      showToast('Please enter a valid 16-digit card number', 'error');
      return false;
    }

    // Expiry validation
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test(cardExpiry)) {
      showToast('Please enter expiry date in MM/YY format', 'error');
      return false;
    }

    // CVV validation
    if (cardCvv.length !== 3 || isNaN(cardCvv)) {
      showToast('Please enter a valid 3-digit CVV', 'error');
      return false;
    }
  } else if (method === 'paypal') {
    const paypalEmail = document.getElementById('paypalEmail').value.trim();
    const paypalPassword = document.getElementById('paypalPassword').value.trim();

    if (!paypalEmail || !paypalPassword) {
      showToast('Please fill in all PayPal details', 'error');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(paypalEmail)) {
      showToast('Please enter a valid PayPal email', 'error');
      return false;
    }

    if (paypalPassword.length < 6) {
      showToast('PayPal password must be at least 6 characters', 'error');
      return false;
    }
  } else if (method === 'maya') {
    const mayaEmail = document.getElementById('mayaEmail').value.trim();
    const mayaMobile = document.getElementById('mayaMobile').value.trim();

    if (!mayaEmail || !mayaMobile) {
      showToast('Please fill in all Maya details', 'error');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(mayaEmail)) {
      showToast('Please enter a valid email', 'error');
      return false;
    }

    const phoneRegex = /^[\d\+\-\(\)\s]+$/;
    if (!phoneRegex.test(mayaMobile) || mayaMobile.length < 10) {
      showToast('Please enter a valid mobile number', 'error');
      return false;
    }
  } else if (method === 'gcash') {
    const gcashMobile = document.getElementById('gcashMobile').value.trim();
    const gcashPin = document.getElementById('gcashPin').value.trim();

    if (!gcashMobile || !gcashPin) {
      showToast('Please fill in all GCash details', 'error');
      return false;
    }

    const phoneRegex = /^[\d\+\-\(\)\s]+$/;
    if (!phoneRegex.test(gcashMobile) || gcashMobile.length < 10) {
      showToast('Please enter a valid GCash mobile number', 'error');
      return false;
    }

    if (gcashPin.length !== 4 || isNaN(gcashPin)) {
      showToast('Please enter a valid 4-digit PIN', 'error');
      return false;
    }
  }

  return true;
}

// ── PLACE ORDER ─────────────────────────────────────────
function placeOrder() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  
  // Check if cart is empty
  if (cart.length === 0) {
    showToast('Your cart is empty. Add items to place an order.', 'error');
    return;
  }

  // Validate
  if (!validateDeliveryForm() || !validatePaymentInfo()) {
    return;
  }

  // Get payment method based on mode
  let paymentMethod;
  let paymentData = {};
  
  if (isUsingSavedPayment) {
    // Get from saved payment method
    const idx = document.getElementById('savedPaymentSelect').value;
    if (idx === '' || !savedPaymentInfo || !savedPaymentInfo[idx]) {
      showToast('Please select a payment method', 'error');
      return;
    }
    
    const savedPayment = savedPaymentInfo[idx];
    paymentMethod = savedPayment.method;
    
    // Create payment data from saved method
    if (paymentMethod === 'credit-card') {
      paymentData = {
        method: 'credit-card',
        cardName: savedPayment.cardName,
        cardLast4: savedPayment.cardNumber.slice(-4)
      };
    } else if (paymentMethod === 'paypal') {
      paymentData = {
        method: 'paypal',
        email: savedPayment.paypalEmail
      };
    } else if (paymentMethod === 'maya') {
      paymentData = {
        method: 'maya',
        email: savedPayment.mayaEmail,
        mobile: savedPayment.mayaMobile
      };
    } else if (paymentMethod === 'gcash') {
      paymentData = {
        method: 'gcash',
        mobile: savedPayment.gcashMobile
      };
    }
  } else {
    // Get from radio buttons
    const checkedRadio = document.querySelector('input[name="paymentMethod"]:checked');
    if (!checkedRadio) {
      showToast('Please select a payment method', 'error');
      return;
    }
    
    paymentMethod = checkedRadio.value;
    
    // Collect payment info based on method
    if (paymentMethod === 'credit-card') {
      paymentData = {
        method: 'credit-card',
        cardName: document.getElementById('cardName').value,
        cardLast4: document.getElementById('cardNumber').value.slice(-4)
      };
    } else if (paymentMethod === 'paypal') {
      paymentData = {
        method: 'paypal',
        email: document.getElementById('paypalEmail').value
      };
    } else if (paymentMethod === 'maya') {
      paymentData = {
        method: 'maya',
        email: document.getElementById('mayaEmail').value,
        mobile: document.getElementById('mayaMobile').value
      };
    } else if (paymentMethod === 'gcash') {
      paymentData = {
        method: 'gcash',
        mobile: document.getElementById('gcashMobile').value
      };
    }
  }

  const discountValEl = document.getElementById('discountValue');
  const discountAmount = (activePromo && discountValEl) 
    ? parseFloat(discountValEl.textContent.replace('-₱', '').replace(/,/g, '')) 
    : 0;

  // Collect order data
  const orderData = {
    orderId: generateOrderId(),
    timestamp: new Date().toISOString(),
    user: JSON.parse(localStorage.getItem('user')),
    isConfirmed: false,
    status: 'Order Placed',
    delivery: {
      fullName: document.getElementById('fullName').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      address: document.getElementById('address').value,
      city: document.getElementById('city').value,
      state: document.getElementById('state').value,
      zipCode: document.getElementById('zipCode').value,
      country: document.getElementById('country').value
    },
    payment: paymentData,
    items: cart,
    summary: {
      subtotal: parseFloat(document.getElementById('subtotal').textContent.replace('₱', '').replace(/,/g, '')),
      shipping: parseFloat(document.getElementById('shipping').textContent.replace('₱', '').replace(/,/g, '')),
      tax: parseFloat(document.getElementById('tax').textContent.replace('₱', '').replace(/,/g, '')),
      discount: activePromo ? {
        code: activePromo.code,
        type: activePromo.type,
        value: activePromo.value,
        amount: discountAmount
      } : null,
      total: parseFloat(document.getElementById('total').textContent.replace('₱', '').replace(/,/g, ''))
    }
  };

  // Save order to localStorage
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  orders.push(orderData);
  localStorage.setItem('orders', JSON.stringify(orders));

  // Decrement product stock levels
  cart.forEach(item => {
    const prodId = item.productId || parseInt(String(item.id).split('-')[0]);
    if (prodId && productStock[prodId]) {
      const currentStock = productStock[prodId];
      const newLimit = Math.max(0, currentStock.limit - item.quantity);
      productStock[prodId] = {
        inStock: newLimit > 0,
        limit: newLimit
      };
    }
  });

  // Save payment method if checkbox is checked (only in manual mode)
  if (!isUsingSavedPayment && document.getElementById('savePaymentMethod').checked) {
    savePaymentMethod();
  }

  // Clear cart
  localStorage.removeItem('cart');

  // Show success message
  showToast('Order placed successfully!', 'success');

  // Redirect to confirmation page (or delivery status)
  setTimeout(() => {
    window.location.href = 'deliverystat.html';
  }, 2000);
}

// ── SAVE PAYMENT METHOD ──────────────────────────────────
function savePaymentMethod() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return;

  if (!user.paymentMethods) {
    user.paymentMethods = [];
  }

  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
  let paymentData = {
    method: paymentMethod,
    isDefault: user.paymentMethods.length === 0 // First payment becomes default
  };

  // Collect full payment info based on method
  if (paymentMethod === 'credit-card') {
    paymentData = {
      ...paymentData,
      cardName: document.getElementById('cardName').value,
      cardNumber: document.getElementById('cardNumber').value,
      cardExpiry: document.getElementById('cardExpiry').value,
      cardCvv: document.getElementById('cardCvv').value
    };
  } else if (paymentMethod === 'paypal') {
    paymentData = {
      ...paymentData,
      paypalEmail: document.getElementById('paypalEmail').value,
      paypalPassword: document.getElementById('paypalPassword').value
    };
  } else if (paymentMethod === 'maya') {
    paymentData = {
      ...paymentData,
      mayaEmail: document.getElementById('mayaEmail').value,
      mayaMobile: document.getElementById('mayaMobile').value
    };
  } else if (paymentMethod === 'gcash') {
    paymentData = {
      ...paymentData,
      gcashMobile: document.getElementById('gcashMobile').value,
      gcashPin: document.getElementById('gcashPin').value
    };
  }

  // Check if this payment method already exists (same type and key identifier)
  const exists = user.paymentMethods.some(pm => {
    if (pm.method !== paymentMethod) return false;
    if (paymentMethod === 'credit-card') return pm.cardNumber === paymentData.cardNumber;
    if (paymentMethod === 'paypal') return pm.paypalEmail === paymentData.paypalEmail;
    if (paymentMethod === 'maya') return pm.mayaEmail === paymentData.mayaEmail;
    if (paymentMethod === 'gcash') return pm.gcashMobile === paymentData.gcashMobile;
    return false;
  });

  if (!exists) {
    user.paymentMethods.push(paymentData);
    localStorage.setItem('user', JSON.stringify(user));
    showToast('Payment method saved!', 'success');
  }
}


// ── GENERATE ORDER ID ───────────────────────────────────
function generateOrderId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${randomStr}`;
}

// ── BACK TO SHOP ────────────────────────────────────────
function backToShop() {
  window.location.href = 'shop.html';
}

// ── CART MANAGEMENT: REMOVE ITEM ────────────────────────
function removeItem(itemId) {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const updatedCart = cart.filter(item => String(item.id) !== String(itemId));
  localStorage.setItem('cart', JSON.stringify(updatedCart));
  displayCartSummary();
  showToast('Item removed from cart', 'success');
}

// ── CART MANAGEMENT: INCREASE QUANTITY ──────────────────
function increaseQuantity(itemId) {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const item = cart.find(i => String(i.id) === String(itemId));
  if (item) {
    const prodId = item.productId || parseInt(String(itemId).split('-')[0]);
    const stock = productStock[prodId];
    if (stock && item.quantity >= stock.limit) {
      showToast(`Cannot exceed available stock of ${stock.limit}`, 'warning');
      return;
    }
    item.quantity += 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartSummary();
  }
}

// ── CART MANAGEMENT: DECREASE QUANTITY ──────────────────
function decreaseQuantity(itemId) {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const item = cart.find(i => String(i.id) === String(itemId));
  if (item) {
    if (item.quantity > 1) {
      item.quantity -= 1;
      localStorage.setItem('cart', JSON.stringify(cart));
      displayCartSummary();
    } else {
      removeItem(itemId);
    }
  }
}

// ── TOAST NOTIFICATION ──────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠'
  };

  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 250);
  }, 3000);
}

// ── FORMAT CARD NUMBER ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Format card number with spaces
  const cardNumberInput = document.getElementById('cardNumber');
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\s/g, '');
      let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
      e.target.value = formattedValue;
    });
  }

  // Allow only numbers for GCash PIN
  const gcashPinInput = document.getElementById('gcashPin');
  if (gcashPinInput) {
    gcashPinInput.addEventListener('input', function(e) {
      e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    });
  }

  // Allow only numbers and special chars for phone numbers
  const phoneInputs = [document.getElementById('phone'), document.getElementById('mayaMobile'), document.getElementById('gcashMobile')];
  phoneInputs.forEach(input => {
    if (input) {
      input.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/[^0-9\+\-\(\)\s]/g, '');
      });
    }
  });

  // Allow only numbers for CVV
  const cvvInput = document.getElementById('cardCvv');
  if (cvvInput) {
    cvvInput.addEventListener('input', function(e) {
      e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 3);
    });
  }
});

// ── APPLY PROMO CODE ────────────────────────────────────
function applyPromoCode() {
  const codeInput = document.getElementById('promoCodeInput');
  const feedback = document.getElementById('promoFeedback');
  if (!codeInput || !feedback) return;

  const code = codeInput.value.trim().toUpperCase();
  if (!code) {
    feedback.style.display = 'block';
    feedback.style.color = '#ef4444'; // var(--red)
    feedback.textContent = 'Please enter a coupon code!';
    return;
  }

  const coupons = JSON.parse(localStorage.getItem('promoCoupons') || '[]');
  const coupon = coupons.find(c => c.code.toUpperCase() === code);

  if (!coupon) {
    feedback.style.display = 'block';
    feedback.style.color = '#ef4444'; // var(--red)
    feedback.textContent = 'Invalid promo code. Please try another one.';
    activePromo = null;
    updateOrderTotal();
    return;
  }

  // Set active promo
  activePromo = coupon;
  feedback.style.display = 'block';
  feedback.style.color = '#22c55e'; // var(--green)
  
  let desc = '';
  if (coupon.type === 'percentage') desc = `${coupon.value}% Off`;
  else if (coupon.type === 'fixed') desc = `₱${parseFloat(coupon.value).toFixed(2)} Off`;
  else if (coupon.type === 'free-shipping') desc = 'Free Shipping';

  feedback.textContent = `Promo code "${coupon.code}" (${desc}) applied successfully!`;
  
  updateOrderTotal();
}
