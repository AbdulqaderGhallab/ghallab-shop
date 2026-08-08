declare const emailjs: {
    send: (serviceID: string, templateID: string, params: Record<string, unknown>) => Promise<{ status: number; text: string }>;
};

let currentLanguage: string = localStorage.getItem('language') || 'en';
const isArabicLanguage = (): boolean => currentLanguage === 'ar';

// Configuration for reveal-on-scroll animations
const observerOptions: IntersectionObserverInit = {
    threshold: 0.1
};

// Handle reveal animations for elements entering the viewport
const scrollObserver = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry: IntersectionObserverEntry) => {
        if (entry.isIntersecting) {
            const targetElement = entry.target as HTMLElement;

            targetElement.style.opacity = "1";
            targetElement.style.transform = "translateY(0)";

            scrollObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all elements with the reveal class
document.querySelectorAll<HTMLElement>('.reveal').forEach((revealElement) => {
    scrollObserver.observe(revealElement);
});

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

// Internationalization (i18n) dictionary structure
const dictionary: Record<string, Record<string, string>> = {
    "en": {
        // Navigation Bar
        "nav.brand_name": "GHALLAB SHOP",
        "app_title": "GHALLAB SHOP",
        "nav.sign_in": "Sign In",

        // Authentication Forms (Login / Register)
        "auth.login_title": "SIGN IN",
        "auth.email_label": "EMAIL",
        "auth.password_label": "PASSWORD",
        "auth.login_button": "ENTER",
        "auth.new_user_prompt": "New to Ghallab Shop?",
        "auth.create_account_link": "Create an account",
        "auth.register_title": "CREATE ACCOUNT",
        "auth.fullname_label": "FULL NAME",
        "auth.terms_agree": "I agree to the",
        "auth.terms_link": "Terms & Privacy",
        "auth.register_button": "CREATE ACCOUNT",
        "auth.existing_user_prompt": "Already have an account?",
        "auth.login_link": "Sign in",
        "auth.verify_email": "Verify",
        "auth.check_email": "Check your inbox",
        "auth.resend_email": "Resend Email",
        "auth.return_email_message": "Back",

        // Password Requirements
        "auth.password_requirements": "Password must contain:",
        "auth.password_requirements_list.0": "At least 8 characters",
        "auth.password_requirements_list.1": "Uppercase letters",
        "auth.password_requirements_list.2": "Lowercase letters",
        "auth.password_requirements_list.3": "Numbers",
        "auth.password_requirements_list.4": "Special characters",

        // Hero Section
        "hero.subtitle": "THE HOUSE OF MODERN TAILORING",
        "hero.title": "GHALLAB SHOP",
        "hero.description": "Curated ready-to-wear, cut for those who dress with intention.",
        "hero.cta": "DISCOVER THE EDIT",
        "hero.scroll_cue": "SCROLL",

        // Achievements & Metrics
        "achievements.since": "EST. 2014",
        "achievements.title": "OUR ACHIEVEMENTS",
        "achievements.reviews": "VERIFIED REVIEWS",
        "achievements.products": "PRODUCTS LISTED",
        "achievements.orders": "ORDERS FULFILLED",
        "achievements.sellers": "TRUSTED SELLERS",

        // Partners Section
        "partners.title": "IN PARTNERSHIP WITH HOUSES WE ADMIRE",

        // Testimonials / Reviews
        "testimonials.subtitle": "WORDS FROM OUR CLIENTELE",
        "testimonials.title": "TESTIMONIALS",
        "testimonials.reviews.1.quote": "The tailoring is impeccable — the kind of quality I used to fly abroad for. Ghallab Shop brought it home.",
        "testimonials.reviews.1.initial": "L",
        "testimonials.reviews.1.name": "Lina Farouk",
        "testimonials.reviews.1.role": "Verified Client, Cairo",
        "testimonials.reviews.2.quote": "From checkout to delivery, everything feels considered. It doesn't feel like online shopping — it feels like high service.",
        "testimonials.reviews.2.initial": "O",
        "testimonials.reviews.2.name": "Omar Al-Sayed",
        "testimonials.reviews.2.role": "Verified Client, Dubai",
        "testimonials.reviews.3.quote": "Every detail shows real care. The presentation and execution are simply unparalleled.",
        "testimonials.reviews.3.initial": "R",
        "testimonials.reviews.3.name": "Rana Khoury",
        "testimonials.reviews.3.role": "Verified Client, Amman",

        // Footer Navigation & Legal
        "footer.brand_title": "GHALLAB SHOP",
        "footer.brand_description": "A maison for modern ready-to-wear — sourced from ateliers we trust, delivered with utmost care.",
        "footer.shop_heading": "SHOP",
        "footer.new_arrivals": "New Arrivals",
        "footer.womenswear": "Womenswear",
        "footer.menswear": "Menswear",
        "footer.accessories": "Accessories",
        "footer.maison_heading": "MAISON",
        "footer.about_us": "About Us",
        "footer.ateliers": "Ateliers & Sellers",
        "footer.sustainability": "Sustainability",
        "footer.careers": "Careers",
        "footer.client_care_heading": "CLIENT CARE",
        "footer.shipping_returns": "Shipping & Returns",
        "footer.size_guide": "Size Guide",
        "footer.contact": "Contact",
        "footer.copyright": "© 2026 Ghallab Shop. All rights reserved.",
        "footer.privacy_policy": "Privacy Policy",
        "footer.terms_of_service": "Terms of Service"
    },
    "ar": {
        // Navigation Bar
        "nav.brand_name": "متجر غلاب",
        "nav.sign_in": "تسجيل الدخول",

        // Authentication Forms (Login / Register)
        "auth.login_title": "تسجيل الدخول",
        "auth.email_label": "البريد الإلكتروني",
        "auth.password_label": "كلمة المرور",
        "auth.login_button": "دخول",
        "auth.new_user_prompt": "جديد في متجر غلاب؟",
        "auth.create_account_link": "إنشاء حساب",
        "auth.register_title": "إنشاء حساب",
        "auth.fullname_label": "الاسم الكامل",
        "auth.terms_agree": "أوافق على",
        "auth.terms_link": "الشروط الخصوصية",
        "auth.register_button": "إنشاء حساب",
        "auth.existing_user_prompt": "لديك حساب بالفعل؟",
        "auth.login_link": "تسجيل الدخول",
        "auth.verify_email": "تأكيد",
        "auth.check_email": "تحقق من صندوق البريد",
        "auth.resend_email": "إعادة الإرسال",
        "auth.return_email_message": "رجوع",

        // Password Requirements
        "auth.password_requirements": "يجب أن تحتوي كلمة المرور على:",
        "auth.password_requirements_list.0": "8 أحرف على الأقل",
        "auth.password_requirements_list.1": "أحرف كبيرة (Uppercase)",
        "auth.password_requirements_list.2": "أحرف صغيرة (Lowercase)",
        "auth.password_requirements_list.3": "أرقام",
        "auth.password_requirements_list.4": "رموز خاصة",

        // Hero Section
        "hero.subtitle": "بيت الخياطة الرفيعة والمعاصرة",
        "hero.title": "متجر غلاب",
        "hero.description": "أزياء جاهزة فاخرة، صُممت بعناية لمن يرتدي بقصد وأناقة.",
        "hero.cta": "استكشف التشكيلة",
        "hero.scroll_cue": "التمرير للأسفل",

        // Achievements & Metrics
        "achievements.since": "تأسست عام 2014",
        "achievements.title": "إنجازاتنا",
        "achievements.reviews": "تقييمات معتمدة",
        "achievements.products": "منتجات مدرجة",
        "achievements.orders": "طلبات مكتملة",
        "achievements.sellers": "شركاء موثوقون",

        // Partners Section
        "partners.title": "بالشراكة مع أرقى بيوت الأزياء",

        // Testimonials / Reviews
        "testimonials.subtitle": "انطباعات عملائنا",
        "testimonials.title": "آراء العملاء",
        "testimonials.reviews.1.quote": "الخياطة لا تشوبها شائبة — الجودة الرفيعة التي كنت أسافر لأجلها، أتاحها متجر غلاب بين أيدينا.",
        "testimonials.reviews.1.initial": "ل",
        "testimonials.reviews.1.name": "لينا فاروق",
        "testimonials.reviews.1.role": "عميل معتمد، القاهرة",
        "testimonials.reviews.2.quote": "من الشراء وحتى الاستلام، كل خطوة متقنة. تجربة لا تشبه التسوق الإلكتروني العادي بل خدمة شخصية فاخرة.",
        "testimonials.reviews.2.initial": "ع",
        "testimonials.reviews.2.name": "عمر السيد",
        "testimonials.reviews.2.role": "عميل معتمد، دبي",
        "testimonials.reviews.3.quote": "اهتمام استثنائي بالتفاصيل وسرعة في التنفيذ. تجربة راقية بكل المقاييس.",
        "testimonials.reviews.3.initial": "ر",
        "testimonials.reviews.3.name": "رنا خوري",
        "testimonials.reviews.3.role": "عميل معتمد، عمّان",

        // Footer Navigation & Legal
        "footer.brand_title": "متجر غلاب",
        "footer.brand_description": "دار للأزياء الجاهزة المعاصرة — من أرقى الورش العالمية، تُسلم بكل عناية واحترام.",
        "footer.shop_heading": "التسوق",
        "footer.new_arrivals": "وصل حديثًا",
        "footer.womenswear": "المجموعات النسائية",
        "footer.menswear": "المجموعات الرجالية",
        "footer.accessories": "الإكسسوارات",
        "footer.maison_heading": "الدار",
        "footer.about_us": "من نحن",
        "footer.ateliers": "الورش والبائعون",
        "footer.sustainability": "الاستدامة",
        "footer.careers": "الوظائف",
        "footer.client_care_heading": "العناية بالعملاء",
        "footer.shipping_returns": "الشحن والإرجاع",
        "footer.size_guide": "دليل المقاسات",
        "footer.contact": "تواصل معنا",
        "footer.copyright": "© 2026 متجر غلاب. جميع الحقوق محفوظة.",
        "footer.privacy_policy": "سياسة الخصوصية",
        "footer.terms_of_service": "شروط الخدمة"
    }
};

// DOM elements setup
const languageToggleButton = document.getElementById('langToggle') as HTMLButtonElement | null;

if (!languageToggleButton) {
    console.warn('Language elements missing in DOM.');
} else {
    // Synchronize UI translations and text directions
    const updateLanguageUI = (): void => {
        document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = currentLanguage;

        languageToggleButton.innerText = currentLanguage === 'ar' ? 'E' : 'ع';

        const translatableElements = document.querySelectorAll<HTMLElement>('[data-i18n]');
        translatableElements.forEach((element) => {
            const translationKey = element.getAttribute('data-i18n');
            if (!translationKey) return;

            const translatedText = dictionary[currentLanguage]?.[translationKey];
            if (translatedText !== undefined) {
                const targetTextNode = Array.from(element.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
                if (targetTextNode) {
                    targetTextNode.textContent = translatedText;
                } else {
                    element.textContent = translatedText;
                }
            }
        });
    };

    // Initialize UI language on runtime boot
    updateLanguageUI();

    // Toggle active language event handler
    languageToggleButton.addEventListener('click', () => {
        currentLanguage = currentLanguage === 'en' ? 'ar' : 'en';
        localStorage.setItem('language', currentLanguage);
        updateLanguageUI();
    });
}

async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

// Authentication modal DOM elements and triggers
const openLoginButton = document.getElementById('openLogin') as HTMLButtonElement | null;
const openLoginMobileButton = document.getElementById('openLoginMobile') as HTMLButtonElement | null;
const loginModalContainer = document.getElementById('loginModal') as HTMLElement | null;
const closeLoginButton = document.getElementById('closeLogin') as HTMLButtonElement | null;

const registerModalContainer = document.getElementById('registerModal') as HTMLElement | null;
const closeRegisterButton = document.getElementById('closeRegister') as HTMLButtonElement | null;

const switchToRegisterTrigger = document.getElementById('switchToRegister') as HTMLElement | null;
const switchToLoginTrigger = document.getElementById('switchToLogin') as HTMLElement | null;

// Ensure authentication modal elements exist in the DOM
if (
    !openLoginButton ||
    !openLoginMobileButton ||
    !loginModalContainer ||
    !closeLoginButton ||
    !registerModalContainer ||
    !closeRegisterButton ||
    !switchToRegisterTrigger ||
    !switchToLoginTrigger
) {
    console.warn('Authentication modal elements were not found in the DOM.');
} else {
    // Open login modal
    openLoginButton.addEventListener('click', () => {
        loginModalContainer.classList.remove('hidden');
    });

    openLoginMobileButton.addEventListener('click', () => {
        loginModalContainer.classList.remove('hidden');
    });

    // Close login modal
    closeLoginButton.addEventListener('click', () => {
        loginModalContainer.classList.add('hidden');
    });

    // Switch from login to registration modal
    switchToRegisterTrigger.addEventListener('click', (event: Event) => {
        event.preventDefault();
        loginModalContainer.classList.add('hidden');
        registerModalContainer.classList.remove('hidden');
        showEmailInput();
    });

    // Close registration modal
    closeRegisterButton.addEventListener('click', () => {
        registerModalContainer.classList.add('hidden');
    });

    // Switch from registration back to login modal
    switchToLoginTrigger.addEventListener('click', (event: Event) => {
        event.preventDefault();
        registerModalContainer.classList.add('hidden');
        loginModalContainer.classList.remove('hidden');
    });
}

// Email verification DOM elements
const emailInput = document.getElementById('registerEmail') as HTMLInputElement | null;
const verifyEmailBtn = document.getElementById('verifyEmail') as HTMLButtonElement | null;
const resendEmailBtn = document.getElementById('resendEmail') as HTMLButtonElement | null;

const resendContainer = document.getElementById("resendEmailContainer") as HTMLElement | null;
const emailInputContainer = document.getElementById("emailVerification") as HTMLElement | null;
const truecheck = document.getElementById("emailVerifiedIcon") as HTMLElement | null;

let token: string = "";
let countdownInterval: ReturnType<typeof setInterval> | null = null;

// Rate limiting interface
interface RateLimitResult {
    allowed: boolean;
    message?: string;
    remainingAttempts: number;
}

const EMAIL_LOGS_KEY = 'email_send_logs';
const MAX_EMAILS_PER_24H = 3;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

// Verify email submission rate limits (3 sends per 24 hours)
function canSendVerificationEmail(email: string): RateLimitResult {
    const now = Date.now();
    const cleanEmail = email.trim().toLowerCase();

    try {
        const rawData = localStorage.getItem(EMAIL_LOGS_KEY);
        const logs: Record<string, number[]> = rawData ? JSON.parse(rawData) : {};
        const userLogs = logs[cleanEmail] || [];
        const recentLogs = userLogs.filter(timestamp => (now - timestamp) < TWENTY_FOUR_HOURS_MS);

        logs[cleanEmail] = recentLogs;
        localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(logs));

        if (recentLogs.length >= MAX_EMAILS_PER_24H) {
            const oldestSendTime = recentLogs[0] || now;
            const timeRemainingMs = TWENTY_FOUR_HOURS_MS - (now - oldestSendTime);
            const hoursLeft = Math.floor(timeRemainingMs / (1000 * 60 * 60));
            const minutesLeft = Math.ceil((timeRemainingMs % (1000 * 60 * 60)) / (1000 * 60));

            const isAr = isArabicLanguage();

            const timeString = isAr
                ? (hoursLeft > 0 ? `${hoursLeft} ساعة و ${minutesLeft} دقيقة` : `${minutesLeft} دقيقة`)
                : (hoursLeft > 0 ? `${hoursLeft}h and ${minutesLeft}m` : `${minutesLeft}m`);

            const limitMessage = isAr
                ? `لقد وصلت للحد الأقصى للإرسال (3 رسائل خلال 24 ساعة). يمكنك المحاولة مجدداً بعد: ${timeString}.`
                : `Maximum limit reached (3 emails per 24h). Try again in: ${timeString}.`;

            return {
                allowed: false,
                remainingAttempts: 0,
                message: limitMessage
            };
        }

        return {
            allowed: true,
            remainingAttempts: MAX_EMAILS_PER_24H - recentLogs.length
        };

    } catch (error) {
        console.error("Error reading email logs:", error);
        return { allowed: true, remainingAttempts: 1 };
    }
}

// Persist timestamp for email rate limiting
function recordEmailSend(email: string): void {
    const now = Date.now();
    const cleanEmail = email.trim().toLowerCase();

    try {
        const rawData = localStorage.getItem(EMAIL_LOGS_KEY);
        const logs: Record<string, number[]> = rawData ? JSON.parse(rawData) : {};

        if (!logs[cleanEmail]) {
            logs[cleanEmail] = [];
        }

        logs[cleanEmail].push(now);
        localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(logs));

    } catch (error) {
        console.error("Error recording email send timestamp:", error);
    }
}

// Cooldown timer handler for resend requests
function startResendTimer(): void {
    if (countdownInterval) clearInterval(countdownInterval);

    let seconds: number = 120;
    const timerElement = document.getElementById("resendEmailTimer") as HTMLSpanElement | null;
    if (!timerElement) return;

    if (resendEmailBtn) resendEmailBtn.disabled = true;

    countdownInterval = setInterval((): void => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        timerElement.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

        if (seconds <= 0) {
            if (countdownInterval) {
                clearInterval(countdownInterval);
                countdownInterval = null;
            }
            const isAr = isArabicLanguage();
            timerElement.textContent = isAr ? "انتهى الوقت!" : "Expired!";
            localStorage.removeItem('tokenlink');
            if (resendEmailBtn) resendEmailBtn.disabled = false;
            return;
        }
        seconds--;
    }, 1000);
}

function stopResendTimer(): void {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

function resetResendTimer(): void {
    stopResendTimer();
    const timerElement = document.getElementById("resendEmailTimer") as HTMLSpanElement | null;
    if (timerElement) timerElement.textContent = "02:00";
    localStorage.removeItem('tokenlink');
}

// Reset UI state to initial email input form
function showEmailInput(): void {
    stopResendTimer();
    resetResendTimer();

    truecheck?.classList.add("hidden");
    localStorage.removeItem("emailVerified");
    localStorage.removeItem("verifiedEmailAddress");

    if (emailInputContainer && resendContainer) {
        emailInputContainer.classList.remove("hidden");
        resendContainer.classList.add("hidden");
    }
}

// Dispatch verification link via email service
function sendVerificationEmail(): void {
    if (!emailInput) return;

    const email = emailInput.value.trim();
    const isAr = isArabicLanguage();

    if (!email) {
        alert(isAr ? 'الرجاء إدخال البريد الإلكتروني أولاً!' : 'Please enter your email address first!');
        return;
    }

    const information: UserInfo[] = JSON.parse(localStorage.getItem('infoing') || '[]');
    const isEmailExists = information.some((user: UserInfo) => user.email.toLowerCase() === email.toLowerCase());
    if (isEmailExists) {
        alert(isAr
            ? "هذا البريد الإلكتروني مسجل بالفعل! يرجى استخدام بريد آخر أو تسجيل الدخول."
            : "This email is already registered! Please use another email or sign in.");
        return;
    }

    localStorage.setItem('emailVerified', 'false');
    localStorage.setItem('verifiedEmailAddress', email.toLowerCase());
    truecheck?.classList.add('hidden');

    const rateCheck = canSendVerificationEmail(email);
    if (!rateCheck.allowed && rateCheck.message) {
        alert(rateCheck.message);
        return;
    }

    token = crypto.randomUUID().replace(/-/g, "");
    localStorage.setItem('tokenlink', token);

    if (verifyEmailBtn) {
        verifyEmailBtn.disabled = true;
        verifyEmailBtn.classList.add("disabled");
        verifyEmailBtn.innerText = isAr ? "إرسال..." : "Sending...";
    }

    // Dynamic base URL supporting GitHub Pages and local development
    const verificationPageUrl = new URL('Pages/verify.html', window.location.href).href;

    emailjs.send("service_6aqim3i", "template_7d8e7zo", {
        to_email: email,
        verification_link: `${verificationPageUrl}?token=${token}`
    }).then((response: any) => {
        console.log('Email sent successfully!', response.status, response.text);
        alert(isAr ? 'تم إرسال رابط التحقق! يرجى مراجعة صندوق البريد الخاص بك.' : 'Verification email sent! Please check your inbox.');

        if (resendContainer && emailInputContainer) {
            resendContainer.classList.remove("hidden");
            emailInputContainer.classList.add("hidden");
        }
        startResendTimer();
        recordEmailSend(email);

    }).catch((error: any) => {
        console.error('Error sending email:', error);
        alert(isAr
            ? 'تعذر إرسال بريد التحقق. يرجى المحاولة لاحقاً.'
            : 'Failed to send verification email. Please try again later.');
    }).finally(() => {
        if (verifyEmailBtn) {
            verifyEmailBtn.disabled = false;
            verifyEmailBtn.innerText = dictionary[currentLanguage]?.['auth.verify_email'] || (isAr ? 'تحقق' : 'Verify');
            verifyEmailBtn.classList.remove("disabled");
        }
    });
}

emailInput?.addEventListener('input', () => {
    truecheck?.classList.add("hidden");
    localStorage.removeItem("emailVerified");
    localStorage.removeItem("verifiedEmailAddress");
    localStorage.removeItem("tokenlink");
});

if (verifyEmailBtn) {
    verifyEmailBtn.addEventListener('click', (e: MouseEvent) => {
        e.preventDefault();
        sendVerificationEmail();
    });
}

const backBtn = document.getElementById('returnEmailMessage') as HTMLElement | null;
if (backBtn) {
    backBtn.addEventListener('click', () => {
        showEmailInput();
    });
}

if (resendEmailBtn) {
    resendEmailBtn.addEventListener('click', (e: MouseEvent) => {
        e.preventDefault();
        sendVerificationEmail();
    });
}

const channel = new BroadcastChannel("email_verification_channel");

function showVerifiedUI(): void {
    if (emailInputContainer) emailInputContainer.classList.add("hidden");
    if (resendContainer) resendContainer.classList.add("hidden");
    if (truecheck) truecheck.classList.remove("hidden");
}

// Cross-tab real-time sync when verification succeeds
channel.onmessage = (event: MessageEvent) => {
    if (event.data === "SUCCESS") {
        showVerifiedUI();
    }
};

// Fallback storage synchronization for verified status
window.addEventListener("storage", (e: StorageEvent) => {
    if (e.key === "emailVerified" && e.newValue === "true") {
        showVerifiedUI();
    }
});

// Initial verification status check on runtime startup
const savedEmailVerified = localStorage.getItem("emailVerified") === "true";
const hasTokenLink = localStorage.getItem("tokenlink") !== null;
const verifiedFor = localStorage.getItem("verifiedEmailAddress");
const currentEmailValue = emailInput?.value.trim().toLowerCase();

if (savedEmailVerified && hasTokenLink && verifiedFor === currentEmailValue) {
    showVerifiedUI();
} else {
    truecheck?.classList.add("hidden");
    if (savedEmailVerified && (!hasTokenLink || verifiedFor !== currentEmailValue)) {
        localStorage.removeItem("emailVerified");
        localStorage.removeItem("verifiedEmailAddress");
    }
}

// Action handler for auto-opening modal via URL search parameters
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get("action");

    if (action === "login") {
        openLoginButton?.click();
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});

// Password field DOM elements
const passwordInput = document.getElementById('registerPassword') as HTMLInputElement | null;
const eyeIcon = document.getElementById('eye') as HTMLElement | null;
const eyeOffIcon = document.getElementById('noeye') as HTMLElement | null;
const requirementsContainer = document.getElementById('registerPasswordRequirements') as HTMLElement | null;

const lengthReq = document.getElementById('registerPasswordRequirementsList0') as HTMLElement | null;
const uppercaseReq = document.getElementById('registerPasswordRequirementsList1') as HTMLElement | null;
const lowercaseReq = document.getElementById('registerPasswordRequirementsList2') as HTMLElement | null;
const numberReq = document.getElementById('registerPasswordRequirementsList3') as HTMLElement | null;
const specialCharReq = document.getElementById('registerPasswordRequirementsList4') as HTMLElement | null;

// Toggle password text visibility state
if (passwordInput && eyeIcon && eyeOffIcon) {
    eyeIcon.addEventListener('click', () => {
        passwordInput.type = 'text';
        eyeIcon.classList.add('hidden');
        eyeOffIcon.classList.remove('hidden');
    });

    eyeOffIcon.addEventListener('click', () => {
        passwordInput.type = 'password';
        eyeIcon.classList.remove('hidden');
        eyeOffIcon.classList.add('hidden');
    });
}

// Update requirement element visual validation status
function toggleValidationClass(element: HTMLElement | null, isValid: boolean): void {
    if (!element) return;
    element.classList.toggle('text-green-500', isValid);
    element.classList.toggle('text-red-600', !isValid);
}

// Validate password string against security constraints
function validatePassword(): void {
    const password = passwordInput?.value || '';

    toggleValidationClass(lengthReq, password.length >= 8);
    toggleValidationClass(uppercaseReq, /[A-Z]/.test(password));
    toggleValidationClass(lowercaseReq, /[a-z]/.test(password));
    toggleValidationClass(numberReq, /[0-9]/.test(password));
    toggleValidationClass(specialCharReq, /[^a-zA-Z0-9]/.test(password));
}

// Reset visual status of password requirements
function resetPasswordRequirements(): void {
    const requirements = [lengthReq, uppercaseReq, lowercaseReq, numberReq, specialCharReq];
    requirements.forEach(req => {
        if (req) {
            req.classList.remove('text-green-500');
            req.classList.add('text-red-600');
        }
    });
    requirementsContainer?.classList.add('hidden');
}

// Event listeners for password input validation
if (passwordInput) {
    passwordInput.addEventListener('input', () => {
        passwordInput.value = passwordInput.value.replace(/\s+/g, '');
        requirementsContainer?.classList.remove('hidden');
        validatePassword();
    });

    passwordInput.addEventListener('blur', () => {
        if (!passwordInput.value) {
            requirementsContainer?.classList.add('hidden');
        }
    });

    passwordInput.addEventListener('focus', () => {
        requirementsContainer?.classList.remove('hidden');
    });
}

// Registration form elements
const nameInput = document.getElementById('registerFullName') as HTMLInputElement | null;
const submitBtn = document.getElementById('registerSubmit') as HTMLButtonElement | null;
const termsCheckbox = document.getElementById('terms') as HTMLInputElement | null;

interface UserInfo {
    name: string;
    email: string;
    password: string;
}

// Persist user registration data
async function saveFormData(): Promise<void> {
    const isAr = isArabicLanguage();
    const password = passwordInput?.value || '';

    const isPasswordValid =
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^a-zA-Z0-9]/.test(password);

    const isEmailVerified = truecheck && !truecheck.classList.contains("hidden");
    const isTermsAccepted = termsCheckbox?.checked ?? false;
    const isNameFilled = (nameInput?.value.trim() || "") !== "";
    const isEmailFilled = (emailInput?.value.trim() || "") !== "";

    if (!isEmailVerified || !isPasswordValid || !isTermsAccepted || !isNameFilled || !isEmailFilled) {
        alert(isAr
            ? "يرجى التحقق من البريد الإلكتروني، واستيفاء جميع شروط كلمة المرور، والموافقة على الشروط!"
            : "Please verify your email, fulfill all password requirements, and accept terms!");
        return;
    }

    const name = nameInput?.value.trim() || '';
    const email = emailInput?.value.trim() || '';

    const existingUsers: UserInfo[] = JSON.parse(localStorage.getItem('infoing') || '[]');
    const passwordHash = await hashPassword(password);
    const newUser: UserInfo = { name, email, password: passwordHash };
    existingUsers.push(newUser);

    localStorage.setItem('infoing', JSON.stringify(existingUsers));

    alert(isAr ? 'تم التسجيل بنجاح!' : 'Registration successful!');

    const registerForm = document.getElementById('registerForm') as HTMLFormElement | null;
    registerForm?.reset();

    truecheck?.classList.add('hidden');
    if (termsCheckbox) {
        termsCheckbox.checked = false;
    }
    emailInput?.classList.remove("hidden");
    resetPasswordRequirements();

    localStorage.removeItem("emailVerified");
    localStorage.removeItem("verifiedEmailAddress");
    localStorage.removeItem("tokenlink");

    window.location.href = 'index.html?action=login';
}

submitBtn?.addEventListener('click', (event: Event) => {
    event.preventDefault();
    saveFormData();
});

// Login form DOM elements
const loginEmailInput = document.getElementById('loginEmail') as HTMLInputElement | null;
const loginPasswordInput = document.getElementById('loginPassword') as HTMLInputElement | null;
const loginSubmitButton = document.getElementById('loginSubmit') as HTMLButtonElement | null;
const togglePasswordButton = document.getElementById('togglePassword') as HTMLElement | null;
const loginEyeIcon = document.getElementById('loginEyeIcon') as HTMLElement | null;
const loginEyeOffIcon = document.getElementById('loginEyeOffIcon') as HTMLElement | null;

// Authenticate user credentials against stored records
async function handleLogin(event: Event): Promise<void> {
    event.preventDefault();

    const isAr = isArabicLanguage();
    const emailValue = loginEmailInput?.value.trim().toLowerCase() || '';
    const passwordValue = loginPasswordInput?.value || '';

    if (!emailValue || !passwordValue) {
        alert(isAr
            ? "الرجاء إدخال البريد الإلكتروني وكلمة المرور!"
            : "Please enter both email and password!");
        return;
    }

    const passwordHash = await hashPassword(passwordValue);
    const storedUsers: UserInfo[] = JSON.parse(localStorage.getItem('infoing') || '[]');

    const userFound = storedUsers.find(
        (user: UserInfo) => user.email.trim().toLowerCase() === emailValue && user.password === passwordHash
    );

    if (userFound) {
        localStorage.setItem('currentUser', JSON.stringify({ name: userFound.name, email: userFound.email }));
        window.location.href = "./Pages/marketplace.html";
    } else {
        alert(isAr
            ? "يرجى التأكد من صحة البريد الإلكتروني وكلمة المرور!"
            : "Please verify your input. Email or password incorrect!");
    }
}

// Toggle password visibility state and update visual icons
function togglePasswordVisibility(): void {
    if (!loginPasswordInput) return;

    const isPasswordType = loginPasswordInput.type === "password";
    loginPasswordInput.type = isPasswordType ? "text" : "password";

    if (isPasswordType) {
        loginEyeIcon?.classList.add("hidden");
        loginEyeOffIcon?.classList.remove("hidden");
    } else {
        loginEyeIcon?.classList.remove("hidden");
        loginEyeOffIcon?.classList.add("hidden");
    }
}

// Event listeners binding
if (loginSubmitButton) {
    loginSubmitButton.addEventListener('click', (event: Event) => { void handleLogin(event); });
}

if (togglePasswordButton) {
    togglePasswordButton.addEventListener("click", togglePasswordVisibility);
}