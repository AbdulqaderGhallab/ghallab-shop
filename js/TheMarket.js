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
    const card = document.querySelector(`.product-card[data-id="${String(productId)}"]`);
    if (!card)
        return;
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.classList.add('ring-2', 'ring-gh-gold', 'ring-offset-2', 'ring-offset-[var(--bg)]');
    window.setTimeout(() => {
        card.classList.remove('ring-2', 'ring-gh-gold', 'ring-offset-2', 'ring-offset-[var(--bg)]');
    }, 1800);
}
function getStorageKey(featureName) {
    const currentUserRaw = localStorage.getItem('currentUser');
    if (currentUserRaw) {
        try {
            const user = JSON.parse(currentUserRaw);
            if (user && user.email) {
                return `${featureName}_${user.email}`;
            }
        }
        catch (error) {
            console.error('Error parsing current user data:', error);
        }
    }
    return `${featureName}_guest`;
}
// ==========================================
// STATE INITIALIZATION FROM LOCALSTORAGE
// ==========================================
const lovesKey = getStorageKey('ilove');
const savedLove = localStorage.getItem(lovesKey);
let wishlistItems = savedLove ? JSON.parse(savedLove) : [];
const cartKey = getStorageKey('cart');
const savedCart = localStorage.getItem(cartKey);
let ibuy = savedCart ? JSON.parse(savedCart) : [];
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
const btnPrintInvoice = document.getElementById('btnPrintInvoice'); // left unchanged
const cartEmptyMsg = document.getElementById('cartEmptyMsg');
const cartItemsList = document.getElementById('cartItemsList');
const cartSuggestions = document.getElementById('cartSuggestions');
const suggestionmasg = document.getElementById('cartSuggestionsTitle');
const cartBadge = document.getElementById('cartBadge');
// ==========================================
// PERSISTENCE HELPERS
// ==========================================
function saveWishlist() {
    localStorage.setItem(lovesKey, JSON.stringify(wishlistItems));
}
function saveCart() {
    localStorage.setItem(cartKey, JSON.stringify(ibuy));
}
// ==========================================
// SYNC FUNCTIONS
// ==========================================
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
        const addButton = card.querySelector('.btn-add-to-cart');
        const wishlistButton = card.querySelector('.btn-wishlist-toggle');
        const wishlistIcon = card.querySelector('.wishlist-icon');
        // Update cart button state
        if (addButton) {
            addButton.disabled = inCart;
            addButton.textContent = inCart ? 'In Cart ✓' : 'Add to Cart';
            addButton.classList.toggle('opacity-50', inCart);
            addButton.classList.toggle('cursor-not-allowed', inCart);
            addButton.classList.toggle('bg-gray-600', inCart);
            addButton.classList.toggle('text-white', inCart);
            addButton.classList.toggle('border-gray-600', inCart);
            addButton.classList.toggle('hover:bg-gh-gold', !inCart);
            addButton.classList.toggle('hover:text-black', !inCart);
            addButton.classList.toggle('bg-gh-gold/10', !inCart);
            addButton.classList.toggle('text-gh-gold', !inCart);
            addButton.classList.toggle('border-gh-gold/60', !inCart);
        }
        // Update wishlist heart icon
        if (wishlistButton && wishlistIcon) {
            wishlistIcon.classList.toggle('ri-poker-hearts-fill', inWishlist);
            wishlistIcon.classList.toggle('ri-poker-hearts-line', !inWishlist);
            wishlistIcon.classList.toggle('text-gh-gold', inWishlist);
            wishlistIcon.classList.toggle('text-white', !inWishlist);
        }
        // Sync quantity input with cart quantity
        const quantityInput = productQuantityInputs.get(productId);
        if (quantityInput) {
            const cartItem = ibuy.find(item => String(item.id) === String(productId));
            if (cartItem) {
                quantityInput.value = String(cartItem.quantity || 1);
            }
            else {
                quantityInput.value = '1';
            }
        }
    });
    // Issue 6: Update prices when currency changes
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
    const input = productQuantityInputs.get(productId);
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
    const safeLimit = product ? Math.max(1, product.stock) : Math.max(1, Number(cartItem.stock) || 1);
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
    if (wishlistItems.length === 0) {
        wishlistEmptyMsg.classList.remove('hidden');
        wishGrid.innerHTML = '';
    }
    else {
        wishlistEmptyMsg.classList.add('hidden');
        wishGrid.innerHTML = wishlistItems.map(item => createWishlistItemHTML(item)).join('');
    }
    syncWishlistButtonStates();
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
        return matchesCategory && !isAlreadyInCart;
    });
    // Sort by rating descending
    matchedProducts.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    // Unlimited suggestions (no slice)
    suggestions = matchedProducts.map(createSuggestionItem);
}
// Adds product to cart. If already in cart, increments quantity unless an explicit input is given.
function addToCart(product, quantityInput, allProducts) {
    const existingItem = ibuy.find(item => String(item.id) === String(product.id));
    const maxAllowed = Math.max(1, product.stock || 1);
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
        globalProductsList = products;
        // Sort by rating descending by default
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
                productQuantityInputs.set(product.id, quantityInput);
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
        filtersuggestions(products);
        addtocart();
        syncMainProductStates();
        renderWishlist();
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
                const input = productQuantityInputs.get(id);
                if (input)
                    input.value = '1';
            }
            else if (action === 'increase' || action === 'decrease') {
                const item = ibuy.find(entry => String(entry.id) === id);
                if (!item)
                    return;
                const product = globalProductsList.find(entry => String(entry.id) === String(id));
                const stockLimit = product ? Math.max(1, product.stock) : Math.max(1, Number(item.stock) || 1);
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