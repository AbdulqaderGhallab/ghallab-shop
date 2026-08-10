// ==========================================
// 1. BRAND LOGO & DESKTOP SEARCH
// ==========================================
// جلب العناصر مع تحديد الأنواع للـ TypeScript
const brandLogo = document.getElementById('brandLogo') as HTMLElement | null;
const brandLogoIcon = document.getElementById('brandLogoIcon') as HTMLElement | null;

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
const btnSearch = document.getElementById('btnSearch') as HTMLButtonElement | null;
const btnWishlist = document.getElementById('btnWishlist') as HTMLButtonElement | null;
const btnCart = document.getElementById('btnCart') as HTMLButtonElement | null;
const btnSettings = document.getElementById('btnSettings') as HTMLButtonElement | null;
const btnAccount = document.getElementById('btnAccount') as HTMLButtonElement | null;

const panelSearch = document.getElementById('panelSearch') as HTMLElement | null;
const panelWishlist = document.getElementById('panelWishlist') as HTMLElement | null;
const panelCart = document.getElementById('panelCart') as HTMLElement | null;
const panelSettings = document.getElementById('panelSettings') as HTMLElement | null;
const panelAccount = document.getElementById('panelAccount') as HTMLElement | null;

const allPanels: (HTMLElement | null)[] = [panelSearch, panelWishlist, panelCart, panelSettings, panelAccount];

function closeAllPanels(): void {
    allPanels.forEach(panel => {
        if (panel) {
            panel.classList.remove('open');
            panel.classList.add('hidden');
        }
    });
}

function bindPanelToggle(btn: HTMLElement | null, targetPanel: HTMLElement | null): void {
    if (!btn || !targetPanel) return;

    btn.addEventListener('click', (event: MouseEvent) => {
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
document.addEventListener('click', (event: MouseEvent) => {
    const clickTarget = event.target as HTMLElement;
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
const themeToggleButton = document.getElementById('themeToggle') as HTMLButtonElement | null;
const moonIcon = document.getElementById('iconMoon') as HTMLElement | null;
const sunIcon = document.getElementById('iconSun') as HTMLElement | null;

// Ensure theme elements exist before attaching event handlers
if (!themeToggleButton || !moonIcon || !sunIcon) {
    console.warn('Theme toggle elements were not found in the DOM.');
} else {
    // Update theme icons and save state to local storage
    const updateThemeUI = (): void => {
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
    } else if (savedTheme === 'dark') {
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

const ordersection = document.getElementById('userOrdersSection') as HTMLElement | null;
const btnorder = document.getElementById('btnUserOrders') as HTMLElement | null;

if (ordersection && btnorder) {
    btnorder.addEventListener('click', () => {
        ordersection.classList.toggle('hidden');
    });
}



// ==========================================
// 1. Mode Switcher Elements (BUY / SELL)
// ==========================================
const btnModeBuy = document.getElementById('btn-mode-buy') as HTMLButtonElement | null;
const btnModeSell = document.getElementById('btn-mode-sell') as HTMLButtonElement | null;
const viewBuySection = document.getElementById('view-buy-section') as HTMLElement | null;
const viewsellerSection = document.getElementById('viewSell') as HTMLElement | null;

if (btnModeBuy && btnModeSell && viewBuySection && viewsellerSection) {
    const switchMode = (mode: 'buy' | 'sell'): void => {
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
const btnToggleFilters = document.getElementById('btn-toggle-filters') as HTMLButtonElement | null;
const filterPanel = document.getElementById('filter-panel') as HTMLElement | null;

if (btnToggleFilters && filterPanel) {
    btnToggleFilters.addEventListener('click', () => {
        // Toggle 'hidden' for mobile view smoothly
        filterPanel.classList.toggle('hidden');
    });
}


const thetemplate = document.getElementById('product-card-template') as HTMLTemplateElement | null;
const thetemplatebroter = document.getElementById('product-grid') as HTMLElement | null;

function cartbtns() {

}

if (thetemplate && thetemplatebroter) {
    fetch('/products.json')
        .then(response => response.json())
        .then(data => {
            data.forEach((product: any) => {
                const clone = thetemplate.content.cloneNode(true) as DocumentFragment;

                // 1. اقتناص كافة العناصر
                const title = clone.querySelector('.product-title') as HTMLElement;
                const price = clone.querySelector('.product-price') as HTMLElement;
                const oldPrice = clone.querySelector('.product-old-price') as HTMLElement;
                const discount = clone.querySelector('.product-discount') as HTMLElement;
                const rating = clone.querySelector('.product-rating') as HTMLElement;
                const reviews = clone.querySelector('.product-reviews') as HTMLElement;
                const purchases = clone.querySelector('.product-purchases') as HTMLElement;
                const stock = clone.querySelector('.product-stock') as HTMLElement;
                const cardArticle = clone.querySelector('.product-card') as HTMLElement;
                const img = clone.querySelector('.product-image') as HTMLImageElement;
                const desc = clone.querySelector('.product-description') as HTMLElement;

                // 2. تعبئة البيانات بالمفاتيح الصحيحة المطابقة لـ JSON
                if (title) title.textContent = product.nameAr; // أو product.nameEn
                if (price) price.textContent = `$${product.price}`;
                if (rating) rating.textContent = product.rating;
                if (reviews) reviews.textContent = `(${product.reviewsCount})`;
                if (purchases) purchases.textContent = product.purchasesCount;
                if (stock) stock.textContent = product.stock;
                if (img) {
                    img.src = product.image; // تصحيح من img إلى image
                    img.alt = product.nameAr;
                }
                if (desc) desc.textContent = product.descriptionAr; // تصحيح من description إلى descriptionAr

                // التعامل مع السعر القديم والخصم إن وجدا
                if (oldPrice && product.oldPrice) {
                    oldPrice.textContent = `$${product.oldPrice}`;
                    oldPrice.classList.remove('hidden');
                }
                if (discount && product.discount) {
                    discount.textContent = product.discount;
                    discount.classList.remove('hidden');
                }

                if (cardArticle) cardArticle.setAttribute('data-id', product.id);

                // 3. إدراج الكارت المكتمل في الـ Grid
                thetemplatebroter.appendChild(clone);
            });
        })
        .catch(error => {
            console.error('حدث خطأ في جلب الملف:', error);
        });
}

function createWishlistItemHTML(item: any): string {
    // تحديد العنوان والصورة والسعر المطابق لمستند JSON الخاص بك
    const title = item.nameAr || item.nameEn || item.title || 'منتج بدون عنوان';
    const price = typeof item.price === 'number' ? `$${item.price}` : item.price;
    const image = item.image || item.img || 'https://via.placeholder.com/150';

    return `
        <div class="wishlist-item group relative bg-[var(--bg-card)] border border-gh-line rounded-xl p-3 flex flex-col justify-between transition-all hover:border-gh-gold/50 w-44 sm:w-52 shrink-0 snap-start" data-id="${item.id}">
            
            <!-- صورة المنتج -->
            <div class="w-full aspect-square rounded-lg overflow-hidden bg-black/10 mb-2">
                <img src="${image}" alt="${title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">
            </div>

            <!-- تفاصيل المنتج -->
            <div class="w-full flex flex-col flex-grow justify-between">
                <div class="w-full text-center mb-2">
                    <h4 class="text-xs font-medium text-[var(--text)] line-clamp-1" title="${title}">${title}</h4>
                    <p class="text-xs font-semibold text-gh-gold mt-1">${price}</p>
                </div>

                <!-- الأزرار بـ Classes بدون onclick لتفادي مشاكل Scope -->
                <div class="w-full flex items-center gap-1.5 mt-auto">
                    <button type="button"
                            class="btn-wish-add-cart flex-1 py-1.5 px-2 text-[11px] bg-gh-gold/10 text-gh-gold border border-gh-gold/30 hover:bg-gh-gold hover:text-black font-medium rounded-lg transition-colors text-center"
                            title="Add to Cart">
                        Add to cart
                    </button>

                    <button type="button"
                            class="btn-wish-remove p-1.5 text-xs border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors flex items-center justify-center shrink-0"
                            title="Remove from Wishlist">
                        <i class="ri-delete-bin-line text-sm leading-none pointer-events-none"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}


function createCartItemHTML(item: any): string {
    // تحديد العنوان والسعر والكمية المطابقة لمستند البيانات الخاص بك
    const title = item.nameAr || item.nameEn || item.title || 'منتج بدون عنوان';
    const priceNum = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
    const price = `${priceNum.toFixed(2)} SAR`;
    const quantity = item.quantity || 1;

    return `
        <div class="cart-item bg-[var(--bg-surface)] border border-gh-line rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all hover:border-gh-gold/50"
             data-id="${item.id}">
            
            <!-- Product Info -->
            <div class="flex flex-col items-center sm:items-start text-center sm:text-left flex-grow">
                <h4 class="text-sm font-medium text-[var(--text-main)] mb-1">
                    ${title}
                </h4>
                <p class="text-xs font-semibold text-gh-gold">
                    ${price}
                </p>
            </div>

            <!-- Stepper & Actions -->
            <div class="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
                <div class="qty-stepper flex items-center border border-gh-line rounded-full overflow-hidden shrink-0">
                    <button type="button"
                            data-action="decrease"
                            data-id="${item.id}"
                            class="qty-decrement-btn w-7 h-8 flex items-center justify-center text-[var(--text-dim)] hover:text-gh-gold transition-colors focus:outline-none"
                            aria-label="Decrease Quantity">−</button>
                    <input type="number"
                           class="qty-input w-8 text-center bg-transparent focus:outline-none text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                           value="${quantity}" min="1" readonly>
                    <button type="button"
                            data-action="increase"
                            data-id="${item.id}"
                            class="qty-increment-btn w-7 h-8 flex items-center justify-center text-[var(--text-dim)] hover:text-gh-gold transition-colors focus:outline-none"
                            aria-label="Increase Quantity">+</button>
                </div>

                <button type="button"
                        data-action="buy"
                        data-id="${item.id}"
                        class="py-1.5 px-4 text-xs bg-gh-gold/10 text-gh-gold border border-gh-gold/30 hover:bg-gh-gold hover:text-black font-medium rounded-full transition-colors text-center"
                        title="Buy Now">
                    Buy
                </button>

                <button type="button"
                        data-action="remove"
                        data-id="${item.id}"
                        class="p-2 text-sm border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-full transition-colors flex items-center justify-center"
                        title="Remove Item">
                    <i class="ri-delete-bin-line"></i>
                </button>
            </div>
        </div>
    `;
}

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