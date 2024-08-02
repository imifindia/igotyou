

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
        }, function (err, t) {
            if (err) {
                return console.error(err);
            }

            var lang = navigator.language || navigator.userLanguage;
            lang = lang.substring(0, 2);

            i18next.changeLanguage(lang, (err, t) => {
                if (err) {
                    return console.error(err);
                }

                document.querySelectorAll('[data-i18n]').forEach(el => {
                    el.textContent = t(el.getAttribute('data-i18n'));
                });
            });
        });


})