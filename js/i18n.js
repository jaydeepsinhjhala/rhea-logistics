// i18n engine
const supportedLanguages = ['en', 'gu', 'hi'];
let currentLang = localStorage.getItem('rhea_lang') || 'en';

if (!supportedLanguages.includes(currentLang)) {
    currentLang = 'en';
}

async function loadTranslations(lang) {
    try {
        const response = await fetch(`lang/${lang}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load ${lang}.json`);
        }
        const translations = await response.json();
        return translations;
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
    if (!translations) return;

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

        if (value) {
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

    document.documentElement.lang = currentLang;
}

async function changeLanguage(lang) {
    if (!supportedLanguages.includes(lang)) return;
    
    currentLang = lang;
    localStorage.setItem('rhea_lang', lang);
    
    const select = document.getElementById('lang-select');
    if (select) {
        select.value = lang;
    }

    const translations = await loadTranslations(lang);
    applyTranslations(translations);
}

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Language Selector
    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
        langSelect.value = currentLang;
        langSelect.addEventListener('change', (e) => {
            changeLanguage(e.target.value);
        });
    }

    // Initial load
    const translations = await loadTranslations(currentLang);
    applyTranslations(translations);
});
