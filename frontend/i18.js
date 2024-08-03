

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
            document.querySelectorAll('[data-i18n]').forEach(el => {
                var key = el.getAttribute('data-i18n');
                var text = i18next.t(key);
                console.log(key, text)
                el.textContent = text;
            });

            document.getElementById('loading').style.display = 'none';
        });
})