// i18n engine
const supportedLanguages = ['en', 'gu', 'hi'];
const STORAGE_KEY = 'rhea_lang';

// localStorage can throw (blocked cookies, some private modes); without these
// guards the whole script fails and the language selector stops working.
function readStoredLanguage() {
    try {
        return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
        return null;
    }
}

function storeLanguage(lang) {
    try {
        localStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
        // Storage unavailable: the choice still applies, it just won't persist.
    }
}

let currentLang = readStoredLanguage() || 'en';

if (!supportedLanguages.includes(currentLang)) {
    currentLang = 'en';
}

// Incremented per request so a slow response for an earlier choice cannot
// overwrite the language the user picked afterwards.
let latestRequest = 0;

// lang-init.js may already have started this download in <head>; use it once.
function fetchLanguageFile(lang) {
    const early = window.rheaLangPreload;
    if (early && early.lang === lang) {
        window.rheaLangPreload = null;
        return early.request;
    }
    return fetch(`lang/${lang}.json`);
}

// Resolves to { lang, translations } for the language actually loaded
// (English if the requested one failed), or null if nothing could be loaded.
async function loadTranslations(lang) {
    try {
        const response = await fetchLanguageFile(lang);
        if (!response.ok) {
            throw new Error(`Failed to load ${lang}.json`);
        }
        const translations = await response.json();
        return { lang, translations };
    } catch (error) {
        console.error('Error loading translations:', error);
        // Fallback to English if translation fails to load
        if (lang !== 'en') {
            return loadTranslations('en');
        }
        return null;
    }
}

function applyTranslations(translations) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');

        // Handle nested keys e.g. "header.home"
        const keys = key.split('.');
        let value = translations;
        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                value = null;
                break;
            }
        }

        if (typeof value === 'string') {
            // Check if element is an input with placeholder
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.hasAttribute('placeholder')) {
                    element.placeholder = value;
                }
            } else {
                element.textContent = value;
            }
        }
    });
}

async function changeLanguage(lang) {
    if (!supportedLanguages.includes(lang)) return;

    const request = ++latestRequest;
    const result = await loadTranslations(lang);
    if (request !== latestRequest) return;

    // Keep the selector and <html lang> in line with what is on screen, even
    // when loading failed or fell back to English.
    const select = document.getElementById('lang-select');
    if (result) {
        applyTranslations(result.translations);
        currentLang = result.lang;
    }
    document.documentElement.lang = currentLang;
    if (select) select.value = currentLang;

    // Text hidden by lang-init.js can be shown now, translated or not
    document.documentElement.classList.remove('i18n-pending');
}

document.addEventListener('DOMContentLoaded', () => {
    // The page ships in English, so that is what is on screen until a load succeeds
    const initialLang = currentLang;
    currentLang = 'en';

    // Initialize Language Selector
    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
        langSelect.value = initialLang;
        langSelect.addEventListener('change', (e) => {
            storeLanguage(e.target.value);
            changeLanguage(e.target.value);
        });
    }

    // Initial load
    changeLanguage(initialLang);
});
