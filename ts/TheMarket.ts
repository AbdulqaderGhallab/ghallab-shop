// User info interface matching localStorage structure
interface UserInfo {
    name?: string;
    email?: string;
    [key: string]: any;
}

document.addEventListener("DOMContentLoaded", (): void => {
    // Get language preference from localStorage (default: 'ar')
    const currentLang: string = (localStorage.getItem("language") || "ar").toLowerCase();
    const isAr: boolean = currentLang.startsWith("ar");

    // Get DOM elements
    const headingTextEl = document.getElementById("headingText") as HTMLSpanElement | null;
    const backHomeBtn = document.getElementById("backHomeBtn") as HTMLButtonElement | null;
    const nameElements = document.querySelectorAll<HTMLElement>(".myname");

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
    const updateNames = (text: string): void => {
        nameElements.forEach((el: HTMLElement) => {
            el.textContent = text;
        });
    };

    if (nameElements.length > 0) {
        const rawData: string | null = localStorage.getItem("infoing");
        if (rawData) {
            try {
                const information: UserInfo[] = JSON.parse(rawData);
                if (Array.isArray(information) && information.length > 0) {
                    const lastUser = information[information.length - 1];
                    updateNames(lastUser?.name || "");
                } else {
                    updateNames("");
                }
            } catch (error) {
                console.error("Error parsing user data:", error);
                updateNames("");
            }
        } else {
            updateNames("");
        }
    }
});