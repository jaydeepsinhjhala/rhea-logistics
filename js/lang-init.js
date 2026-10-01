// Runs in <head>, before the page is drawn. For a visitor who chose Hindi or
// Gujarati it hides the (English) translatable text until i18n.js swaps it,
// and starts downloading the translation now instead of after the page loads.
(function () {
    var lang = null;
    try {
        lang = localStorage.getItem('rhea_lang');
    } catch (error) {
        return; // Storage blocked: no saved choice, the page stays in English
    }
    if (lang !== 'hi' && lang !== 'gu') return;

    var root = document.documentElement;
    root.classList.add('i18n-pending');

    var request = fetch('lang/' + lang + '.json');
    request.catch(function () {}); // i18n.js handles failure; avoid an unhandled-rejection warning
    window.rheaLangPreload = { lang: lang, request: request };

    // Never keep text hidden for long: show English if loading stalls
    setTimeout(function () {
        root.classList.remove('i18n-pending');
    }, 3000);
})();
