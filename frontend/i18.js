// Detect user language and apply.
document.addEventListener('DOMContentLoaded', function () {
    i18next
        .use(i18nextHttpBackend)
        .use(i18nextBrowserLanguageDetector)
        .init({
            fallbackLng: 'en',
            backend: {
                loadPath: 'locales/{{lng}}.json'
            },
            detection: {
                order: ['navigator'],
            }
        }, function (err, t) {
            // Apply text.
            document.querySelectorAll('[data-i18n]').forEach(el => {
                var key = el.getAttribute('data-i18n');
                var text = i18next.t(key);
                el.textContent = text;
            });

            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                var key = el.getAttribute('data-i18n-placeholder');
                var text = i18next.t(key);
                el.placeholder = text;
            });

            // Update UI.
            document.getElementById('loading').style.display = 'none';
            addPersonCard();
        });
})