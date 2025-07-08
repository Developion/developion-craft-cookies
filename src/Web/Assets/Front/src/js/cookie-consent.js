import './gtag';

(function () {
  const consentBar = document.querySelector('.cookie-consent-bar');
  const cookieOpener = document.querySelector('.cookie-opener-icon');

  document.addEventListener('DOMContentLoaded', initCookieBar);

  function initCookieBar() {
    sendCookies();

    if (!hasConsent()) {
      showConsentBar();
      animateCookie();
      document.dispatchEvent(new CustomEvent('cookieConsentOnLoad'));
    } else {
      showCookieOpener();
    }

    if (!window.__cookieConsentInitialized) {
      window.__cookieConsentInitialized = true;
      initializeEventListeners();
    }
  }

  function hasConsent() {
    return getCookie('cookieConsent_consent') === 'true';
  }

  function animateCookie() {
    const cookieImage = document.querySelector('.cookie-consent-bar .cookie-image');
    if (!cookieImage) return;
    cookieImage.classList.add('animate');
    setTimeout(() => cookieImage.classList.remove('animate'), 2000);
  }

  function showCookieOpener() {
    if (cookieOpener) cookieOpener.style.display = 'flex';
  }

  function initializeEventListeners() {
    bindConsentAction('[data-action="accept-all"]', {
      essential: true,
      analytics: true,
      marketing: true
    }, 'ACCEPT_ALL');

    bindConsentAction('[data-action="deny-all"]', {
      essential: true,
      analytics: false,
      marketing: false
    }, 'DENY_ALL');

    bindClick('[data-action="open-settings"]', showSettingsPanel);
    bindClick('[data-action="close-settings"]', hideSettingsPanel);

    document.querySelectorAll('[data-action="save-preferences"]').forEach(button => {
      button.addEventListener('click', () => {
        const preferences = {
          essential: true,
          analytics: document.querySelector('input[data-category="analytics"]').checked,
          marketing: document.querySelector('input[data-category="marketing"]').checked
        };
        saveConsent(preferences, 'UPDATE');
        hideSettingsPanel();
        hideConsentBar();
      });
    });

    document.querySelectorAll('.category-dropdown-opener').forEach(button => {
      button.addEventListener('click', e => {
        const holder = e.target.closest('.cookie-category');
        const list = holder.querySelector('.category-services-list');
        const expanded = holder.classList.toggle('expanded');
        list.style.maxHeight = expanded ? `${list.scrollHeight}px` : '0px';
        return false;
      });
    });

    const toggleButton = document.querySelector('.cookie-opener-icon button');
    if (toggleButton) {
      toggleButton.addEventListener('click', () => {
        consentBar.classList.toggle('show');
        return false;
      });
    }
  }

  function bindConsentAction(selector, preferences, status) {
    document.querySelectorAll(selector).forEach(button => {
      button.addEventListener('click', () => {
        saveConsent(preferences, status);
        hideConsentBar();
        showCookieOpener();
      });
    });
  }

  function bindClick(selector, callback) {
    document.querySelectorAll(selector).forEach(button => {
      button.addEventListener('click', callback);
    });
  }

  function saveConsent(preferences, status) {
    const expiration = new Date();
    expiration.setFullYear(expiration.getFullYear() + 1);

    setCookie('cookieConsent_consent', 'true', expiration);
    setCookie('cookieConsent_essential', 'true', expiration);
    setCookie('cookieConsent_analytics', preferences.analytics ? 'true' : 'false', expiration);
    setCookie('cookieConsent_marketing', preferences.marketing ? 'true' : 'false', expiration);

    const formData = new FormData();
    formData.append('analytics', preferences.analytics ? '1' : '0');
    formData.append('marketing', preferences.marketing ? '1' : '0');

    fetch('/actions/_craft-cookies/consent/save-preferences', {
      method: 'POST',
      body: formData,
      headers: {
        'X-CSRF-Token': getCsrfToken(),
        'X-Requested-With': 'XMLHttpRequest'
      }
    }).catch(error => console.error('Error saving cookie preferences:', error));

    document.dispatchEvent(new CustomEvent('cookieConsentUpdated', {
      detail: { preferences, status }
    }));
  }

  function getCsrfToken() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : '';
  }

  function showConsentBar() {
    consentBar?.classList.add('show');
  }

  function hideConsentBar() {
    consentBar?.classList.remove('show');
  }

  function showSettingsPanel() {
    consentBar?.classList.add('show-settings');
  }

  function hideSettingsPanel() {
    consentBar?.classList.remove('show-settings');
  }

  function setCookie(name, value, expires) {
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  }

  function getCookie(name) {
    return document.cookie.split('; ').reduce((acc, pair) => {
      const [key, val] = pair.split('=');
      return key === name ? decodeURIComponent(val) : acc;
    }, null);
  }

  function sendCookies() {
    const formData = new FormData();
    formData.append('cookies', JSON.stringify(getAllCookies()));
    fetch('/actions/_craft-cookies/consent/send-cookies', {
      method: 'POST',
      body: formData
    });
  }

  function getAllCookies() {
    return document.cookie.split('; ').reduce((acc, cookie) => {
      const [key, val] = cookie.split('=');
      acc[decodeURIComponent(key)] = decodeURIComponent(val);
      return acc;
    }, {});
  }
})();
