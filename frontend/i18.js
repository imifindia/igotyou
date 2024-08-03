

// Detect user language and apply.
document.addEventListener('DOMContentLoaded', function () {
    i18next
        .use(i18nextHttpBackend)
        .use(i18nextBrowserLanguageDetector)
        .init({
            fallbackLng: 'en',
            backend: {
                loadPath: '/locales/{{lng}}.json'
            },
            detection: {
                order: ['navigator'],
            }
        }, function (err, t) {
            if (err) {
                return console.error(err);
            }

            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                el.textContent = i18next.t(key);
            });
        });
})