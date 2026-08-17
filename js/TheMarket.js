// ==========================================
// HELPER FUNCTIONS
// ==========================================
function calculateDiscountedPrice(price, discount) {
    if (!discount)
        return price;
    const normalized = discount.replace(/[%\s]/g, '');
    const numeric = Math.abs(Number(normalized));
    if (Number.isNaN(numeric) || numeric <= 0)
        return price;
    return Number((price - (price * numeric) / 100).toFixed(2));
}
function formatPrice(value) {
    const theCoin = localStorage.getItem('coin') || 'SAR';
    return `${value.toFixed(2)} ${theCoin}`;
}
function switchCurrency(price, target) {
    const currentCoin = localStorage.getItem('coin') || 'SAR';
    if (currentCoin === target) {
        return price;
    }
    let converted;
    if (target === 'USD') {
        converted = price * 0.2665;
    }
    else {
        converted = price * 3.75;
    }
    localStorage.setItem('coin', target);
    return converted;
}
function isProductInCart(productId) {
    return ibuy.some(item => String(item.id) === String(productId));
}
function isProductInWishlist(productId) {
    return wishlistItems.some(item => String(item.id) === String(productId));
}
function scrollToProductCard(productId) {
    const card = Array.from(document.querySelectorAll('.product-card'))
        .find(item => item.getAttribute('data-id') === String(productId));
    if (!card)
        return;
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.classList.add('ring-2', 'ring-gh-gold', 'ring-offset-2', 'ring-offset-[var(--bg)]');
    window.setTimeout(() => {
        card.classList.remove('ring-2', 'ring-gh-gold', 'ring-offset-2', 'ring-offset-[var(--bg)]');
    }, 1800);
}
function readLocalStorageJSON(key, fallback) {
    const raw = localStorage.getItem(key);
    if (!raw)
        return fallback;
    try {
        return JSON.parse(raw);
    }
    catch (error) {
        console.error(`Invalid localStorage data for ${key}:`, error);
        return fallback;
    }
}
function getAccountIdentity() {
    const currentUserRaw = localStorage.getItem('currentUser');
    if (currentUserRaw) {
        try {
            const user = JSON.parse(currentUserRaw);
            const identity = user?.email || user?.id || user?.username || user?.name;
            if (identity)
                return String(identity).trim().toLowerCase();
        }
        catch (error) {
            console.error('Error parsing current user data:', error);
        }
    }
    return 'guest';
}
function getStorageKey(featureName) {
    return `${featureName}_${getAccountIdentity()}`;
}
function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
function parseRating(value) {
    const parsed = Number.parseFloat(String(value ?? 0));
    return Number.isFinite(parsed) ? clamp(parsed, 0, 5) : 0;
}
function escapeHTML(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
// ==========================================
// STATE INITIALIZATION FROM LOCALSTORAGE
// ==========================================
const lovesKey = getStorageKey('ilove');
let wishlistItems = readLocalStorageJSON(lovesKey, []);
const cartKey = getStorageKey('cart');
let ibuy = readLocalStorageJSON(cartKey, []);
const ordersKey = getStorageKey('orders');
let userOrders = readLocalStorageJSON(ordersKey, []);
const productStatsStorageKey = 'market_product_stats_v1';
let productStats = readLocalStorageJSON(productStatsStorageKey, {});
let suggestions = [];
let globalProductsList = [];
const productQuantityInputs = new Map();
// ==========================================
// DOM REFERENCES (for cart, wishlist, etc.)
// ==========================================
const productTemplate = document.getElementById('product-card-template');
const productGrid = document.getElementById('product-grid');
const wishBadge = document.getElementById('wishBadge');
const wishGrid = document.querySelector('#wishGrid');
const wishlistEmptyMsg = document.querySelector('#wishlistEmptyMsg');
const cartTotalLabel = document.getElementById('cartTotalLabel');
const cartTotalValue = document.getElementById('cartTotalValue');
// Find the existing checkout button without attaching print logic.
const btnCheckout = document.querySelector('button[id^="btn"][id$="Invoice"]');
const cartEmptyMsg = document.getElementById('cartEmptyMsg');
const cartItemsList = document.getElementById('cartItemsList');
const cartSuggestions = document.getElementById('cartSuggestions');
const suggestionmasg = document.getElementById('cartSuggestionsTitle');
const cartBadge = document.getElementById('cartBadge');
const userOrdersContainer = document.getElementById('userOrdersContainer');
const emptyOrdersNotice = document.getElementById('emptyOrdersNotice');
const ordersCountBadge = document.getElementById('ordersCountBadge');
// ==========================================
// PERSISTENCE HELPERS
// ==========================================
function saveWishlist() {
    localStorage.setItem(lovesKey, JSON.stringify(wishlistItems));
}
function saveCart() {
    localStorage.setItem(cartKey, JSON.stringify(ibuy));
}
function saveOrders() {
    localStorage.setItem(ordersKey, JSON.stringify(userOrders));
}
function saveProductStats() {
    localStorage.setItem(productStatsStorageKey, JSON.stringify(productStats));
}
function getProductStats(product) {
    const id = String(product.id);
    const existing = productStats[id];
    const safeStats = {
        stock: Math.max(0, Number(existing?.stock ?? product.stock) || 0),
        purchasesCount: Math.max(0, Number(existing?.purchasesCount ?? product.purchasesCount) || 0),
        baseRating: parseRating(existing?.baseRating ?? product.rating),
        baseReviewsCount: Math.max(0, Number(existing?.baseReviewsCount ?? product.reviewsCount) || 0),
        ratingsByAccount: existing?.ratingsByAccount && typeof existing.ratingsByAccount === 'object'
            ? existing.ratingsByAccount
            : {},
    };
    productStats[id] = safeStats;
    return safeStats;
}
function getValidRatingCount(stats) {
    return Object.values(stats.ratingsByAccount).filter(value => parseRating(value) > 2).length;
}
function getRatingBonus(stats) {
    let currentRating = clamp(stats.baseRating, 0, 5);
    let bonus = 0;
    const ratings = Object.values(stats.ratingsByAccount)
        .map(parseRating)
        .filter(rating => rating > 2)
        .sort((a, b) => b - a);
    // Each pair comes from different accounts because the object key is the account identity.
    for (let index = 0; index + 1 < ratings.length; index += 2) {
        const first = ratings[index];
        const second = ratings[index + 1];
        if (first === undefined || second === undefined)
            continue;
        const pairTarget = Math.min(first, second);
        // Ignore ratings that do not exceed the current product rating.
        if (pairTarget <= currentRating)
            continue;
        // An equal pair may add two stars, but never beyond the submitted rating.
        const requestedBonus = first === second ? 2 : 1;
        const allowedBonus = Math.min(requestedBonus, pairTarget - currentRating, 5 - currentRating);
        if (allowedBonus <= 0)
            continue;
        currentRating += allowedBonus;
        bonus += allowedBonus;
        if (currentRating >= 5)
            break;
    }
    return bonus;
}
function getEffectiveProductRating(stats) {
    return clamp(stats.baseRating + getRatingBonus(stats), 0, 5);
}
function applyProductStats(product) {
    const stats = getProductStats(product);
    product.stock = stats.stock;
    product.purchasesCount = stats.purchasesCount;
    product.rating = getEffectiveProductRating(stats).toFixed(1);
}
function persistProductStatsToLoadedProducts() {
    globalProductsList.forEach(applyProductStats);
    saveProductStats();
}
function getCurrentAccountRating(productId) {
    const stats = productStats[String(productId)];
    if (!stats)
        return 0;
    return clamp(Number(stats.ratingsByAccount[getAccountIdentity()] || 0), 0, 5);
}
function updateProductRating(productId, rating) {
    const product = globalProductsList.find(item => String(item.id) === String(productId));
    if (!product)
        return;
    const stats = getProductStats(product);
    const accountId = getAccountIdentity();
    const normalizedRating = clamp(Math.round(Number(rating) || 0), 0, 5);
    if (normalizedRating === 0) {
        delete stats.ratingsByAccount[accountId];
    }
    else {
        stats.ratingsByAccount[accountId] = normalizedRating;
    }
    applyProductStats(product);
    saveProductStats();
    updateMainProductMetrics();
    renderOrders();
}
// ==========================================
// SYNC FUNCTIONS
// ==========================================
function updateMainProductMetrics() {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        const product = globalProductsList.find(item => String(item.id) === String(card.getAttribute('data-id')));
        if (!product)
            return;
        const ratingElement = card.querySelector('.product-rating');
        const reviewsElement = card.querySelector('.product-reviews');
        const purchasesElement = card.querySelector('.product-purchases');
        const stockElement = card.querySelector('.product-stock');
        const productState = getProductStats(product);
        const validRatingsCount = getValidRatingCount(productState);
        const totalReviewsCount = productState.baseReviewsCount + validRatingsCount;
        if (ratingElement)
            ratingElement.textContent = product.rating;
        if (reviewsElement)
            reviewsElement.textContent = `(${totalReviewsCount})`;
        if (purchasesElement)
            purchasesElement.textContent = String(productState.purchasesCount);
        if (stockElement)
            stockElement.textContent = String(productState.stock);
    });
}
function updateMainProductCardPrices() {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        const priceElement = card.querySelector('.product-price');
        const oldPriceElement = card.querySelector('.product-old-price');
        const product = globalProductsList.find(p => String(p.id) === String(card.getAttribute('data-id')));
        if (!product || !priceElement)
            return;
        const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
        priceElement.textContent = formatPrice(discountedPrice);
        if (oldPriceElement && product.oldPrice) {
            oldPriceElement.textContent = formatPrice(product.oldPrice);
        }
    });
}
function syncMainProductStates() {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        const productId = card.getAttribute('data-id');
        if (!productId)
            return;
        const inCart = isProductInCart(productId);
        const inWishlist = isProductInWishlist(productId);
        const product = globalProductsList.find(item => String(item.id) === String(productId));
        const addButton = card.querySelector('.btn-add-to-cart');
        const wishlistButton = card.querySelector('.btn-wishlist-toggle');
        const wishlistIcon = card.querySelector('.wishlist-icon');
        const quantityInput = productQuantityInputs.get(productId);
        const decreaseButton = card.querySelector('.qty-decrement-btn');
        const increaseButton = card.querySelector('.qty-increment-btn');
        const outOfStock = !!product && getProductStats(product).stock <= 0;
        // Keep the product card visible and set its quantity to zero when stock runs out.
        if (quantityInput && outOfStock) {
            quantityInput.value = '0';
            quantityInput.min = '0';
        }
        else if (quantityInput && quantityInput.value === '0') {
            quantityInput.value = '1';
            quantityInput.min = '1';
        }
        if (decreaseButton)
            decreaseButton.disabled = outOfStock;
        if (increaseButton)
            increaseButton.disabled = outOfStock;
        // Update cart button state
        if (addButton) {
            addButton.disabled = inCart || outOfStock;
            addButton.textContent = outOfStock ? 'Out of Stock' : (inCart ? 'In Cart ✓' : 'Add to Cart');
            addButton.classList.toggle('opacity-50', inCart);
            addButton.classList.toggle('cursor-not-allowed', inCart);
            addButton.classList.toggle('bg-gray-600', inCart || outOfStock);
            addButton.classList.toggle('text-white', inCart || outOfStock);
            addButton.classList.toggle('border-gray-600', inCart || outOfStock);
            addButton.classList.toggle('hover:bg-gh-gold', !inCart && !outOfStock);
            addButton.classList.toggle('hover:text-black', !inCart && !outOfStock);
            addButton.classList.toggle('bg-gh-gold/10', !inCart && !outOfStock);
            addButton.classList.toggle('text-gh-gold', !inCart && !outOfStock);
            addButton.classList.toggle('border-gh-gold/60', !inCart && !outOfStock);
        }
        // Update wishlist heart icon
        if (wishlistButton && wishlistIcon) {
            wishlistIcon.classList.toggle('ri-poker-hearts-fill', inWishlist);
            wishlistIcon.classList.toggle('ri-poker-hearts-line', !inWishlist);
            wishlistIcon.classList.toggle('text-gh-gold', inWishlist);
            wishlistIcon.classList.toggle('text-white', !inWishlist);
        }
        // Sync quantity input with cart quantity
        const cartQuantityInput = productQuantityInputs.get(productId);
        if (cartQuantityInput) {
            const cartItem = ibuy.find(item => String(item.id) === String(productId));
            if (cartItem) {
                cartQuantityInput.value = String(cartItem.quantity || 1);
            }
            else if (!outOfStock) {
                cartQuantityInput.value = '1';
                cartQuantityInput.min = '1';
            }
        }
    });
    // Refresh metrics and prices after cart or purchase changes.
    updateMainProductMetrics();
    updateMainProductCardPrices();
}
function syncWishlistButtonStates() {
    const buttons = document.querySelectorAll('.btn-wish-add-cart');
    buttons.forEach(button => {
        const itemId = button.getAttribute('data-product-id');
        if (!itemId)
            return;
        const inCart = isProductInCart(itemId);
        button.disabled = inCart;
        button.textContent = inCart ? 'Added ✓' : 'Add to Cart';
        button.classList.toggle('opacity-50', inCart);
        button.classList.toggle('cursor-not-allowed', inCart);
        button.classList.toggle('bg-gray-600', inCart);
        button.classList.toggle('text-white', inCart);
        button.classList.toggle('border-gray-600', inCart);
        if (inCart) {
            button.classList.remove('bg-gh-gold/10', 'text-gh-gold', 'border', 'border-gh-gold/30', 'hover:bg-gh-gold', 'hover:text-black');
        }
        else {
            button.classList.add('bg-gh-gold/10', 'text-gh-gold', 'border', 'border-gh-gold/30');
            button.classList.remove('bg-gray-600', 'text-white', 'border-gray-600');
            button.classList.add('hover:bg-gh-gold', 'hover:text-black');
        }
    });
}
function updateProductQuantityInput(productId, quantity) {
    const input = productQuantityInputs.get(String(productId));
    if (input) {
        input.value = String(quantity);
    }
}
// Synchronize cart quantity from UI input and re-render
function syncQuantityWithCart(productId, quantity) {
    const cartItem = ibuy.find(item => String(item.id) === String(productId));
    if (!cartItem)
        return;
    const product = globalProductsList.find(item => String(item.id) === String(productId));
    const safeLimit = product ? Math.max(0, Number(product.stock) || 0) : Math.max(0, Number(cartItem.stock) || 0);
    if (safeLimit === 0) {
        ibuy = ibuy.filter(item => String(item.id) !== String(productId));
        saveCart();
        filtersuggestions(globalProductsList);
        addtocart();
        return;
    }
    const safeQuantity = Math.min(Math.max(1, Number(quantity) || 1), safeLimit);
    cartItem.quantity = safeQuantity;
    if (product) {
        cartItem.stock = product.stock;
    }
    saveCart();
    filtersuggestions(globalProductsList);
    addtocart();
    syncMainProductStates();
    syncWishlistButtonStates();
}
// ==========================================
// ORDERS: SNAPSHOT, RENDERING & RATINGS
// ==========================================
function createOrderId() {
    return `order_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
function getOrderTotal(items) {
    return items.reduce((totals, item) => {
        const quantity = Math.max(1, Number(item.quantity) || 1);
        const unitPrice = typeof item.price === 'number'
            ? item.price
            : Number.parseFloat(String(item.price)) || 0;
        totals.totalQuantity += quantity;
        totals.totalPrice += unitPrice * quantity;
        return totals;
    }, { totalQuantity: 0, totalPrice: 0 });
}
function getNextOrderNumber() {
    const highestExistingNumber = userOrders.reduce((highest, order) => {
        const value = Number(order.orderNumber);
        return Number.isFinite(value) ? Math.max(highest, value) : highest;
    }, 0);
    return highestExistingNumber + 1;
}
function createOrderRecord(items, createdAt = Date.now()) {
    const totals = getOrderTotal(items);
    const products = items.map(item => ({
        id: item.id,
        title: item.nameAr || item.nameEn || item.title || 'Product',
        image: item.img || '',
        quantity: Math.max(1, Number(item.quantity) || 1),
        unitPrice: typeof item.price === 'number' ? item.price : Number.parseFloat(String(item.price)) || 0,
        itemTotalPrice: (typeof item.price === 'number' ? item.price : Number.parseFloat(String(item.price)) || 0)
            * Math.max(1, Number(item.quantity) || 1),
    }));
    return {
        id: createOrderId(),
        orderNumber: getNextOrderNumber(),
        currency: localStorage.getItem('coin') || 'SAR',
        totalQuantity: totals.totalQuantity,
        totalPrice: Number(totals.totalPrice.toFixed(2)),
        time: new Date(createdAt).toLocaleString(),
        createdAt,
        products,
    };
}
function renderOrderTemplate(data) {
    const productsHTML = data.products.map(product => {
        const currentRating = getCurrentAccountRating(product.id);
        const title = escapeHTML(product.title);
        const image = product.image ? escapeHTML(product.image) : '';
        const safeId = escapeHTML(product.id);
        return `
            <div class="order-product-row product-click-trigger cursor-pointer flex items-center gap-2 border-b border-gh-gold/30 py-2" data-product-id="${safeId}">
                <div class="w-9 h-9 rounded overflow-hidden bg-black/10 shrink-0">
                    <img src="${image || 'https://via.placeholder.com/80'}" alt="${title}" class="w-full h-full object-cover" loading="lazy">
                </div>
                <div class="flex flex-col min-w-0 flex-1">
                    <h4 class="text-xs font-medium text-[var(--text)] truncate" title="${title}">${title}</h4>
                    <span class="text-[11px] text-[var(--text-dim)]">Qty: <strong class="text-gh-gold">${product.quantity}</strong></span>
                    <span class="text-[10px] text-gh-gold">${product.itemTotalPrice.toFixed(2)} ${escapeHTML(data.currency)}</span>
                </div>
                <div class="flex items-center gap-1 shrink-0" data-order-rating="${safeId}">
                    <button type="button" data-rating-action="decrease" data-order-id="${escapeHTML(data.id)}" data-product-id="${safeId}"
                        class="order-rating-arrow w-6 h-6 rounded-full border border-gh-line text-[var(--text-dim)] hover:text-gh-gold transition-colors" aria-label="Decrease rating">↓</button>
                    <span class="order-rating-value min-w-[32px] text-center text-xs text-gh-gold" aria-label="Rating">★ ${currentRating}</span>
                    <button type="button" data-rating-action="increase" data-order-id="${escapeHTML(data.id)}" data-product-id="${safeId}"
                        class="order-rating-arrow w-6 h-6 rounded-full border border-gh-line text-[var(--text-dim)] hover:text-gh-gold transition-colors" aria-label="Increase rating">↑</button>
                </div>
            </div>
        `;
    }).join('');
    return `
        <article class="order-card bg-[var(--bg-card)] border border-gh-line rounded-xl p-3 flex flex-col gap-2 w-full" data-order-id="${escapeHTML(data.id)}">
            <div class="border-b border-gh-line/50 pb-2 flex flex-col gap-1">
                <div class="flex items-center justify-between gap-2">
                    <strong class="text-sm tracking-wide text-gh-gold">Order ${data.orderNumber}</strong>
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] text-[var(--text-dim)]">${escapeHTML(data.time)}</span>
                        <button type="button" data-print-order="${escapeHTML(data.id)}"
                            class="order-print-btn border border-gh-gold/40 text-gh-gold rounded-full px-2 py-1 text-[10px] hover:bg-gh-gold hover:text-black transition-colors">
                            Print
                        </button>
                    </div>
                </div>
                <span class="text-[10px] text-gh-gold">This order is final and cannot be returned.</span>
            </div>
            <div class="max-h-56 overflow-y-auto pr-1 flex flex-col gap-1">
                ${productsHTML}
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-gh-gold/60">
                <span class="text-[11px] text-[var(--text-dim)]">Total Qty: <strong class="text-gh-gold">${data.totalQuantity}</strong></span>
                <span class="text-xs font-semibold text-gh-gold">Total: ${data.totalPrice.toFixed(2)} ${escapeHTML(data.currency)}</span>
            </div>
            <div class="text-[10px] text-[var(--text-dim)] opacity-70">
                <span>Ratings above two stars count as valid.</span>
            </div>
        </article>
    `;
}
function createOrderHTML(items, orderId = createOrderId()) {
    const order = createOrderRecord(items);
    order.id = orderId;
    return renderOrderTemplate(order);
}
function normalizeOrderNumbers() {
    let nextNumber = 1;
    const ordered = [...userOrders].sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0));
    ordered.forEach(order => {
        const existingNumber = Number(order.orderNumber);
        if (Number.isFinite(existingNumber) && existingNumber > 0) {
            nextNumber = Math.max(nextNumber, existingNumber + 1);
        }
        else {
            order.orderNumber = nextNumber;
            nextNumber += 1;
        }
    });
    saveOrders();
}
function renderOrders() {
    if (!userOrdersContainer)
        return;
    normalizeOrderNumbers();
    userOrdersContainer.querySelectorAll('.order-card').forEach(card => card.remove());
    if (emptyOrdersNotice) {
        emptyOrdersNotice.innerHTML = `
            <div>
                <i class="ri-inbox-archive-line text-3xl mb-2 opacity-40 text-gh-gold"></i>
                <p class="text-xs font-normal">No orders yet.</p>
            </div>
        `;
    }
    if (userOrders.length === 0) {
        emptyOrdersNotice?.classList.remove('hidden');
    }
    else {
        emptyOrdersNotice?.classList.add('hidden');
        const ordersHTML = [...userOrders]
            .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
            .map(order => renderOrderTemplate(order))
            .join('');
        userOrdersContainer.insertAdjacentHTML('beforeend', ordersHTML);
    }
    if (ordersCountBadge) {
        ordersCountBadge.textContent = `${userOrders.length} Order${userOrders.length === 1 ? '' : 's'}`;
    }
}
function showPurchaseMessage(message, isError = true) {
    if (!btnCheckout)
        return;
    let messageElement = document.getElementById('purchaseStatusMessage');
    if (!messageElement) {
        messageElement = document.createElement('p');
        messageElement.id = 'purchaseStatusMessage';
        messageElement.className = 'text-[11px] mt-2';
        btnCheckout.parentElement?.appendChild(messageElement);
    }
    messageElement.textContent = message;
    messageElement.classList.toggle('text-red-400', isError);
    messageElement.classList.toggle('text-gh-gold', !isError);
}
function completePurchase() {
    if (ibuy.length === 0) {
        showPurchaseMessage('Your cart is empty.');
        return false;
    }
    const purchaseItems = ibuy.map(item => ({ ...item, quantity: Math.max(1, Number(item.quantity) || 1) }));
    const unavailableProduct = purchaseItems.find(item => {
        const product = globalProductsList.find(entry => String(entry.id) === String(item.id));
        return !product || item.quantity > Math.max(0, product.stock);
    });
    if (unavailableProduct) {
        showPurchaseMessage('Some requested quantities are no longer available. The cart was updated.');
        const product = globalProductsList.find(entry => String(entry.id) === String(unavailableProduct.id));
        if (product) {
            const cartItem = ibuy.find(item => String(item.id) === String(product.id));
            if (cartItem)
                cartItem.quantity = Math.min(cartItem.quantity || 1, Math.max(0, product.stock));
            if (product.stock <= 0)
                ibuy = ibuy.filter(item => String(item.id) !== String(product.id));
            saveCart();
            filtersuggestions(globalProductsList);
            addtocart();
        }
        return false;
    }
    const createdAt = Date.now();
    const order = createOrderRecord(purchaseItems, createdAt);
    // Create the order record first, then reduce stock with no rollback after success.
    purchaseItems.forEach(item => {
        const product = globalProductsList.find(entry => String(entry.id) === String(item.id));
        if (!product)
            return;
        const stats = getProductStats(product);
        stats.stock = Math.max(0, stats.stock - (item.quantity || 1));
        stats.purchasesCount += 1;
        applyProductStats(product);
    });
    userOrders.unshift(order);
    ibuy = [];
    saveOrders();
    saveCart();
    saveProductStats();
    filtersuggestions(globalProductsList);
    addtocart();
    renderWishlist();
    renderOrders();
    updateMainProductMetrics();
    syncMainProductStates();
    syncWishlistButtonStates();
    // The success state is shown in the order header, not in the cart.
    return true;
}
function printOrder(orderId) {
    const order = userOrders.find(entry => entry.id === orderId);
    if (!order)
        return;
    document.querySelector('.market-print-invoice')?.remove();
    document.getElementById('market-print-style')?.remove();
    document.body.classList.remove('printing-market-order');
    const rows = order.products.map(product => `
        <tr>
            <td class="product-cell"><img src="${product.image ? escapeHTML(product.image) : 'https://via.placeholder.com/56'}" alt="${escapeHTML(product.title)}"></td>
            <td>${escapeHTML(product.title)}</td>
            <td>${product.quantity}</td>
            <td>${product.unitPrice.toFixed(2)} ${escapeHTML(order.currency)}</td>
            <td>${product.itemTotalPrice.toFixed(2)} ${escapeHTML(order.currency)}</td>
        </tr>
    `).join('');
    const printStyle = document.createElement('style');
    printStyle.id = 'market-print-style';
    printStyle.textContent = `
        @media screen { .market-print-invoice { display: none !important; } }
        @media print {
            body.printing-market-order > *:not(.market-print-invoice) { display: none !important; }
            body.printing-market-order { margin: 0 !important; padding: 0 !important; background: #fff !important; }
            body.printing-market-order .market-print-invoice { display: block !important; }
            .market-print-invoice, .market-print-invoice * { box-sizing: border-box; }
            .market-print-invoice { display: block; width: 100%; max-width: 760px; margin: 0 auto; padding: 28px; background: #fff; color: #171717; font-family: Arial, Helvetica, sans-serif; }
            .market-print-invoice .brand { border-bottom: 2px solid #caa84e; padding-bottom: 18px; margin-bottom: 22px; }
            .market-print-invoice .brand-name { color: #171717; font-size: 20px; letter-spacing: 3px; font-weight: 700; }
            .market-print-invoice .meta { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 20px; font-size: 13px; }
            .market-print-invoice table { width: 100%; border-collapse: collapse; font-size: 13px; }
            .market-print-invoice th { text-align: left; background: #f8f3e5; color: #765b16; padding: 10px; }
            .market-print-invoice td { padding: 10px; border-bottom: 1px solid #e6d8ac; vertical-align: middle; }
            .market-print-invoice .product-cell { width: 58px; }
            .market-print-invoice .product-cell img { width: 42px; height: 42px; object-fit: cover; border-radius: 7px; }
            .market-print-invoice .summary { display: flex; justify-content: space-between; border-top: 2px solid #caa84e; margin-top: 18px; padding-top: 14px; font-weight: 700; }
            .market-print-invoice .note { margin-top: 22px; color: #765b16; font-size: 12px; text-align: center; }
            @page { margin: 12mm; size: auto; }
        }
    `;
    const printInvoice = document.createElement('section');
    printInvoice.className = 'market-print-invoice';
    printInvoice.setAttribute('aria-hidden', 'true');
    printInvoice.innerHTML = `
        <header class="brand"><div class="brand-name">GHALLAB SHOP</div></header>
        <div class="meta"><span><strong>Order:</strong> ${order.orderNumber}</span><span><strong>Created at:</strong> ${escapeHTML(order.time)}</span></div>
        <table>
            <thead><tr><th>Image</th><th>Product</th><th>Quantity</th><th>Unit Price</th><th>Total</th></tr></thead>
            <tbody>${rows}</tbody>
        </table>
        <div class="summary"><span>Total Quantity: ${order.totalQuantity}</span><span>Total: ${order.totalPrice.toFixed(2)} ${escapeHTML(order.currency)}</span></div>
        <div class="note">This order is final and cannot be returned.</div>
    `;
    document.head.appendChild(printStyle);
    document.body.appendChild(printInvoice);
    document.body.classList.add('printing-market-order');
    let cleaned = false;
    const cleanup = () => {
        if (cleaned)
            return;
        cleaned = true;
        document.body.classList.remove('printing-market-order');
        printInvoice.remove();
        printStyle.remove();
        window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup, { once: true });
    window.setTimeout(cleanup, 30000);
    // Called directly from the user click for better mobile browser compatibility.
    window.print();
}
function handleOrderRatingClick(event) {
    const target = event.target;
    const printButton = target.closest('[data-print-order]');
    if (printButton) {
        const orderId = printButton.getAttribute('data-print-order');
        if (orderId)
            printOrder(orderId);
        return;
    }
    const button = target.closest('[data-rating-action]');
    if (!button)
        return;
    const productId = button.getAttribute('data-product-id');
    const action = button.getAttribute('data-rating-action');
    if (!productId || (action !== 'increase' && action !== 'decrease'))
        return;
    const currentRating = getCurrentAccountRating(productId);
    const nextRating = action === 'increase'
        ? Math.min(5, currentRating + 1)
        : Math.max(0, currentRating - 1);
    updateProductRating(productId, nextRating);
}
if (userOrdersContainer) {
    userOrdersContainer.addEventListener('click', (event) => {
        const target = event.target;
        if (target.closest('[data-rating-action]') || target.closest('[data-print-order]')) {
            handleOrderRatingClick(event);
            return;
        }
        const productId = target.closest('[data-product-id]')?.getAttribute('data-product-id');
        if (productId)
            scrollToProductCard(productId);
    });
}
if (btnCheckout) {
    // Convert the existing HTML button into a purchase-only button.
    btnCheckout.querySelector('i')?.remove();
    btnCheckout.textContent = 'Buy';
    btnCheckout.addEventListener('click', () => {
        completePurchase();
    });
}
// ==========================================
// WISHLIST RENDERING
// ==========================================
function createWishlistItemHTML(item) {
    const title = item.title || 'Untitled Product';
    const originalPrice = typeof item.price === 'number' ? item.price : parseFloat(String(item.price)) || 0;
    const discount = item.discount;
    const discountedPrice = discount ? calculateDiscountedPrice(originalPrice, discount) : originalPrice;
    const hasDiscount = !!discount;
    const image = item.img || 'https://via.placeholder.com/150';
    const inCart = isProductInCart(item.id);
    return `
        <div class="wishlist-item product-click-trigger group relative bg-[var(--bg-card)] border border-gh-line rounded-xl p-3 flex flex-col justify-between transition-all hover:border-gh-gold/50 w-44 sm:w-52 shrink-0 snap-start" data-id="${item.id}" data-product-id="${item.id}">
            <div class="w-full aspect-square rounded-lg overflow-hidden bg-black/10 mb-2 cursor-pointer" data-product-id="${item.id}">
                <img src="${image}" alt="${title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">
            </div>
            <div class="w-full flex flex-col flex-grow justify-between">
                <div class="w-full text-center mb-2 cursor-pointer" data-product-id="${item.id}">
                    <h4 class="text-xs font-medium text-[var(--text)] line-clamp-1" title="${title}">${title}</h4>
                    <div class="mt-1 flex flex-col items-center gap-0.5">
                        ${hasDiscount
        ? `<span class="text-xs text-gray-500 line-through">${formatPrice(originalPrice)}</span>
                               <span class="text-xs font-semibold text-gh-gold">${formatPrice(discountedPrice)}</span>
                               <span class="text-[10px] text-red-400 bg-red-400/10 rounded-full px-1.5 py-0.5 leading-none">${discount}</span>`
        : `<span class="text-xs font-semibold text-gh-gold">${formatPrice(discountedPrice)}</span>`}
                    </div>
                </div>
                <div class="w-full flex items-center gap-1.5 mt-auto">
                    <button type="button" data-product-id="${item.id}" class="btn-wish-add-cart flex-1 py-1.5 px-2 text-[11px] font-medium rounded-lg transition-colors text-center ${inCart ? 'opacity-50 cursor-not-allowed bg-gray-600 text-white border border-gray-600' : 'bg-gh-gold/10 text-gh-gold border border-gh-gold/30 hover:bg-gh-gold hover:text-black'}" title="Add to Cart" ${inCart ? 'disabled' : ''}>
                        ${inCart ? 'Added ✓' : 'Add to Cart'}
                    </button>
                    <button type="button" class="btn-wish-remove p-1.5 text-xs border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors flex items-center justify-center shrink-0" title="Remove from Wishlist">
                        <i class="ri-delete-bin-line text-sm leading-none pointer-events-none"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}
function renderWishlist() {
    if (!wishGrid || !wishlistEmptyMsg)
        return;
    // Out-of-stock products stay in the main catalog but never remain in the wishlist.
    if (globalProductsList.length > 0) {
        const availableWishlistItems = wishlistItems.filter(item => {
            const product = globalProductsList.find(entry => String(entry.id) === String(item.id));
            return !product || getProductStats(product).stock > 0;
        });
        if (availableWishlistItems.length !== wishlistItems.length) {
            wishlistItems = availableWishlistItems;
            saveWishlist();
        }
    }
    if (wishlistItems.length === 0) {
        wishlistEmptyMsg.classList.remove('hidden');
        wishGrid.innerHTML = '';
    }
    else {
        wishlistEmptyMsg.classList.add('hidden');
        wishGrid.innerHTML = wishlistItems.map(item => createWishlistItemHTML(item)).join('');
    }
    syncWishlistButtonStates();
    syncMainProductStates();
    if (wishBadge)
        wishBadge.textContent = String(wishlistItems.length);
}
// ==========================================
// CART HTML BUILDER (Fixed Responsive Layout)
// ==========================================
function createCartItemHTML(item) {
    const title = item.nameAr || item.nameEn || item.title || 'Untitled Product';
    const image = item.img || 'https://via.placeholder.com/80';
    const rating = item.rating || '0';
    const isCartItem = 'quantity' in item && item.quantity !== undefined;
    const originalPrice = item.originalPrice;
    const discount = item.discount;
    const currentPrice = typeof item.price === 'number' ? item.price : parseFloat(String(item.price)) || 0;
    const hasDiscount = !!discount;
    const displayPrice = isCartItem ? currentPrice * (item.quantity || 1) : currentPrice;
    const isSuggestion = !isCartItem;
    const cardWidthClass = isSuggestion
        ? 'w-[150px] sm:w-[180px] shrink-0 snap-start'
        : 'w-full max-w-full';
    const centerClasses = isSuggestion ? 'text-center items-center justify-center' : '';
    const contentLayoutClasses = isSuggestion
        ? 'flex flex-col items-center gap-2 w-full text-center'
        : 'flex flex-row items-start gap-2 sm:gap-3 w-full min-w-0 max-w-full';
    const actionRowClasses = isSuggestion
        ? 'flex items-center gap-2 w-full justify-center mt-auto pt-2'
        : 'flex flex-row items-center justify-between gap-2 w-full mt-2 pt-2 border-t border-gh-line/30 shrink-0';
    return `
        <div class="cart-item product-click-trigger bg-[var(--bg-surface)] border border-gh-line rounded-lg p-2.5 flex flex-col justify-between transition-all hover:border-gh-gold/50 box-border overflow-hidden ${cardWidthClass} ${isSuggestion ? 'suggestion-item' : ''}" data-id="${item.id}" data-product-id="${item.id}" style="box-sizing: border-box;">
            <!-- Top row: image + details -->
            <div class="${contentLayoutClasses}" style="box-sizing: border-box;">
                <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-black/10 shrink-0 cursor-pointer" data-product-id="${item.id}">
                    <img src="${image}" alt="${title}" class="w-full h-full object-cover" loading="lazy">
                </div>
                <div class="flex flex-col justify-center flex-1 min-w-0 max-w-full overflow-hidden cursor-pointer ${centerClasses}" data-product-id="${item.id}">
                    <h4 class="text-xs sm:text-sm font-medium text-[var(--text-main)] mb-0.5 leading-snug truncate w-full" title="${title}">${title}</h4>
                    <div class="flex items-center gap-1 mb-0.5 ${isSuggestion ? 'justify-center' : 'justify-start'}">
                        <span class="text-[10px] sm:text-xs text-yellow-500">★</span>
                        <span class="text-[10px] sm:text-xs text-[var(--text-dim)]">${rating}</span>
                    </div>
                    <div class="flex flex-wrap items-center gap-1 ${isSuggestion ? 'justify-center' : 'justify-start'}">
                        ${hasDiscount
        ? `<span class="text-[10px] text-gray-500 line-through">${formatPrice(originalPrice * (isCartItem ? (item.quantity || 1) : 1))}</span>
                               <span class="text-xs font-semibold text-gh-gold">${formatPrice(displayPrice)}</span>
                               <span class="text-[9px] text-red-400 bg-red-400/10 rounded-full px-1 py-0.5 leading-none">${discount}</span>`
        : `<span class="text-xs font-semibold text-gh-gold">${formatPrice(displayPrice)}</span>`}
                    </div>
                </div>
            </div>
            <!-- Action buttons -->
            <div class="${actionRowClasses}">
                ${isCartItem ? `
                    <div class="qty-stepper flex items-center border border-gh-line rounded-full overflow-hidden shrink-0 bg-black/5">
                        <button type="button" data-action="decrease" data-id="${item.id}" class="qty-decrement-btn w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-[var(--text-dim)] hover:text-gh-gold transition-colors focus:outline-none" aria-label="Decrease Quantity">−</button>
                        <input type="number" class="qty-input w-6 sm:w-7 text-center bg-transparent focus:outline-none text-xs font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value="${item.quantity}" min="1" readonly>
                        <button type="button" data-action="increase" data-id="${item.id}" class="qty-increment-btn w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-[var(--text-dim)] hover:text-gh-gold transition-colors focus:outline-none" aria-label="Increase Quantity">+</button>
                    </div>
                    <button type="button" data-action="remove" data-id="${item.id}" class="p-1.5 text-xs border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-full transition-colors flex items-center justify-center shrink-0" title="Remove Item">
                        <i class="ri-delete-bin-line text-xs sm:text-sm"></i>
                    </button>
                ` : `
                    <button type="button" data-action="add-to-cart" data-id="${item.id}" class="btn-add-to-cart-suggestion w-full py-1.5 px-2 text-[11px] bg-gh-gold/10 text-gh-gold border border-gh-gold/30 hover:bg-gh-gold hover:text-black font-medium rounded-full transition-colors text-center whitespace-nowrap" title="Add to Cart">
                        Add to Cart
                    </button>
                `}
            </div>
        </div>
    `;
}
// ==========================================
// CART & SUGGESTIONS LOGIC
// ==========================================
function addtocart() {
    if (!cartItemsList || !cartEmptyMsg || !cartBadge || !cartSuggestions || !suggestionmasg || !cartTotalValue)
        return;
    cartItemsList.innerHTML = '';
    cartSuggestions.innerHTML = '';
    if (ibuy.length === 0) {
        cartEmptyMsg.classList.remove('hidden');
        suggestionmasg.classList.add('hidden');
        cartTotalValue.textContent = '0.00';
    }
    else {
        cartEmptyMsg.classList.add('hidden');
        ibuy.forEach(item => {
            cartItemsList.insertAdjacentHTML('beforeend', createCartItemHTML(item));
        });
        suggestions.forEach(item => {
            cartSuggestions.insertAdjacentHTML('beforeend', createCartItemHTML(item));
        });
        // Issue 5: Hide suggestions container if empty
        if (suggestions.length > 0) {
            suggestionmasg.classList.remove('hidden');
        }
        else {
            suggestionmasg.classList.add('hidden');
        }
        // Total uses discounted price × quantity
        const total = ibuy.reduce((sum, item) => {
            const unit = typeof item.price === 'number' ? item.price : Number.parseFloat(String(item.price)) || 0;
            return sum + unit * (item.quantity || 1);
        }, 0);
        cartTotalValue.textContent = total.toFixed(2);
    }
    cartBadge.textContent = String(ibuy.length);
    syncMainProductStates();
    syncWishlistButtonStates(); // Also sync wishlist buttons when cart changes
}
function createSuggestionItem(product) {
    const suggestion = {
        id: product.id,
        title: product.nameAr,
        price: product.price,
        img: product.image,
        nameAr: product.nameAr,
        categoryEn: product.categoryEn,
        rating: product.rating,
        ...(product.discount !== undefined ? { discount: product.discount } : {}),
        ...(product.oldPrice !== undefined ? { originalPrice: product.oldPrice } : {}),
    };
    if (product.nameEn)
        suggestion.nameEn = product.nameEn;
    return suggestion;
}
function filtersuggestions(allProducts) {
    const cartCategoryNames = ibuy.map(item => item.categoryEn || 'General');
    const matchedProducts = allProducts.filter(product => {
        const matchesCategory = cartCategoryNames.includes(product.categoryEn);
        const isAlreadyInCart = ibuy.some(item => String(item.id) === String(product.id));
        const isAvailable = Math.max(0, Number(product.stock) || 0) > 0;
        return matchesCategory && !isAlreadyInCart && isAvailable;
    });
    // Sort by rating descending
    matchedProducts.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    // Unlimited suggestions (no slice)
    suggestions = matchedProducts.map(createSuggestionItem);
}
// Adds product to cart. If already in cart, increments quantity unless an explicit input is given.
function addToCart(product, quantityInput, allProducts) {
    const existingItem = ibuy.find(item => String(item.id) === String(product.id));
    const maxAllowed = Math.max(0, Number(product.stock) || 0);
    if (maxAllowed === 0) {
        ibuy = ibuy.filter(item => String(item.id) !== String(product.id));
        saveCart();
        filtersuggestions(allProducts);
        addtocart();
        syncMainProductStates();
        return;
    }
    let qty = quantityInput
        ? Math.max(1, Number(quantityInput.value) || 1)
        : existingItem
            ? (existingItem.quantity || 1) + 1
            : 1;
    // Enforce stock limit in all cart entry paths
    qty = Math.min(qty, maxAllowed);
    const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
    if (existingItem) {
        existingItem.quantity = qty;
        existingItem.price = discountedPrice;
        existingItem.discount = product.discount;
        existingItem.originalPrice = product.oldPrice;
        existingItem.stock = product.stock;
    }
    else {
        const newCartItem = {
            id: product.id,
            nameAr: product.nameAr,
            price: discountedPrice,
            quantity: qty,
            categoryEn: product.categoryEn,
            rating: product.rating,
            stock: product.stock,
            ...(product.discount !== undefined ? { discount: product.discount } : {}),
            ...(product.oldPrice !== undefined ? { originalPrice: product.oldPrice } : {}),
        };
        if (product.nameEn)
            newCartItem.nameEn = product.nameEn;
        if (product.image)
            newCartItem.img = product.image;
        ibuy.push(newCartItem);
    }
    saveCart();
    filtersuggestions(allProducts);
    addtocart();
    syncMainProductStates();
    syncWishlistButtonStates();
}
function addToCartFromSuggestion(item) {
    const product = globalProductsList.find(p => String(p.id) === String(item.id));
    if (product) {
        addToCart(product, null, globalProductsList);
        return;
    }
    // Fallback: build cart item manually
    const existingItem = ibuy.find(i => String(i.id) === String(item.id));
    if (existingItem) {
        const maxAllowed = Math.max(1, Number(existingItem.stock) || 1);
        existingItem.quantity = Math.min(Math.max(1, (existingItem.quantity || 1) + 1), maxAllowed);
        existingItem.stock = maxAllowed;
    }
    else {
        const newCartItem = {
            id: item.id,
            nameAr: item.nameAr || item.title || 'Product',
            price: typeof item.price === 'number' ? item.price : Number.parseFloat(String(item.price)) || 0,
            quantity: 1,
            categoryEn: item.categoryEn || 'General',
            rating: item.rating || '0',
            stock: Math.max(1, Number(item.quantity) || 1),
            ...(item.originalPrice !== undefined ? { originalPrice: item.originalPrice } : {}),
            ...(item.discount !== undefined ? { discount: item.discount } : {}),
        };
        if (item.img)
            newCartItem.img = item.img;
        if (item.nameEn)
            newCartItem.nameEn = item.nameEn;
        ibuy.push(newCartItem);
    }
    saveCart();
    filtersuggestions(globalProductsList);
    addtocart();
    syncMainProductStates();
    syncWishlistButtonStates();
}
// ==========================================
// FETCH & RENDER PRODUCTS
// ==========================================
if (productTemplate && productGrid) {
    fetch('/products.json')
        .then(response => response.json())
        .then((products) => {
        globalProductsList = products.map(product => ({ ...product }));
        persistProductStatsToLoadedProducts();
        // Sort by rating descending by default.
        globalProductsList.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
        productGrid.innerHTML = '';
        globalProductsList.forEach(product => {
            const clone = productTemplate.content.cloneNode(true);
            const title = clone.querySelector('.product-title');
            const price = clone.querySelector('.product-price');
            const oldPrice = clone.querySelector('.product-old-price');
            const discount = clone.querySelector('.product-discount');
            const rating = clone.querySelector('.product-rating');
            const reviews = clone.querySelector('.product-reviews');
            const purchases = clone.querySelector('.product-purchases');
            const stock = clone.querySelector('.product-stock');
            const cardArticle = clone.querySelector('.product-card');
            const img = clone.querySelector('.product-image');
            const desc = clone.querySelector('.product-description');
            if (title)
                title.textContent = product.nameAr;
            if (price)
                price.textContent = `${product.price.toFixed(2)} SAR`;
            if (rating)
                rating.textContent = product.rating;
            if (reviews)
                reviews.textContent = `(${product.reviewsCount})`;
            if (purchases)
                purchases.textContent = String(product.purchasesCount);
            if (stock)
                stock.textContent = String(product.stock);
            if (img) {
                img.src = product.image;
                img.alt = product.nameAr;
            }
            if (desc)
                desc.textContent = product.descriptionAr;
            if (oldPrice && product.oldPrice) {
                oldPrice.textContent = `${product.oldPrice.toFixed(2)} SAR`;
                oldPrice.classList.remove('hidden');
            }
            if (discount && product.discount) {
                discount.textContent = product.discount;
                discount.classList.remove('hidden');
            }
            // Quantity stepper controls
            const decreaseQuantityBtn = clone.querySelector('.qty-decrement-btn');
            const quantityInput = clone.querySelector('.qty-input');
            const increaseQuantityBtn = clone.querySelector('.qty-increment-btn');
            if (quantityInput) {
                productQuantityInputs.set(String(product.id), quantityInput);
            }
            if (decreaseQuantityBtn && quantityInput && increaseQuantityBtn) {
                decreaseQuantityBtn.addEventListener('click', () => {
                    const currentVal = Number(quantityInput.value);
                    if (currentVal > 1) {
                        quantityInput.value = String(currentVal - 1);
                        syncQuantityWithCart(product.id, currentVal - 1);
                    }
                });
                increaseQuantityBtn.addEventListener('click', () => {
                    const currentVal = Number(quantityInput.value);
                    if (currentVal < product.stock) {
                        quantityInput.value = String(currentVal + 1);
                        syncQuantityWithCart(product.id, currentVal + 1);
                    }
                });
            }
            // Wishlist toggle button
            const wishlistToggleBtn = clone.querySelector('.btn-wishlist-toggle');
            const wishlistIcon = clone.querySelector('.wishlist-icon');
            // Add to Cart button
            const adding = clone.querySelector('.btn-add-to-cart');
            const isInCart = ibuy.some(item => String(item.id) === String(product.id));
            if (isInCart) {
                if (adding) {
                    adding.disabled = true;
                    adding.textContent = 'In Cart ✓';
                }
                const cartItem = ibuy.find(item => String(item.id) === String(product.id));
                if (cartItem && quantityInput) {
                    quantityInput.value = String(cartItem.quantity || 1);
                }
            }
            if (adding) {
                adding.addEventListener('click', () => {
                    if (adding.disabled)
                        return;
                    addToCart(product, quantityInput, products);
                });
            }
            if (wishlistToggleBtn && wishlistIcon && wishBadge) {
                const isLiked = wishlistItems.some(item => String(item.id) === String(product.id));
                if (isLiked) {
                    wishlistIcon.classList.replace('ri-poker-hearts-line', 'ri-poker-hearts-fill');
                }
                wishlistToggleBtn.addEventListener('click', () => {
                    if (getProductStats(product).stock <= 0)
                        return;
                    const index = wishlistItems.findIndex(item => String(item.id) === String(product.id));
                    if (index === -1) {
                        const newWishlistItem = {
                            id: product.id,
                            title: product.nameAr,
                            price: product.price,
                            img: product.image,
                            ...(product.oldPrice !== undefined ? { originalPrice: product.oldPrice } : {}),
                            ...(product.discount !== undefined ? { discount: product.discount } : {}),
                        };
                        wishlistItems.push(newWishlistItem);
                    }
                    else {
                        wishlistItems.splice(index, 1);
                    }
                    saveWishlist();
                    renderWishlist();
                    syncMainProductStates();
                });
            }
            if (cardArticle) {
                cardArticle.setAttribute('data-id', String(product.id));
                cardArticle.addEventListener('click', (event) => {
                    const target = event.target;
                    if (target.closest('button') || target.closest('input'))
                        return;
                    scrollToProductCard(product.id);
                });
            }
            productGrid.appendChild(clone);
        });
        // Remove zero-stock items from the cart only; keep their original cards visible at quantity zero.
        ibuy = ibuy.filter(item => {
            const product = globalProductsList.find(entry => String(entry.id) === String(item.id));
            return !product || getProductStats(product).stock > 0;
        });
        saveCart();
        filtersuggestions(globalProductsList);
        addtocart();
        syncMainProductStates();
        renderWishlist();
        renderOrders();
    })
        .catch(error => {
        console.error('Error fetching products:', error);
    });
}
// ==========================================
// GLOBAL EVENT DELEGATION - CART ACTIONS
// ==========================================
if (cartItemsList) {
    cartItemsList.addEventListener('click', (event) => {
        const target = event.target;
        const actionBtn = target.closest('[data-action]');
        const productId = target.closest('[data-product-id]')?.getAttribute('data-product-id');
        if (actionBtn) {
            const action = actionBtn.getAttribute('data-action');
            const id = actionBtn.getAttribute('data-id');
            if (!id)
                return;
            if (action === 'remove') {
                ibuy = ibuy.filter(item => String(item.id) !== id);
                saveCart();
                filtersuggestions(globalProductsList);
                addtocart();
                syncMainProductStates();
                syncWishlistButtonStates();
                const input = productQuantityInputs.get(String(id));
                if (input)
                    input.value = '1';
            }
            else if (action === 'increase' || action === 'decrease') {
                const item = ibuy.find(entry => String(entry.id) === id);
                if (!item)
                    return;
                const product = globalProductsList.find(entry => String(entry.id) === String(id));
                const stockLimit = product ? Math.max(0, Number(product.stock) || 0) : Math.max(0, Number(item.stock) || 0);
                if (stockLimit === 0) {
                    ibuy = ibuy.filter(entry => String(entry.id) !== id);
                    saveCart();
                    filtersuggestions(globalProductsList);
                    addtocart();
                    syncMainProductStates();
                    updateProductQuantityInput(id, 0);
                    return;
                }
                let nextQty = action === 'increase' ? (item.quantity || 1) + 1 : Math.max(1, (item.quantity || 1) - 1);
                nextQty = Math.min(Math.max(1, nextQty), stockLimit);
                item.quantity = nextQty;
                item.stock = stockLimit;
                saveCart();
                filtersuggestions(globalProductsList);
                addtocart();
                syncMainProductStates();
                syncWishlistButtonStates();
                updateProductQuantityInput(id, nextQty);
            }
            return;
        }
        if (productId) {
            scrollToProductCard(productId);
        }
    });
}
if (cartSuggestions) {
    cartSuggestions.addEventListener('click', (event) => {
        const target = event.target;
        const actionBtn = target.closest('[data-action="add-to-cart"]');
        const productId = target.closest('[data-product-id]')?.getAttribute('data-product-id');
        if (actionBtn) {
            const id = actionBtn.getAttribute('data-id');
            if (!id || actionBtn.disabled)
                return;
            const suggestionItem = suggestions.find(s => String(s.id) === id);
            if (!suggestionItem)
                return;
            actionBtn.disabled = true;
            addToCartFromSuggestion(suggestionItem);
            return;
        }
        if (productId) {
            scrollToProductCard(productId);
        }
    });
}
// ==========================================
// GLOBAL EVENT DELEGATION - WISHLIST ACTIONS
// ==========================================
if (wishGrid) {
    wishGrid.addEventListener('click', (event) => {
        const target = event.target;
        const addToCartBtn = target.closest('.btn-wish-add-cart');
        if (addToCartBtn) {
            const itemCard = addToCartBtn.closest('.wishlist-item');
            const itemId = itemCard?.getAttribute('data-id');
            if (itemId) {
                const product = globalProductsList.find(p => String(p.id) === String(itemId));
                if (product) {
                    // addToCart internally syncs wishlist button states
                    addToCart(product, null, globalProductsList);
                }
            }
            return;
        }
        const removeBtn = target.closest('.btn-wish-remove');
        if (removeBtn) {
            const itemCard = removeBtn.closest('.wishlist-item');
            const itemId = itemCard?.getAttribute('data-id');
            if (!itemId)
                return;
            wishlistItems = wishlistItems.filter(item => String(item.id) !== String(itemId));
            saveWishlist();
            renderWishlist();
            syncMainProductStates();
            return;
        }
        const productId = target.closest('[data-product-id]')?.getAttribute('data-product-id');
        if (productId) {
            scrollToProductCard(productId);
        }
    });
}
// ==========================================
// INITIAL RENDER (on DOM ready)
// ==========================================
function initialRender() {
    renderOrders();
    ibuy = ibuy.map(item => {
        const product = globalProductsList.find(entry => String(entry.id) === String(item.id));
        const maxAllowed = product ? Math.max(1, product.stock) : Math.max(1, Number(item.stock) || 1);
        return {
            ...item,
            quantity: Math.min(Math.max(1, Number(item.quantity) || 1), maxAllowed),
            stock: maxAllowed,
        };
    });
    saveCart();
    renderWishlist();
    if (ibuy.length > 0 && cartItemsList && cartBadge && cartTotalValue) {
        if (cartBadge)
            cartBadge.textContent = String(ibuy.length);
    }
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialRender);
}
else {
    initialRender();
}
export {};
//# sourceMappingURL=TheMarket.js.map