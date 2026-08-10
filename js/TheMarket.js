// ==========================================
// 1. BRAND LOGO & DESKTOP SEARCH
// ==========================================
// جلب العناصر مع تحديد الأنواع للـ TypeScript
const brandLogo = document.getElementById('brandLogo');
const brandLogoIcon = document.getElementById('brandLogoIcon');
if (brandLogo && brandLogoIcon) {
    // التبديل الصريح لاسم الكلاس عند تحريك الماوس
    brandLogo.addEventListener('mouseenter', () => {
        brandLogoIcon.className = 'ri-home-9-line text-gh-gold text-3xl transition-all';
    });
    brandLogo.addEventListener('mouseleave', () => {
        brandLogoIcon.className = 'ri-flower-fill text-gh-gold text-3xl transition-all';
    });
    brandLogo.addEventListener('click', () => {
        window.location.href = '/index.html';
    });
}
// ==========================================
// 2. HEADER ACTION BUTTONS & BADGES
// ==========================================
// All element declarations
const btnSearch = document.getElementById('btnSearch');
const btnWishlist = document.getElementById('btnWishlist');
const btnCart = document.getElementById('btnCart');
const btnSettings = document.getElementById('btnSettings');
const btnAccount = document.getElementById('btnAccount');
const panelSearch = document.getElementById('panelSearch');
const panelWishlist = document.getElementById('panelWishlist');
const panelCart = document.getElementById('panelCart');
const panelSettings = document.getElementById('panelSettings');
const panelAccount = document.getElementById('panelAccount');
const allPanels = [panelSearch, panelWishlist, panelCart, panelSettings, panelAccount];
function closeAllPanels() {
    allPanels.forEach(panel => {
        if (panel) {
            panel.classList.remove('open');
            panel.classList.add('hidden');
        }
    });
}
function bindPanelToggle(btn, targetPanel) {
    if (!btn || !targetPanel)
        return;
    btn.addEventListener('click', (event) => {
        event.stopPropagation();
        const isOpen = targetPanel.classList.contains('open');
        closeAllPanels();
        if (!isOpen) {
            targetPanel.classList.remove('hidden');
            requestAnimationFrame(() => {
                targetPanel.classList.add('open');
            });
        }
    });
}
// Global click to dismiss panels when clicking outside
document.addEventListener('click', (event) => {
    const clickTarget = event.target;
    const isClickInsidePanel = allPanels.some(panel => panel && panel.contains(clickTarget));
    if (!isClickInsidePanel) {
        closeAllPanels();
    }
});
// Bind buttons to panels
bindPanelToggle(btnSearch, panelSearch);
bindPanelToggle(btnWishlist, panelWishlist);
bindPanelToggle(btnCart, panelCart);
bindPanelToggle(btnSettings, panelSettings);
bindPanelToggle(btnAccount, panelAccount);
// Theme switcher DOM elements
const themeToggleButton = document.getElementById('themeToggle');
const moonIcon = document.getElementById('iconMoon');
const sunIcon = document.getElementById('iconSun');
// Ensure theme elements exist before attaching event handlers
if (!themeToggleButton || !moonIcon || !sunIcon) {
    console.warn('Theme toggle elements were not found in the DOM.');
}
else {
    // Update theme icons and save state to local storage
    const updateThemeUI = () => {
        const isLight = document.documentElement.classList.contains('light');
        // Show sun icon when light mode is active, otherwise show moon icon
        moonIcon.classList.toggle('hidden', isLight);
        sunIcon.classList.toggle('hidden', !isLight);
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    };
    // Restore persisted theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.documentElement.classList.add('light');
    }
    else if (savedTheme === 'dark') {
        document.documentElement.classList.remove('light');
    }
    // Synchronize initial theme icons state
    updateThemeUI();
    // Toggle theme state on button click
    themeToggleButton.addEventListener('click', () => {
        document.documentElement.classList.toggle('light');
        updateThemeUI();
    });
}
const ordersection = document.getElementById('userOrdersSection');
const btnorder = document.getElementById('btnUserOrders');
if (ordersection && btnorder) {
    btnorder.addEventListener('click', () => {
        ordersection.classList.toggle('hidden');
    });
}
// ==========================================
// 1. Mode Switcher Elements (BUY / SELL)
// ==========================================
const btnModeBuy = document.getElementById('btn-mode-buy');
const btnModeSell = document.getElementById('btn-mode-sell');
const viewBuySection = document.getElementById('view-buy-section');
const viewsellerSection = document.getElementById('viewSell');
if (btnModeBuy && btnModeSell && viewBuySection && viewsellerSection) {
    const switchMode = (mode) => {
        const isBuy = mode === 'buy';
        // Toggle sections visibility
        viewBuySection.classList.toggle('hidden', !isBuy);
        viewsellerSection.classList.toggle('hidden', isBuy);
        // Toggle buttons active state
        btnModeBuy.classList.toggle('active', isBuy);
        btnModeSell.classList.toggle('active', !isBuy);
    };
    btnModeBuy.addEventListener('click', () => switchMode('buy'));
    btnModeSell.addEventListener('click', () => switchMode('sell'));
}
// ==========================================
// 2. Mobile Filter Toggle
// ==========================================
const btnToggleFilters = document.getElementById('btn-toggle-filters');
const filterPanel = document.getElementById('filter-panel');
if (btnToggleFilters && filterPanel) {
    btnToggleFilters.addEventListener('click', () => {
        // Toggle 'hidden' for mobile view smoothly
        filterPanel.classList.toggle('hidden');
    });
}
const thetemplate = document.getElementById('product-card-template');
const thetemplatebroter = document.getElementById('product-grid');
if (thetemplate && thetemplatebroter) {
    fetch('/products.json')
        .then(response => response.json())
        .then(data => {
        data.forEach((product) => {
            const clone = thetemplate.content.cloneNode(true);
            // 1. اقتناص كافة العناصر
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
            // 2. تعبئة البيانات بالمفاتيح الصحيحة المطابقة لـ JSON
            if (title)
                title.textContent = product.nameAr; // أو product.nameEn
            if (price)
                price.textContent = `$${product.price}`;
            if (rating)
                rating.textContent = product.rating;
            if (reviews)
                reviews.textContent = `(${product.reviewsCount})`;
            if (purchases)
                purchases.textContent = product.purchasesCount;
            if (stock)
                stock.textContent = product.stock;
            if (img) {
                img.src = product.image; // تصحيح من img إلى image
                img.alt = product.nameAr;
            }
            if (desc)
                desc.textContent = product.descriptionAr; // تصحيح من description إلى descriptionAr
            // التعامل مع السعر القديم والخصم إن وجدا
            if (oldPrice && product.oldPrice) {
                oldPrice.textContent = `$${product.oldPrice}`;
                oldPrice.classList.remove('hidden');
            }
            if (discount && product.discount) {
                discount.textContent = product.discount;
                discount.classList.remove('hidden');
            }
            if (cardArticle)
                cardArticle.setAttribute('data-id', product.id);
            // 3. إدراج الكارت المكتمل في الـ Grid
            thetemplatebroter.appendChild(clone);
        });
    })
        .catch(error => {
        console.error('حدث خطأ في جلب الملف:', error);
    });
}
export {};
// if (thetemplate && thetemplatebroter) {
//     const title = document.querySelector('.product-title') as HTMLElement;
//     const clone = thetemplate.content.cloneNode(true) as DocumentFragment;
//     thetemplatebroter.appendChild(clone);
// }
// const wishlistBtn = document.querySelector('.btn-wishlist-toggle') as HTMLButtonElement;
// const wishlistIcon = document.querySelector('.wishlist-icon') as HTMLElement;
// const discountBadge = document.querySelector('.product-discount') as HTMLElement;
// const price = document.querySelector('.product-price') as HTMLElement;
// const oldPrice = document.querySelector('.product-old-price') as HTMLElement;
// const qtyDecrementBtn = document.querySelector('.qty-decrement-btn') as HTMLButtonElement;
// const qtyInput = document.querySelector('.qty-input') as HTMLInputElement;
// const qtyIncrementBtn = document.querySelector('.qty-increment-btn') as HTMLButtonElement;
// const addToCartBtn = document.querySelector('.btn-add-to-cart') as HTMLButtonElement;
// const qtyErrorMsg = document.querySelector('.qty-error-msg') as HTMLElement;
// // ==========================================
// // 2. Views & Layout Containers
// // ==========================================
// const mainProductsWrapper = document.getElementById('main-products-wrapper') as HTMLElement | null;
// const productGrid = document.getElementById('product-grid') as HTMLDivElement | null;
// // ==========================================
// // 3. Mobile Actions
// // ==========================================
// // ==========================================
// // 4. Sort & Category Filters
// // ==========================================
// const sortGroup = document.getElementById('sort-group') as HTMLDivElement | null;
// const sortPillsContainer = document.getElementById('sort-pills-container') as HTMLDivElement | null;
// const sortPills = document.querySelectorAll<HTMLButtonElement>('#sort-pills-container button');
// const categoryGroup = document.getElementById('category-group') as HTMLDivElement | null;
// const categoryPillsContainer = document.getElementById('category-pills-container') as HTMLDivElement | null;
// const categoryPills = document.querySelectorAll<HTMLButtonElement>('#category-pills-container button');
// // ==========================================
// // 5. Price Range Inputs
// // ==========================================
// const priceRangeGroup = document.getElementById('price-range-group') as HTMLDivElement | null;
// const inputPriceMin = document.getElementById('input-price-min') as HTMLInputElement | null;
// const inputPriceMax = document.getElementById('input-price-max') as HTMLInputElement | null;
// // ==========================================
// // 6. Quantity Filter Inputs & Labels
// // ==========================================
// const quantityFilterGroup = document.getElementById('quantity-filter-group') as HTMLDivElement | null;
// const inputQtyRange = document.getElementById('input-qty-range') as HTMLInputElement | null;
// const labelQtyVal = document.getElementById('label-qty-val') as HTMLSpanElement | null;
// // ==========================================
// // 7. Results Display
// // ==========================================
// const labelResultsCount = document.getElementById('label-results-count') as HTMLParagraphElement | null;
//# sourceMappingURL=TheMarket.js.map