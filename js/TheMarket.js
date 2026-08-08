document.addEventListener("DOMContentLoaded", () => {
    // Get language preference from localStorage (default: 'ar')
    const currentLang = (localStorage.getItem("language") || "ar").toLowerCase();
    const isAr = currentLang.startsWith("ar");
    // Get DOM elements
    const headingTextEl = document.getElementById("headingText");
    const backHomeBtn = document.getElementById("backHomeBtn");
    const nameElements = document.querySelectorAll(".myname");
    // Update localized text
    if (headingTextEl) {
        headingTextEl.textContent = isAr
            ? "الموقع قيد البناء عزيزي/عزيزتي "
            : "The website is under construction, dear ";
    }
    if (backHomeBtn) {
        backHomeBtn.textContent = isAr ? "العودة للرئيسية" : "Back to Home";
    }
    // Helper to update user name elements
    const updateNames = (text) => {
        nameElements.forEach((el) => {
            el.textContent = text;
        });
    };
    if (nameElements.length > 0) {
        const rawData = localStorage.getItem("infoing");
        if (rawData) {
            try {
                const information = JSON.parse(rawData);
                if (Array.isArray(information) && information.length > 0) {
                    const lastUser = information[information.length - 1];
                    updateNames(lastUser?.name || "");
                }
                else {
                    updateNames("");
                }
            }
            catch (error) {
                console.error("Error parsing user data:", error);
                updateNames("");
            }
        }
        else {
            updateNames("");
        }
    }
});
export {};
//# sourceMappingURL=TheMarket.js.map