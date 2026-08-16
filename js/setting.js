// ==========================================
// 1. BRAND LOGO & DESKTOP SEARCH
// ==========================================
const brandLogo = document.getElementById('brandLogo');
const brandLogoIcon = document.getElementById('brandLogoIcon');
if (brandLogo && brandLogoIcon) {
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
// --- Dynamic panel scroll management ---
function resetPanelScrollStyles(panel) {
    panel.style.overflowY = '';
    panel.style.maxHeight = '';
    panel.style.overscrollBehavior = '';
    panel.style.removeProperty('-webkit-overflow-scrolling');
}
function closeAllPanels() {
    allPanels.forEach(panel => {
        if (panel) {
            panel.classList.remove('open');
            panel.classList.add('hidden');
            resetPanelScrollStyles(panel); // Remove any custom scroll styles
        }
    });
    // Always unlock body scroll when all panels are closed
    document.body.style.overflow = '';
}
function applyPanelScrollIfNeeded(panel) {
    const isMobileViewport = window.innerWidth < 768;
    if (isMobileViewport) {
        resetPanelScrollStyles(panel);
        document.body.style.overflow = '';
        // ⛔ لا نفرض تمريراً إضافياً على السلة أو المفضلة، لأن لديهما تمريراً داخلياً بالفعل
        if (panel.id === 'panelCart' || panel.id === 'panelWishlist') {
            return;
        }
        // ✅ استخدم 5rem بدلاً من 4rem لتجنب تجاوز حدود الهيدر
        panel.style.maxHeight = 'calc(100vh - 5rem)';
        panel.style.overflowY = 'auto';
        return;
    }
    // سطح المكتب: نفس المنطق السابق ولكن بدون المساس بالسلة/المفضلة
    if (panel.id === 'panelCart' || panel.id === 'panelWishlist') {
        resetPanelScrollStyles(panel);
        document.body.style.overflow = '';
        return;
    }
    if (panel.scrollHeight > window.innerHeight) {
        panel.style.overflowY = 'auto';
        panel.style.maxHeight = 'calc(100vh - 5rem)';
        panel.style.overscrollBehavior = 'contain';
        panel.style.setProperty('-webkit-overflow-scrolling', 'touch');
        document.body.style.overflow = 'hidden';
    }
    else {
        resetPanelScrollStyles(panel);
        document.body.style.overflow = '';
    }
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
                // Dynamically apply scroll lock only if content overflows
                applyPanelScrollIfNeeded(targetPanel);
            });
        }
        // If the panel was already open, closeAllPanels closed it and reset scroll
    });
}
// Prevent clicks inside panels from bubbling to the document
allPanels.forEach(panel => {
    if (panel) {
        panel.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    }
});
// Global click to close panels when clicking outside
document.addEventListener('click', (event) => {
    const path = event.composedPath();
    const isClickInsidePanel = allPanels.some(panel => panel && path.includes(panel));
    if (!isClickInsidePanel) {
        closeAllPanels();
    }
});
// Bind each button to its corresponding panel
bindPanelToggle(btnSearch, panelSearch);
bindPanelToggle(btnWishlist, panelWishlist);
bindPanelToggle(btnCart, panelCart);
bindPanelToggle(btnSettings, panelSettings);
bindPanelToggle(btnAccount, panelAccount);
// ==========================================
// THEME SWITCHER
// ==========================================
const themeToggleButton = document.getElementById('themeToggle');
const moonIcon = document.getElementById('iconMoon');
const sunIcon = document.getElementById('iconSun');
if (!themeToggleButton || !moonIcon || !sunIcon) {
    console.warn('Theme toggle elements were not found in the DOM.');
}
else {
    const updateThemeUI = () => {
        const isLight = document.documentElement.classList.contains('light');
        moonIcon.classList.toggle('hidden', isLight);
        sunIcon.classList.toggle('hidden', !isLight);
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    };
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.documentElement.classList.add('light');
    }
    else if (savedTheme === 'dark') {
        document.documentElement.classList.remove('light');
    }
    updateThemeUI();
    themeToggleButton.addEventListener('click', () => {
        document.documentElement.classList.toggle('light');
        updateThemeUI();
    });
}
// ==========================================
// USER ORDERS SECTION TOGGLE
// ==========================================
const ordersection = document.getElementById('userOrdersSection');
const btnorder = document.getElementById('btnUserOrders');
if (ordersection && btnorder) {
    btnorder.addEventListener('click', () => {
        ordersection.classList.toggle('hidden');
    });
}
// ==========================================
// 3. MODE SWITCHER (BUY / SELL)
// ==========================================
const btnModeBuy = document.getElementById('btn-mode-buy');
const btnModeSell = document.getElementById('btn-mode-sell');
const viewBuySection = document.getElementById('view-buy-section');
const viewsellerSection = document.getElementById('viewSell');
if (btnModeBuy && btnModeSell && viewBuySection && viewsellerSection) {
    const switchMode = (mode) => {
        const isBuy = mode === 'buy';
        viewBuySection.classList.toggle('hidden', !isBuy);
        viewsellerSection.classList.toggle('hidden', isBuy);
        btnModeBuy.classList.toggle('active', isBuy);
        btnModeSell.classList.toggle('active', !isBuy);
    };
    btnModeBuy.addEventListener('click', () => switchMode('buy'));
    btnModeSell.addEventListener('click', () => switchMode('sell'));
}
// ==========================================
// 4. MOBILE FILTER TOGGLE
// ==========================================
const btnToggleFilters = document.getElementById('btn-toggle-filters');
const filterPanel = document.getElementById('filter-panel');
if (btnToggleFilters && filterPanel) {
    btnToggleFilters.addEventListener('click', () => {
        filterPanel.classList.toggle('hidden');
    });
}
// 2. دالة القالب (Template Function): مسؤولة فقط عن عرض الـ HTML
function renderOrderTemplate(data) {
    const productsHTML = data.products.map(product => `
        <div class="flex items-center justify-between border-b border-gh-line/30 py-2 gap-2">
            <div class="flex flex-col min-w-0">
                <h4 class="text-xs font-medium text-[var(--text)] truncate" title="${product.title}">${product.title}</h4>
                <span class="text-[11px] text-[var(--text-dim)]">Qty: <strong class="text-gh-gold">${product.quantity}</strong></span>
            </div>
            <span class="text-xs font-semibold text-gh-gold shrink-0">${product.itemTotalPrice.toFixed(2)} ${data.currency}</span>
        </div>
    `).join('');
    return `
        <div class="order-card bg-[var(--bg-card)] border border-gh-line rounded-xl p-3 flex flex-col gap-2 w-full">
            <div class="max-h-48 overflow-y-auto pr-1 flex flex-col gap-1">
                ${productsHTML}
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-gh-line/50">
                <span class="text-[11px] text-[var(--text-dim)]">Total Qty: <strong class="text-gh-gold">${data.totalQuantity}</strong></span>
                <span class="text-xs font-semibold text-gh-gold">Total: ${data.totalPrice.toFixed(2)} ${data.currency}</span>
            </div>
            <div class="text-[10px] text-[var(--text-dim)] opacity-70 mt-1 flex justify-between items-center">
                <span>Purchased at:</span>
                <span>${data.time}</span>
            </div>
        </div>
    `;
}
// 3. دالة المنطق (Logic Function): مسؤولة عن الحسابات وتجهيز البيانات
function createOrderHTML(items) {
    const currency = localStorage.getItem('coin') || 'SAR';
    const time = new Date().toLocaleString();
    let totalQuantity = 0;
    let totalPrice = 0;
    // تجهيز بيانات المنتجات وحساب الإجماليات في حلقة واحدة (لتحسين الأداء)
    const products = items.map(item => {
        const title = item.nameAr || item.nameEn || item.title || 'Product';
        const unitPrice = typeof item.price === 'number' ? item.price : parseFloat(String(item.price)) || 0;
        const quantity = item.quantity || 1;
        const itemTotalPrice = unitPrice * quantity;
        totalQuantity += quantity;
        totalPrice += itemTotalPrice;
        return {
            title,
            quantity,
            itemTotalPrice
        };
    });
    // تجميع البيانات في كائن يطابق الواجهة (Interface)
    const templateData = {
        currency,
        totalQuantity,
        totalPrice,
        time,
        products
    };
    // تمرير البيانات المجهزة إلى دالة القالب
    return renderOrderTemplate(templateData);
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
// const labelResultsCount = document.getElementById('label-results-count') as HTMLParagraphElement | null
//# sourceMappingURL=setting.js.map