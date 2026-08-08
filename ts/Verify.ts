// DOM elements for email verification feedback status
const emailSuccessIcon = document.getElementById('emailtrue') as HTMLElement | null;
const emailFailIcon = document.getElementById('emailfalse') as HTMLElement | null;
const spinnerIcon = document.getElementById('iconContainer') as HTMLElement | null;

// Validate email verification token from URL query against local storage
function verifyEmailToken(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("token");
    const storedToken = localStorage.getItem('tokenlink');

    console.log("[Auth] URL Token:", urlToken);
    console.log("[Auth] Stored Token:", storedToken);

    if (urlToken && storedToken && urlToken === storedToken) {
        // Persist verified status across browser sessions
        localStorage.setItem('emailVerified', 'true');
        localStorage.setItem('thestatus', 'true');

        // Broadcast status update to active application tabs
        try {
            const channel = new BroadcastChannel("email_verification_channel");
            channel.postMessage("SUCCESS");
            setTimeout(() => channel.close(), 500);
        } catch (error) {
            console.warn("[Auth] BroadcastChannel API not supported in this environment.", error);
        }

        console.log("[Auth] Verification successful.");

        emailSuccessIcon?.classList.remove('hidden');
        spinnerIcon?.classList.add('hidden');
    } else {
        localStorage.setItem('thestatus', 'false');
        console.warn("[Auth] Token mismatch or missing.");

        emailFailIcon?.classList.remove('hidden');
        spinnerIcon?.classList.add('hidden');
    }
}

// Execute token verification on script initialization
verifyEmailToken();