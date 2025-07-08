(function () {
  'use strict';

  /**
   * Updates Google Consent Mode (`gtag`) configuration based on user preferences.
   *
   * Applies cookie consent selections dynamically to `gtag('consent', 'update', ...)`.
   * Handles full denial, full acceptance, or custom updates based on individual preferences.
   *
   * @param {CustomEvent} e - Custom event carrying user consent data.
   * @param {Object} e.detail.preferences - User's cookie consent breakdown.
   * @param {boolean} e.detail.preferences.essential - Essential cookies (not used here; always allowed).
   * @param {boolean} e.detail.preferences.analytics - Google Analytics consent.
   * @param {boolean} e.detail.preferences.marketing - Advertising and marketing consent.
   * @param {string} e.detail.status - Consent state: 'ACCEPT_ALL', 'DENY_ALL', or 'UPDATE'.
   *
   * @example
   * document.dispatchEvent(new CustomEvent('cookieConsentUpdated', {
   *   detail: {
   *     status: 'UPDATE',
   *     preferences: {
   *       essential: true,
   *       analytics: false,
   *       marketing: true
   *     }
   *   }
   * }));
   */
  function handleConsentUpdate(e) {
    if (typeof window.gtag !== 'function') return;

    const { preferences, status } = e.detail;
    const { analytics, marketing } = preferences || {};
    let options = {};

    switch (status) {
      case 'DENY_ALL':
        options = Object.fromEntries(
          [
            'analytics_storage',
            'ad_storage',
            'ad_user_data',
            'ad_personalization',
            'personalization_storage',
            'functionality_storage',
            'security_storage',
          ].map(key => [key, 'denied'])
        );
        break;

      case 'ACCEPT_ALL':
        options = Object.fromEntries(
          [
            'analytics_storage',
            'ad_storage',
            'ad_user_data',
            'ad_personalization',
            'personalization_storage',
            'functionality_storage',
            'security_storage',
          ].map(key => [key, 'granted'])
        );
        break;

      case 'UPDATE':
        options = {
          analytics_storage: analytics ? 'granted' : 'denied',
          ad_storage: marketing ? 'granted' : 'denied',
          ad_user_data: marketing ? 'granted' : 'denied',
          ad_personalization: marketing ? 'granted' : 'denied',
          personalization_storage: marketing ? 'granted' : 'denied',
          // functionality & security_storage omitted (assumed granted)
        };
        break;

      default:
        console.warn('Unknown consent status:', status);
        return;
    }

    gtag('consent', 'update', options);
    gtag('config', 'G-XXXXXXXXXX');
  }
  document.addEventListener('cookieConsentUpdated', handleConsentUpdate);

  /**
   * Sets the default Google Consent Mode configuration before user action.
   *
   * Denies all non-essential storage categories until explicit consent is received.
   * Grants essential functionality and security storage by default.
   */
  function setDefaultGtagConfig() {
    if (typeof window.gtag !== 'function') return;

    gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      personalization_storage: 'denied',
      functionality_storage: 'granted',
      security_storage: 'granted',
      wait_for_update: 500,
    });
  }
  document.addEventListener('cookieConsentOnLoad', setDefaultGtagConfig);

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

})();
//# sourceMappingURL=cookie-consent.js.map

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29va2llLWNvbnNlbnQuanMiLCJzb3VyY2VzIjpbInNyYy9XZWIvQXNzZXRzL0Zyb250L3NyYy9qcy9ndGFnLmpzIiwic3JjL1dlYi9Bc3NldHMvRnJvbnQvc3JjL2pzL2Nvb2tpZS1jb25zZW50LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVXBkYXRlcyBHb29nbGUgQ29uc2VudCBNb2RlIChgZ3RhZ2ApIGNvbmZpZ3VyYXRpb24gYmFzZWQgb24gdXNlciBwcmVmZXJlbmNlcy5cbiAqXG4gKiBBcHBsaWVzIGNvb2tpZSBjb25zZW50IHNlbGVjdGlvbnMgZHluYW1pY2FsbHkgdG8gYGd0YWcoJ2NvbnNlbnQnLCAndXBkYXRlJywgLi4uKWAuXG4gKiBIYW5kbGVzIGZ1bGwgZGVuaWFsLCBmdWxsIGFjY2VwdGFuY2UsIG9yIGN1c3RvbSB1cGRhdGVzIGJhc2VkIG9uIGluZGl2aWR1YWwgcHJlZmVyZW5jZXMuXG4gKlxuICogQHBhcmFtIHtDdXN0b21FdmVudH0gZSAtIEN1c3RvbSBldmVudCBjYXJyeWluZyB1c2VyIGNvbnNlbnQgZGF0YS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBlLmRldGFpbC5wcmVmZXJlbmNlcyAtIFVzZXIncyBjb29raWUgY29uc2VudCBicmVha2Rvd24uXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGUuZGV0YWlsLnByZWZlcmVuY2VzLmVzc2VudGlhbCAtIEVzc2VudGlhbCBjb29raWVzIChub3QgdXNlZCBoZXJlOyBhbHdheXMgYWxsb3dlZCkuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGUuZGV0YWlsLnByZWZlcmVuY2VzLmFuYWx5dGljcyAtIEdvb2dsZSBBbmFseXRpY3MgY29uc2VudC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZS5kZXRhaWwucHJlZmVyZW5jZXMubWFya2V0aW5nIC0gQWR2ZXJ0aXNpbmcgYW5kIG1hcmtldGluZyBjb25zZW50LlxuICogQHBhcmFtIHtzdHJpbmd9IGUuZGV0YWlsLnN0YXR1cyAtIENvbnNlbnQgc3RhdGU6ICdBQ0NFUFRfQUxMJywgJ0RFTllfQUxMJywgb3IgJ1VQREFURScuXG4gKlxuICogQGV4YW1wbGVcbiAqIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdjb29raWVDb25zZW50VXBkYXRlZCcsIHtcbiAqICAgZGV0YWlsOiB7XG4gKiAgICAgc3RhdHVzOiAnVVBEQVRFJyxcbiAqICAgICBwcmVmZXJlbmNlczoge1xuICogICAgICAgZXNzZW50aWFsOiB0cnVlLFxuICogICAgICAgYW5hbHl0aWNzOiBmYWxzZSxcbiAqICAgICAgIG1hcmtldGluZzogdHJ1ZVxuICogICAgIH1cbiAqICAgfVxuICogfSkpO1xuICovXG5mdW5jdGlvbiBoYW5kbGVDb25zZW50VXBkYXRlKGUpIHtcbiAgaWYgKHR5cGVvZiB3aW5kb3cuZ3RhZyAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuO1xuXG4gIGNvbnN0IHsgcHJlZmVyZW5jZXMsIHN0YXR1cyB9ID0gZS5kZXRhaWw7XG4gIGNvbnN0IHsgYW5hbHl0aWNzLCBtYXJrZXRpbmcgfSA9IHByZWZlcmVuY2VzIHx8IHt9O1xuICBsZXQgb3B0aW9ucyA9IHt9O1xuXG4gIHN3aXRjaCAoc3RhdHVzKSB7XG4gICAgY2FzZSAnREVOWV9BTEwnOlxuICAgICAgb3B0aW9ucyA9IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgICAgW1xuICAgICAgICAgICdhbmFseXRpY3Nfc3RvcmFnZScsXG4gICAgICAgICAgJ2FkX3N0b3JhZ2UnLFxuICAgICAgICAgICdhZF91c2VyX2RhdGEnLFxuICAgICAgICAgICdhZF9wZXJzb25hbGl6YXRpb24nLFxuICAgICAgICAgICdwZXJzb25hbGl6YXRpb25fc3RvcmFnZScsXG4gICAgICAgICAgJ2Z1bmN0aW9uYWxpdHlfc3RvcmFnZScsXG4gICAgICAgICAgJ3NlY3VyaXR5X3N0b3JhZ2UnLFxuICAgICAgICBdLm1hcChrZXkgPT4gW2tleSwgJ2RlbmllZCddKVxuICAgICAgKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnQUNDRVBUX0FMTCc6XG4gICAgICBvcHRpb25zID0gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgICBbXG4gICAgICAgICAgJ2FuYWx5dGljc19zdG9yYWdlJyxcbiAgICAgICAgICAnYWRfc3RvcmFnZScsXG4gICAgICAgICAgJ2FkX3VzZXJfZGF0YScsXG4gICAgICAgICAgJ2FkX3BlcnNvbmFsaXphdGlvbicsXG4gICAgICAgICAgJ3BlcnNvbmFsaXphdGlvbl9zdG9yYWdlJyxcbiAgICAgICAgICAnZnVuY3Rpb25hbGl0eV9zdG9yYWdlJyxcbiAgICAgICAgICAnc2VjdXJpdHlfc3RvcmFnZScsXG4gICAgICAgIF0ubWFwKGtleSA9PiBba2V5LCAnZ3JhbnRlZCddKVxuICAgICAgKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnVVBEQVRFJzpcbiAgICAgIG9wdGlvbnMgPSB7XG4gICAgICAgIGFuYWx5dGljc19zdG9yYWdlOiBhbmFseXRpY3MgPyAnZ3JhbnRlZCcgOiAnZGVuaWVkJyxcbiAgICAgICAgYWRfc3RvcmFnZTogbWFya2V0aW5nID8gJ2dyYW50ZWQnIDogJ2RlbmllZCcsXG4gICAgICAgIGFkX3VzZXJfZGF0YTogbWFya2V0aW5nID8gJ2dyYW50ZWQnIDogJ2RlbmllZCcsXG4gICAgICAgIGFkX3BlcnNvbmFsaXphdGlvbjogbWFya2V0aW5nID8gJ2dyYW50ZWQnIDogJ2RlbmllZCcsXG4gICAgICAgIHBlcnNvbmFsaXphdGlvbl9zdG9yYWdlOiBtYXJrZXRpbmcgPyAnZ3JhbnRlZCcgOiAnZGVuaWVkJyxcbiAgICAgICAgLy8gZnVuY3Rpb25hbGl0eSAmIHNlY3VyaXR5X3N0b3JhZ2Ugb21pdHRlZCAoYXNzdW1lZCBncmFudGVkKVxuICAgICAgfTtcbiAgICAgIGJyZWFrO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIGNvbnNvbGUud2FybignVW5rbm93biBjb25zZW50IHN0YXR1czonLCBzdGF0dXMpO1xuICAgICAgcmV0dXJuO1xuICB9XG5cbiAgZ3RhZygnY29uc2VudCcsICd1cGRhdGUnLCBvcHRpb25zKTtcbiAgZ3RhZygnY29uZmlnJywgJ0ctWFhYWFhYWFhYWCcpO1xufVxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY29va2llQ29uc2VudFVwZGF0ZWQnLCBoYW5kbGVDb25zZW50VXBkYXRlKTtcblxuLyoqXG4gKiBTZXRzIHRoZSBkZWZhdWx0IEdvb2dsZSBDb25zZW50IE1vZGUgY29uZmlndXJhdGlvbiBiZWZvcmUgdXNlciBhY3Rpb24uXG4gKlxuICogRGVuaWVzIGFsbCBub24tZXNzZW50aWFsIHN0b3JhZ2UgY2F0ZWdvcmllcyB1bnRpbCBleHBsaWNpdCBjb25zZW50IGlzIHJlY2VpdmVkLlxuICogR3JhbnRzIGVzc2VudGlhbCBmdW5jdGlvbmFsaXR5IGFuZCBzZWN1cml0eSBzdG9yYWdlIGJ5IGRlZmF1bHQuXG4gKi9cbmZ1bmN0aW9uIHNldERlZmF1bHRHdGFnQ29uZmlnKCkge1xuICBpZiAodHlwZW9mIHdpbmRvdy5ndGFnICE9PSAnZnVuY3Rpb24nKSByZXR1cm47XG5cbiAgZ3RhZygnY29uc2VudCcsICdkZWZhdWx0Jywge1xuICAgIGFuYWx5dGljc19zdG9yYWdlOiAnZGVuaWVkJyxcbiAgICBhZF9zdG9yYWdlOiAnZGVuaWVkJyxcbiAgICBhZF91c2VyX2RhdGE6ICdkZW5pZWQnLFxuICAgIGFkX3BlcnNvbmFsaXphdGlvbjogJ2RlbmllZCcsXG4gICAgcGVyc29uYWxpemF0aW9uX3N0b3JhZ2U6ICdkZW5pZWQnLFxuICAgIGZ1bmN0aW9uYWxpdHlfc3RvcmFnZTogJ2dyYW50ZWQnLFxuICAgIHNlY3VyaXR5X3N0b3JhZ2U6ICdncmFudGVkJyxcbiAgICB3YWl0X2Zvcl91cGRhdGU6IDUwMCxcbiAgfSk7XG59XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjb29raWVDb25zZW50T25Mb2FkJywgc2V0RGVmYXVsdEd0YWdDb25maWcpO1xuIiwiaW1wb3J0ICcuL2d0YWcnO1xuXG4oZnVuY3Rpb24gKCkge1xuICBjb25zdCBjb25zZW50QmFyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvb2tpZS1jb25zZW50LWJhcicpO1xuICBjb25zdCBjb29raWVPcGVuZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY29va2llLW9wZW5lci1pY29uJyk7XG5cbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGluaXRDb29raWVCYXIpO1xuXG4gIGZ1bmN0aW9uIGluaXRDb29raWVCYXIoKSB7XG4gICAgc2VuZENvb2tpZXMoKTtcblxuICAgIGlmICghaGFzQ29uc2VudCgpKSB7XG4gICAgICBzaG93Q29uc2VudEJhcigpO1xuICAgICAgYW5pbWF0ZUNvb2tpZSgpO1xuICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2Nvb2tpZUNvbnNlbnRPbkxvYWQnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNob3dDb29raWVPcGVuZXIoKTtcbiAgICB9XG5cbiAgICBpZiAoIXdpbmRvdy5fX2Nvb2tpZUNvbnNlbnRJbml0aWFsaXplZCkge1xuICAgICAgd2luZG93Ll9fY29va2llQ29uc2VudEluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgIGluaXRpYWxpemVFdmVudExpc3RlbmVycygpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGhhc0NvbnNlbnQoKSB7XG4gICAgcmV0dXJuIGdldENvb2tpZSgnY29va2llQ29uc2VudF9jb25zZW50JykgPT09ICd0cnVlJztcbiAgfVxuXG4gIGZ1bmN0aW9uIGFuaW1hdGVDb29raWUoKSB7XG4gICAgY29uc3QgY29va2llSW1hZ2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY29va2llLWNvbnNlbnQtYmFyIC5jb29raWUtaW1hZ2UnKTtcbiAgICBpZiAoIWNvb2tpZUltYWdlKSByZXR1cm47XG4gICAgY29va2llSW1hZ2UuY2xhc3NMaXN0LmFkZCgnYW5pbWF0ZScpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4gY29va2llSW1hZ2UuY2xhc3NMaXN0LnJlbW92ZSgnYW5pbWF0ZScpLCAyMDAwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNob3dDb29raWVPcGVuZXIoKSB7XG4gICAgaWYgKGNvb2tpZU9wZW5lcikgY29va2llT3BlbmVyLnN0eWxlLmRpc3BsYXkgPSAnZmxleCc7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0aWFsaXplRXZlbnRMaXN0ZW5lcnMoKSB7XG4gICAgYmluZENvbnNlbnRBY3Rpb24oJ1tkYXRhLWFjdGlvbj1cImFjY2VwdC1hbGxcIl0nLCB7XG4gICAgICBlc3NlbnRpYWw6IHRydWUsXG4gICAgICBhbmFseXRpY3M6IHRydWUsXG4gICAgICBtYXJrZXRpbmc6IHRydWVcbiAgICB9LCAnQUNDRVBUX0FMTCcpO1xuXG4gICAgYmluZENvbnNlbnRBY3Rpb24oJ1tkYXRhLWFjdGlvbj1cImRlbnktYWxsXCJdJywge1xuICAgICAgZXNzZW50aWFsOiB0cnVlLFxuICAgICAgYW5hbHl0aWNzOiBmYWxzZSxcbiAgICAgIG1hcmtldGluZzogZmFsc2VcbiAgICB9LCAnREVOWV9BTEwnKTtcblxuICAgIGJpbmRDbGljaygnW2RhdGEtYWN0aW9uPVwib3Blbi1zZXR0aW5nc1wiXScsIHNob3dTZXR0aW5nc1BhbmVsKTtcbiAgICBiaW5kQ2xpY2soJ1tkYXRhLWFjdGlvbj1cImNsb3NlLXNldHRpbmdzXCJdJywgaGlkZVNldHRpbmdzUGFuZWwpO1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtYWN0aW9uPVwic2F2ZS1wcmVmZXJlbmNlc1wiXScpLmZvckVhY2goYnV0dG9uID0+IHtcbiAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgY29uc3QgcHJlZmVyZW5jZXMgPSB7XG4gICAgICAgICAgZXNzZW50aWFsOiB0cnVlLFxuICAgICAgICAgIGFuYWx5dGljczogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXRbZGF0YS1jYXRlZ29yeT1cImFuYWx5dGljc1wiXScpLmNoZWNrZWQsXG4gICAgICAgICAgbWFya2V0aW5nOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbnB1dFtkYXRhLWNhdGVnb3J5PVwibWFya2V0aW5nXCJdJykuY2hlY2tlZFxuICAgICAgICB9O1xuICAgICAgICBzYXZlQ29uc2VudChwcmVmZXJlbmNlcywgJ1VQREFURScpO1xuICAgICAgICBoaWRlU2V0dGluZ3NQYW5lbCgpO1xuICAgICAgICBoaWRlQ29uc2VudEJhcigpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY2F0ZWdvcnktZHJvcGRvd24tb3BlbmVyJykuZm9yRWFjaChidXR0b24gPT4ge1xuICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgIGNvbnN0IGhvbGRlciA9IGUudGFyZ2V0LmNsb3Nlc3QoJy5jb29raWUtY2F0ZWdvcnknKTtcbiAgICAgICAgY29uc3QgbGlzdCA9IGhvbGRlci5xdWVyeVNlbGVjdG9yKCcuY2F0ZWdvcnktc2VydmljZXMtbGlzdCcpO1xuICAgICAgICBjb25zdCBleHBhbmRlZCA9IGhvbGRlci5jbGFzc0xpc3QudG9nZ2xlKCdleHBhbmRlZCcpO1xuICAgICAgICBsaXN0LnN0eWxlLm1heEhlaWdodCA9IGV4cGFuZGVkID8gYCR7bGlzdC5zY3JvbGxIZWlnaHR9cHhgIDogJzBweCc7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgY29uc3QgdG9nZ2xlQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvb2tpZS1vcGVuZXItaWNvbiBidXR0b24nKTtcbiAgICBpZiAodG9nZ2xlQnV0dG9uKSB7XG4gICAgICB0b2dnbGVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIGNvbnNlbnRCYXIuY2xhc3NMaXN0LnRvZ2dsZSgnc2hvdycpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBiaW5kQ29uc2VudEFjdGlvbihzZWxlY3RvciwgcHJlZmVyZW5jZXMsIHN0YXR1cykge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpLmZvckVhY2goYnV0dG9uID0+IHtcbiAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgc2F2ZUNvbnNlbnQocHJlZmVyZW5jZXMsIHN0YXR1cyk7XG4gICAgICAgIGhpZGVDb25zZW50QmFyKCk7XG4gICAgICAgIHNob3dDb29raWVPcGVuZXIoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gYmluZENsaWNrKHNlbGVjdG9yLCBjYWxsYmFjaykge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpLmZvckVhY2goYnV0dG9uID0+IHtcbiAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNhdmVDb25zZW50KHByZWZlcmVuY2VzLCBzdGF0dXMpIHtcbiAgICBjb25zdCBleHBpcmF0aW9uID0gbmV3IERhdGUoKTtcbiAgICBleHBpcmF0aW9uLnNldEZ1bGxZZWFyKGV4cGlyYXRpb24uZ2V0RnVsbFllYXIoKSArIDEpO1xuXG4gICAgc2V0Q29va2llKCdjb29raWVDb25zZW50X2NvbnNlbnQnLCAndHJ1ZScsIGV4cGlyYXRpb24pO1xuICAgIHNldENvb2tpZSgnY29va2llQ29uc2VudF9lc3NlbnRpYWwnLCAndHJ1ZScsIGV4cGlyYXRpb24pO1xuICAgIHNldENvb2tpZSgnY29va2llQ29uc2VudF9hbmFseXRpY3MnLCBwcmVmZXJlbmNlcy5hbmFseXRpY3MgPyAndHJ1ZScgOiAnZmFsc2UnLCBleHBpcmF0aW9uKTtcbiAgICBzZXRDb29raWUoJ2Nvb2tpZUNvbnNlbnRfbWFya2V0aW5nJywgcHJlZmVyZW5jZXMubWFya2V0aW5nID8gJ3RydWUnIDogJ2ZhbHNlJywgZXhwaXJhdGlvbik7XG5cbiAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuICAgIGZvcm1EYXRhLmFwcGVuZCgnYW5hbHl0aWNzJywgcHJlZmVyZW5jZXMuYW5hbHl0aWNzID8gJzEnIDogJzAnKTtcbiAgICBmb3JtRGF0YS5hcHBlbmQoJ21hcmtldGluZycsIHByZWZlcmVuY2VzLm1hcmtldGluZyA/ICcxJyA6ICcwJyk7XG5cbiAgICBmZXRjaCgnL2FjdGlvbnMvX2NyYWZ0LWNvb2tpZXMvY29uc2VudC9zYXZlLXByZWZlcmVuY2VzJywge1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICBib2R5OiBmb3JtRGF0YSxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ1gtQ1NSRi1Ub2tlbic6IGdldENzcmZUb2tlbigpLFxuICAgICAgICAnWC1SZXF1ZXN0ZWQtV2l0aCc6ICdYTUxIdHRwUmVxdWVzdCdcbiAgICAgIH1cbiAgICB9KS5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKCdFcnJvciBzYXZpbmcgY29va2llIHByZWZlcmVuY2VzOicsIGVycm9yKSk7XG5cbiAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnY29va2llQ29uc2VudFVwZGF0ZWQnLCB7XG4gICAgICBkZXRhaWw6IHsgcHJlZmVyZW5jZXMsIHN0YXR1cyB9XG4gICAgfSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0Q3NyZlRva2VuKCkge1xuICAgIGNvbnN0IG1ldGEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdtZXRhW25hbWU9XCJjc3JmLXRva2VuXCJdJyk7XG4gICAgcmV0dXJuIG1ldGEgPyBtZXRhLmdldEF0dHJpYnV0ZSgnY29udGVudCcpIDogJyc7XG4gIH1cblxuICBmdW5jdGlvbiBzaG93Q29uc2VudEJhcigpIHtcbiAgICBjb25zZW50QmFyPy5jbGFzc0xpc3QuYWRkKCdzaG93Jyk7XG4gIH1cblxuICBmdW5jdGlvbiBoaWRlQ29uc2VudEJhcigpIHtcbiAgICBjb25zZW50QmFyPy5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XG4gIH1cblxuICBmdW5jdGlvbiBzaG93U2V0dGluZ3NQYW5lbCgpIHtcbiAgICBjb25zZW50QmFyPy5jbGFzc0xpc3QuYWRkKCdzaG93LXNldHRpbmdzJyk7XG4gIH1cblxuICBmdW5jdGlvbiBoaWRlU2V0dGluZ3NQYW5lbCgpIHtcbiAgICBjb25zZW50QmFyPy5jbGFzc0xpc3QucmVtb3ZlKCdzaG93LXNldHRpbmdzJyk7XG4gIH1cblxuICBmdW5jdGlvbiBzZXRDb29raWUobmFtZSwgdmFsdWUsIGV4cGlyZXMpIHtcbiAgICBkb2N1bWVudC5jb29raWUgPSBgJHtuYW1lfT0ke2VuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSl9OyBleHBpcmVzPSR7ZXhwaXJlcy50b1VUQ1N0cmluZygpfTsgcGF0aD0vOyBTYW1lU2l0ZT1MYXhgO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0Q29va2llKG5hbWUpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7ICcpLnJlZHVjZSgoYWNjLCBwYWlyKSA9PiB7XG4gICAgICBjb25zdCBba2V5LCB2YWxdID0gcGFpci5zcGxpdCgnPScpO1xuICAgICAgcmV0dXJuIGtleSA9PT0gbmFtZSA/IGRlY29kZVVSSUNvbXBvbmVudCh2YWwpIDogYWNjO1xuICAgIH0sIG51bGwpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2VuZENvb2tpZXMoKSB7XG4gICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcbiAgICBmb3JtRGF0YS5hcHBlbmQoJ2Nvb2tpZXMnLCBKU09OLnN0cmluZ2lmeShnZXRBbGxDb29raWVzKCkpKTtcbiAgICBmZXRjaCgnL2FjdGlvbnMvX2NyYWZ0LWNvb2tpZXMvY29uc2VudC9zZW5kLWNvb2tpZXMnLCB7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIGJvZHk6IGZvcm1EYXRhXG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRBbGxDb29raWVzKCkge1xuICAgIHJldHVybiBkb2N1bWVudC5jb29raWUuc3BsaXQoJzsgJykucmVkdWNlKChhY2MsIGNvb2tpZSkgPT4ge1xuICAgICAgY29uc3QgW2tleSwgdmFsXSA9IGNvb2tpZS5zcGxpdCgnPScpO1xuICAgICAgYWNjW2RlY29kZVVSSUNvbXBvbmVudChrZXkpXSA9IGRlY29kZVVSSUNvbXBvbmVudCh2YWwpO1xuICAgICAgcmV0dXJuIGFjYztcbiAgICB9LCB7fSk7XG4gIH1cbn0pKCk7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0VBQUE7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQSxTQUFTLG1CQUFtQixDQUFDLENBQUMsRUFBRTtFQUNoQyxFQUFFLElBQUksT0FBTyxNQUFNLENBQUMsSUFBSSxLQUFLLFVBQVUsRUFBRTs7RUFFekMsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxNQUFNO0VBQzFDLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsR0FBRyxXQUFXLElBQUksRUFBRTtFQUNwRCxFQUFFLElBQUksT0FBTyxHQUFHLEVBQUU7O0VBRWxCLEVBQUUsUUFBUSxNQUFNO0VBQ2hCLElBQUksS0FBSyxVQUFVO0VBQ25CLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxXQUFXO0VBQ2xDLFFBQVE7RUFDUixVQUFVLG1CQUFtQjtFQUM3QixVQUFVLFlBQVk7RUFDdEIsVUFBVSxjQUFjO0VBQ3hCLFVBQVUsb0JBQW9CO0VBQzlCLFVBQVUseUJBQXlCO0VBQ25DLFVBQVUsdUJBQXVCO0VBQ2pDLFVBQVUsa0JBQWtCO0VB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{"version":3,"file":"cookie-consent.js","sources":["src/Web/Assets/Front/src/js/gtag.js","src/Web/Assets/Front/src/js/cookie-consent.js"],"sourcesContent":["/**\n * Updates Google Consent Mode (`gtag`) configuration based on user preferences.\n *\n * Applies cookie consent selections dynamically to `gtag('consent', 'update', ...)`.\n * Handles full denial, full acceptance, or custom updates based on individual preferences.\n *\n * @param {CustomEvent} e - Custom event carrying user consent data.\n * @param {Object} e.detail.preferences - User's cookie consent breakdown.\n * @param {boolean} e.detail.preferences.essential - Essential cookies (not used here; always allowed).\n * @param {boolean} e.detail.preferences.analytics - Google Analytics consent.\n * @param {boolean} e.detail.preferences.marketing - Advertising and marketing consent.\n * @param {string} e.detail.status - Consent state: 'ACCEPT_ALL', 'DENY_ALL', or 'UPDATE'.\n *\n * @example\n * document.dispatchEvent(new CustomEvent('cookieConsentUpdated', {\n *   detail: {\n *     status: 'UPDATE',\n *     preferences: {\n *       essential: true,\n *       analytics: false,\n *       marketing: true\n *     }\n *   }\n * }));\n */\nfunction handleConsentUpdate(e) {\n  if (typeof window.gtag !== 'function') return;\n\n  const { preferences, status } = e.detail;\n  const { analytics, marketing } = preferences || {};\n  let options = {};\n\n  switch (status) {\n    case 'DENY_ALL':\n      options = Object.fromEntries(\n        [\n          'analytics_storage',\n          'ad_storage',\n          'ad_user_data',\n          'ad_personalization',\n          'personalization_storage',\n          'functionality_storage',\n          'security_storage',\n        ].map(key => [key, 'denied'])\n      );\n      break;\n\n    case 'ACCEPT_ALL':\n      options = Object.fromEntries(\n        [\n          'analytics_storage',\n          'ad_storage',\n          'ad_user_data',\n          'ad_personalization',\n          'personalization_storage',\n          'functionality_storage',\n          'security_storage',\n        ].map(key => [key, 'granted'])\n      );\n      break;\n\n    case 'UPDATE':\n      options = {\n        analytics_storage: analytics ? 'granted' : 'denied',\n        ad_storage: marketing ? 'granted' : 'denied',\n        ad_user_data: marketing ? 'granted' : 'denied',\n        ad_personalization: marketing ? 'granted' : 'denied',\n        personalization_storage: marketing ? 'granted' : 'denied',\n        // functionality & security_storage omitted (assumed granted)\n      };\n      break;\n\n    default:\n      console.warn('Unknown consent status:', status);\n      return;\n  }\n\n  gtag('consent', 'update', options);\n  gtag('config', 'G-XXXXXXXXXX');\n}\ndocument.addEventListener('cookieConsentUpdated', handleConsentUpdate);\n\n/**\n * Sets the default Google Consent Mode configuration before user action.\n *\n * Denies all non-essential storage categories until explicit consent is received.\n * Grants essential functionality and security storage by default.\n */\nfunction setDefaultGtagConfig() {\n  if (typeof window.gtag !== 'function') return;\n\n  gtag('consent', 'default', {\n    analytics_storage: 'denied',\n    ad_storage: 'denied',\n    ad_user_data: 'denied',\n    ad_personalization: 'denied',\n    personalization_storage: 'denied',\n    functionality_storage: 'granted',\n    security_storage: 'granted',\n    wait_for_update: 500,\n  });\n}\ndocument.addEventListener('cookieConsentOnLoad', setDefaultGtagConfig);\n","import './gtag';\n\n(function () {\n  const consentBar = document.querySelector('.cookie-consent-bar');\n  const cookieOpener = document.querySelector('.cookie-opener-icon');\n\n  document.addEventListener('DOMContentLoaded', initCookieBar);\n\n  function initCookieBar() {\n    sendCookies();\n\n    if (!hasConsent()) {\n      showConsentBar();\n      animateCookie();\n      document.dispatchEvent(new CustomEvent('cookieConsentOnLoad'));\n    } else {\n      showCookieOpener();\n    }\n\n    if (!window.__cookieConsentInitialized) {\n      window.__cookieConsentInitialized = true;\n      initializeEventListeners();\n    }\n  }\n\n  function hasConsent() {\n    return getCookie('cookieConsent_consent') === 'true';\n  }\n\n  function animateCookie() {\n    const cookieImage = document.querySelector('.cookie-consent-bar .cookie-image');\n    if (!cookieImage) return;\n    cookieImage.classList.add('animate');\n    setTimeout(() => cookieImage.classList.remove('animate'), 2000);\n  }\n\n  function showCookieOpener() {\n    if (cookieOpener) cookieOpener.style.display = 'flex';\n  }\n\n  function initializeEventListeners() {\n    bindConsentAction('[data-action=\"accept-all\"]', {\n      essential: true,\n      analytics: true,\n      marketing: true\n    }, 'ACCEPT_ALL');\n\n    bindConsentAction('[data-action=\"deny-all\"]', {\n      essential: true,\n      analytics: false,\n      marketing: false\n    }, 'DENY_ALL');\n\n    bindClick('[data-action=\"open-settings\"]', showSettingsPanel);\n    bindClick('[data-action=\"close-settings\"]', hideSettingsPanel);\n\n    document.querySelectorAll('[data-action=\"save-preferences\"]').forEach(button => {\n      button.addEventListener('click', () => {\n        const preferences = {\n          essential: true,\n          analytics: document.querySelector('input[data-category=\"analytics\"]').checked,\n          marketing: document.querySelector('input[data-category=\"marketing\"]').checked\n        };\n        saveConsent(preferences, 'UPDATE');\n        hideSettingsPanel();\n        hideConsentBar();\n      });\n    });\n\n    document.querySelectorAll('.category-dropdown-opener').forEach(button => {\n      button.addEventListener('click', e => {\n        const holder = e.target.closest('.cookie-category');\n        const list = holder.querySelector('.category-services-list');\n        const expanded = holder.classList.toggle('expanded');\n        list.style.maxHeight = expanded ? `${list.scrollHeight}px` : '0px';\n        return false;\n      });\n    });\n\n    const toggleButton = document.querySelector('.cookie-opener-icon button');\n    if (toggleButton) {\n      toggleButton.addEventListener('click', () => {\n        consentBar.classList.toggle('show');\n        return false;\n      });\n    }\n  }\n\n  function bindConsentAction(selector, preferences, status) {\n    document.querySelectorAll(selector).forEach(button => {\n      button.addEventListener('click', () => {\n        saveConsent(preferences, status);\n        hideConsentBar();\n        showCookieOpener();\n      });\n    });\n  }\n\n  function bindClick(selector, callback) {\n    document.querySelectorAll(selector).forEach(button => {\n      button.addEventListener('click', callback);\n    });\n  }\n\n  function saveConsent(preferences, status) {\n    const expiration = new Date();\n    expiration.setFullYear(expiration.getFullYear() + 1);\n\n    setCookie('cookieConsent_consent', 'true', expiration);\n    setCookie('cookieConsent_essential', 'true', expiration);\n    setCookie('cookieConsent_analytics', preferences.analytics ? 'true' : 'false', expiration);\n    setCookie('cookieConsent_marketing', preferences.marketing ? 'true' : 'false', expiration);\n\n    const formData = new FormData();\n    formData.append('analytics', preferences.analytics ? '1' : '0');\n    formData.append('marketing', preferences.marketing ? '1' : '0');\n\n    fetch('/actions/_craft-cookies/consent/save-preferences', {\n      method: 'POST',\n      body: formData,\n      headers: {\n        'X-CSRF-Token': getCsrfToken(),\n        'X-Requested-With': 'XMLHttpRequest'\n      }\n    }).catch(error => console.error('Error saving cookie preferences:', error));\n\n    document.dispatchEvent(new CustomEvent('cookieConsentUpdated', {\n      detail: { preferences, status }\n    }));\n  }\n\n  function getCsrfToken() {\n    const meta = document.querySelector('meta[name=\"csrf-token\"]');\n    return meta ? meta.getAttribute('content') : '';\n  }\n\n  function showConsentBar() {\n    consentBar?.classList.add('show');\n  }\n\n  function hideConsentBar() {\n    consentBar?.classList.remove('show');\n  }\n\n  function showSettingsPanel() {\n    consentBar?.classList.add('show-settings');\n  }\n\n  function hideSettingsPanel() {\n    consentBar?.classList.remove('show-settings');\n  }\n\n  function setCookie(name, value, expires) {\n    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;\n  }\n\n  function getCookie(name) {\n    return document.cookie.split('; ').reduce((acc, pair) => {\n      const [key, val] = pair.split('=');\n      return key === name ? decodeURIComponent(val) : acc;\n    }, null);\n  }\n\n  function sendCookies() {\n    const formData = new FormData();\n    formData.append('cookies', JSON.stringify(getAllCookies()));\n    fetch('/actions/_craft-cookies/consent/send-cookies', {\n      method: 'POST',\n      body: formData\n    });\n  }\n\n  function getAllCookies() {\n    return document.cookie.split('; ').reduce((acc, cookie) => {\n      const [key, val] = cookie.split('=');\n      acc[decodeURIComponent(key)] = decodeURIComponent(val);\n      return acc;\n    }, {});\n  }\n})();\n"],"names":[],"mappings":"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"}