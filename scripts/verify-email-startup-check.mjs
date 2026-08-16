/**
 * Regression check for email verification startup logic.
 * Simulates a page refresh after the user verified their email in another tab.
 */

function resolveVerificationStartup({ savedEmailVerified, verifiedFor, emailInputValue }) {
    let currentEmailValue = emailInputValue.trim().toLowerCase();
    const emailInput = { value: emailInputValue };
    let showVerified = false;
    let clearedVerification = false;
    const storage = {
        emailVerified: savedEmailVerified ? 'true' : null,
        verifiedEmailAddress: verifiedFor,
    };

    if (savedEmailVerified && verifiedFor) {
        if (!currentEmailValue) {
            emailInput.value = verifiedFor;
            currentEmailValue = verifiedFor;
        }

        if (verifiedFor === currentEmailValue) {
            showVerified = true;
        }
    } else if (savedEmailVerified && currentEmailValue && verifiedFor && verifiedFor !== currentEmailValue) {
        storage.emailVerified = null;
        storage.verifiedEmailAddress = null;
        clearedVerification = true;
    }

    return {
        showVerified,
        clearedVerification,
        emailInputValue: emailInput.value,
        emailVerified: storage.emailVerified,
        verifiedEmailAddress: storage.verifiedEmailAddress,
    };
}

function assert(condition, message) {
    if (!condition) {
        console.error('FAIL:', message);
        process.exit(1);
    }
    console.log('PASS:', message);
}

const refreshScenario = resolveVerificationStartup({
    savedEmailVerified: true,
    verifiedFor: 'user@example.com',
    emailInputValue: '',
});

assert(refreshScenario.showVerified === true, 'refresh keeps verified UI after empty input on load');
assert(refreshScenario.clearedVerification === false, 'refresh does not wipe verification state');
assert(refreshScenario.emailInputValue === 'user@example.com', 'refresh restores verified email into the input');
assert(refreshScenario.emailVerified === 'true', 'refresh keeps emailVerified in storage');

const mismatchedEmailScenario = resolveVerificationStartup({
    savedEmailVerified: true,
    verifiedFor: 'user@example.com',
    emailInputValue: 'other@example.com',
});

assert(mismatchedEmailScenario.showVerified === false, 'mismatched typed email does not show verified UI');

console.log('\nAll email verification startup checks passed.');
