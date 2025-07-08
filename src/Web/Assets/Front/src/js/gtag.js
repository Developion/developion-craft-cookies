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
