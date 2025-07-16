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

})();
//# sourceMappingURL=gtag.js.map

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3RhZy5qcyIsInNvdXJjZXMiOlsic3JjL1dlYi9Bc3NldHMvRnJvbnQvc3JjL2pzL2d0YWcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBVcGRhdGVzIEdvb2dsZSBDb25zZW50IE1vZGUgKGBndGFnYCkgY29uZmlndXJhdGlvbiBiYXNlZCBvbiB1c2VyIHByZWZlcmVuY2VzLlxuICpcbiAqIEFwcGxpZXMgY29va2llIGNvbnNlbnQgc2VsZWN0aW9ucyBkeW5hbWljYWxseSB0byBgZ3RhZygnY29uc2VudCcsICd1cGRhdGUnLCAuLi4pYC5cbiAqIEhhbmRsZXMgZnVsbCBkZW5pYWwsIGZ1bGwgYWNjZXB0YW5jZSwgb3IgY3VzdG9tIHVwZGF0ZXMgYmFzZWQgb24gaW5kaXZpZHVhbCBwcmVmZXJlbmNlcy5cbiAqXG4gKiBAcGFyYW0ge0N1c3RvbUV2ZW50fSBlIC0gQ3VzdG9tIGV2ZW50IGNhcnJ5aW5nIHVzZXIgY29uc2VudCBkYXRhLlxuICogQHBhcmFtIHtPYmplY3R9IGUuZGV0YWlsLnByZWZlcmVuY2VzIC0gVXNlcidzIGNvb2tpZSBjb25zZW50IGJyZWFrZG93bi5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZS5kZXRhaWwucHJlZmVyZW5jZXMuZXNzZW50aWFsIC0gRXNzZW50aWFsIGNvb2tpZXMgKG5vdCB1c2VkIGhlcmU7IGFsd2F5cyBhbGxvd2VkKS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZS5kZXRhaWwucHJlZmVyZW5jZXMuYW5hbHl0aWNzIC0gR29vZ2xlIEFuYWx5dGljcyBjb25zZW50LlxuICogQHBhcmFtIHtib29sZWFufSBlLmRldGFpbC5wcmVmZXJlbmNlcy5tYXJrZXRpbmcgLSBBZHZlcnRpc2luZyBhbmQgbWFya2V0aW5nIGNvbnNlbnQuXG4gKiBAcGFyYW0ge3N0cmluZ30gZS5kZXRhaWwuc3RhdHVzIC0gQ29uc2VudCBzdGF0ZTogJ0FDQ0VQVF9BTEwnLCAnREVOWV9BTEwnLCBvciAnVVBEQVRFJy5cbiAqXG4gKiBAZXhhbXBsZVxuICogZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2Nvb2tpZUNvbnNlbnRVcGRhdGVkJywge1xuICogICBkZXRhaWw6IHtcbiAqICAgICBzdGF0dXM6ICdVUERBVEUnLFxuICogICAgIHByZWZlcmVuY2VzOiB7XG4gKiAgICAgICBlc3NlbnRpYWw6IHRydWUsXG4gKiAgICAgICBhbmFseXRpY3M6IGZhbHNlLFxuICogICAgICAgbWFya2V0aW5nOiB0cnVlXG4gKiAgICAgfVxuICogICB9XG4gKiB9KSk7XG4gKi9cbmZ1bmN0aW9uIGhhbmRsZUNvbnNlbnRVcGRhdGUoZSkge1xuICBpZiAodHlwZW9mIHdpbmRvdy5ndGFnICE9PSAnZnVuY3Rpb24nKSByZXR1cm47XG5cbiAgY29uc3QgeyBwcmVmZXJlbmNlcywgc3RhdHVzIH0gPSBlLmRldGFpbDtcbiAgY29uc3QgeyBhbmFseXRpY3MsIG1hcmtldGluZyB9ID0gcHJlZmVyZW5jZXMgfHwge307XG4gIGxldCBvcHRpb25zID0ge307XG5cbiAgc3dpdGNoIChzdGF0dXMpIHtcbiAgICBjYXNlICdERU5ZX0FMTCc6XG4gICAgICBvcHRpb25zID0gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgICBbXG4gICAgICAgICAgJ2FuYWx5dGljc19zdG9yYWdlJyxcbiAgICAgICAgICAnYWRfc3RvcmFnZScsXG4gICAgICAgICAgJ2FkX3VzZXJfZGF0YScsXG4gICAgICAgICAgJ2FkX3BlcnNvbmFsaXphdGlvbicsXG4gICAgICAgICAgJ3BlcnNvbmFsaXphdGlvbl9zdG9yYWdlJyxcbiAgICAgICAgICAnZnVuY3Rpb25hbGl0eV9zdG9yYWdlJyxcbiAgICAgICAgICAnc2VjdXJpdHlfc3RvcmFnZScsXG4gICAgICAgIF0ubWFwKGtleSA9PiBba2V5LCAnZGVuaWVkJ10pXG4gICAgICApO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdBQ0NFUFRfQUxMJzpcbiAgICAgIG9wdGlvbnMgPSBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgICAgIFtcbiAgICAgICAgICAnYW5hbHl0aWNzX3N0b3JhZ2UnLFxuICAgICAgICAgICdhZF9zdG9yYWdlJyxcbiAgICAgICAgICAnYWRfdXNlcl9kYXRhJyxcbiAgICAgICAgICAnYWRfcGVyc29uYWxpemF0aW9uJyxcbiAgICAgICAgICAncGVyc29uYWxpemF0aW9uX3N0b3JhZ2UnLFxuICAgICAgICAgICdmdW5jdGlvbmFsaXR5X3N0b3JhZ2UnLFxuICAgICAgICAgICdzZWN1cml0eV9zdG9yYWdlJyxcbiAgICAgICAgXS5tYXAoa2V5ID0+IFtrZXksICdncmFudGVkJ10pXG4gICAgICApO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdVUERBVEUnOlxuICAgICAgb3B0aW9ucyA9IHtcbiAgICAgICAgYW5hbHl0aWNzX3N0b3JhZ2U6IGFuYWx5dGljcyA/ICdncmFudGVkJyA6ICdkZW5pZWQnLFxuICAgICAgICBhZF9zdG9yYWdlOiBtYXJrZXRpbmcgPyAnZ3JhbnRlZCcgOiAnZGVuaWVkJyxcbiAgICAgICAgYWRfdXNlcl9kYXRhOiBtYXJrZXRpbmcgPyAnZ3JhbnRlZCcgOiAnZGVuaWVkJyxcbiAgICAgICAgYWRfcGVyc29uYWxpemF0aW9uOiBtYXJrZXRpbmcgPyAnZ3JhbnRlZCcgOiAnZGVuaWVkJyxcbiAgICAgICAgcGVyc29uYWxpemF0aW9uX3N0b3JhZ2U6IG1hcmtldGluZyA/ICdncmFudGVkJyA6ICdkZW5pZWQnLFxuICAgICAgICAvLyBmdW5jdGlvbmFsaXR5ICYgc2VjdXJpdHlfc3RvcmFnZSBvbWl0dGVkIChhc3N1bWVkIGdyYW50ZWQpXG4gICAgICB9O1xuICAgICAgYnJlYWs7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgY29uc29sZS53YXJuKCdVbmtub3duIGNvbnNlbnQgc3RhdHVzOicsIHN0YXR1cyk7XG4gICAgICByZXR1cm47XG4gIH1cblxuICBndGFnKCdjb25zZW50JywgJ3VwZGF0ZScsIG9wdGlvbnMpO1xuICBndGFnKCdjb25maWcnLCAnRy1YWFhYWFhYWFhYJyk7XG59XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjb29raWVDb25zZW50VXBkYXRlZCcsIGhhbmRsZUNvbnNlbnRVcGRhdGUpO1xuXG4vKipcbiAqIFNldHMgdGhlIGRlZmF1bHQgR29vZ2xlIENvbnNlbnQgTW9kZSBjb25maWd1cmF0aW9uIGJlZm9yZSB1c2VyIGFjdGlvbi5cbiAqXG4gKiBEZW5pZXMgYWxsIG5vbi1lc3NlbnRpYWwgc3RvcmFnZSBjYXRlZ29yaWVzIHVudGlsIGV4cGxpY2l0IGNvbnNlbnQgaXMgcmVjZWl2ZWQuXG4gKiBHcmFudHMgZXNzZW50aWFsIGZ1bmN0aW9uYWxpdHkgYW5kIHNlY3VyaXR5IHN0b3JhZ2UgYnkgZGVmYXVsdC5cbiAqL1xuZnVuY3Rpb24gc2V0RGVmYXVsdEd0YWdDb25maWcoKSB7XG4gIGlmICh0eXBlb2Ygd2luZG93Lmd0YWcgIT09ICdmdW5jdGlvbicpIHJldHVybjtcblxuICBndGFnKCdjb25zZW50JywgJ2RlZmF1bHQnLCB7XG4gICAgYW5hbHl0aWNzX3N0b3JhZ2U6ICdkZW5pZWQnLFxuICAgIGFkX3N0b3JhZ2U6ICdkZW5pZWQnLFxuICAgIGFkX3VzZXJfZGF0YTogJ2RlbmllZCcsXG4gICAgYWRfcGVyc29uYWxpemF0aW9uOiAnZGVuaWVkJyxcbiAgICBwZXJzb25hbGl6YXRpb25fc3RvcmFnZTogJ2RlbmllZCcsXG4gICAgZnVuY3Rpb25hbGl0eV9zdG9yYWdlOiAnZ3JhbnRlZCcsXG4gICAgc2VjdXJpdHlfc3RvcmFnZTogJ2dyYW50ZWQnLFxuICAgIHdhaXRfZm9yX3VwZGF0ZTogNTAwLFxuICB9KTtcbn1cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2Nvb2tpZUNvbnNlbnRPbkxvYWQnLCBzZXREZWZhdWx0R3RhZ0NvbmZpZyk7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0VBQUE7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7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{"version":3,"file":"gtag.js","sources":["src/Web/Assets/Front/src/js/gtag.js"],"sourcesContent":["/**\n * Updates Google Consent Mode (`gtag`) configuration based on user preferences.\n *\n * Applies cookie consent selections dynamically to `gtag('consent', 'update', ...)`.\n * Handles full denial, full acceptance, or custom updates based on individual preferences.\n *\n * @param {CustomEvent} e - Custom event carrying user consent data.\n * @param {Object} e.detail.preferences - User's cookie consent breakdown.\n * @param {boolean} e.detail.preferences.essential - Essential cookies (not used here; always allowed).\n * @param {boolean} e.detail.preferences.analytics - Google Analytics consent.\n * @param {boolean} e.detail.preferences.marketing - Advertising and marketing consent.\n * @param {string} e.detail.status - Consent state: 'ACCEPT_ALL', 'DENY_ALL', or 'UPDATE'.\n *\n * @example\n * document.dispatchEvent(new CustomEvent('cookieConsentUpdated', {\n *   detail: {\n *     status: 'UPDATE',\n *     preferences: {\n *       essential: true,\n *       analytics: false,\n *       marketing: true\n *     }\n *   }\n * }));\n */\nfunction handleConsentUpdate(e) {\n  if (typeof window.gtag !== 'function') return;\n\n  const { preferences, status } = e.detail;\n  const { analytics, marketing } = preferences || {};\n  let options = {};\n\n  switch (status) {\n    case 'DENY_ALL':\n      options = Object.fromEntries(\n        [\n          'analytics_storage',\n          'ad_storage',\n          'ad_user_data',\n          'ad_personalization',\n          'personalization_storage',\n          'functionality_storage',\n          'security_storage',\n        ].map(key => [key, 'denied'])\n      );\n      break;\n\n    case 'ACCEPT_ALL':\n      options = Object.fromEntries(\n        [\n          'analytics_storage',\n          'ad_storage',\n          'ad_user_data',\n          'ad_personalization',\n          'personalization_storage',\n          'functionality_storage',\n          'security_storage',\n        ].map(key => [key, 'granted'])\n      );\n      break;\n\n    case 'UPDATE':\n      options = {\n        analytics_storage: analytics ? 'granted' : 'denied',\n        ad_storage: marketing ? 'granted' : 'denied',\n        ad_user_data: marketing ? 'granted' : 'denied',\n        ad_personalization: marketing ? 'granted' : 'denied',\n        personalization_storage: marketing ? 'granted' : 'denied',\n        // functionality & security_storage omitted (assumed granted)\n      };\n      break;\n\n    default:\n      console.warn('Unknown consent status:', status);\n      return;\n  }\n\n  gtag('consent', 'update', options);\n  gtag('config', 'G-XXXXXXXXXX');\n}\ndocument.addEventListener('cookieConsentUpdated', handleConsentUpdate);\n\n/**\n * Sets the default Google Consent Mode configuration before user action.\n *\n * Denies all non-essential storage categories until explicit consent is received.\n * Grants essential functionality and security storage by default.\n */\nfunction setDefaultGtagConfig() {\n  if (typeof window.gtag !== 'function') return;\n\n  gtag('consent', 'default', {\n    analytics_storage: 'denied',\n    ad_storage: 'denied',\n    ad_user_data: 'denied',\n    ad_personalization: 'denied',\n    personalization_storage: 'denied',\n    functionality_storage: 'granted',\n    security_storage: 'granted',\n    wait_for_update: 500,\n  });\n}\ndocument.addEventListener('cookieConsentOnLoad', setDefaultGtagConfig);\n"],"names":[],"mappings":";;;EAAA;EACA;EACA;EACA;EACA;EACA;EACA;EACA;EACA;EACA;EACA;EACA;EACA;EACA;EACA;EACA;EACA;EACA;EACA;EACA;EACA;EACA;EACA;EACA;EACA;EACA,SAAS,mBAAmB,CAAC,CAAC,EAAE;EAChC,EAAE,IAAI,OAAO,MAAM,CAAC,IAAI,KAAK,UAAU,EAAE;;EAEzC,EAAE,MAAM,EAAE,WAAW,EAAE,MAAM,EAAE,GAAG,CAAC,CAAC,MAAM;EAC1C,EAAE,MAAM,EAAE,SAAS,EAAE,SAAS,EAAE,GAAG,WAAW,IAAI,EAAE;EACpD,EAAE,IAAI,OAAO,GAAG,EAAE;;EAElB,EAAE,QAAQ,MAAM;EAChB,IAAI,KAAK,UAAU;EACnB,MAAM,OAAO,GAAG,MAAM,CAAC,WAAW;EAClC,QAAQ;EACR,UAAU,mBAAmB;EAC7B,UAAU,YAAY;EACtB,UAAU,cAAc;EACxB,UAAU,oBAAoB;EAC9B,UAAU,yBAAyB;EACnC,UAAU,uBAAuB;EACjC,UAAU,kBAAkB;EAC5B,SAAS,CAAC,GAAG,CAAC,GAAG,IAAI,CAAC,GAAG,EAAE,QAAQ,CAAC;EACpC,OAAO;EACP,MAAM;;EAEN,IAAI,KAAK,YAAY;EACrB,MAAM,OAAO,GAAG,MAAM,CAAC,WAAW;EAClC,QAAQ;EACR,UAAU,mBAAmB;EAC7B,UAAU,YAAY;EACtB,UAAU,cAAc;EACxB,UAAU,oBAAoB;EAC9B,UAAU,yBAAyB;EACnC,UAAU,uBAAuB;EACjC,UAAU,kBAAkB;EAC5B,SAAS,CAAC,GAAG,CAAC,GAAG,IAAI,CAAC,GAAG,EAAE,SAAS,CAAC;EACrC,OAAO;EACP,MAAM;;EAEN,IAAI,KAAK,QAAQ;EACjB,MAAM,OAAO,GAAG;EAChB,QAAQ,iBAAiB,EAAE,SAAS,GAAG,SAAS,GAAG,QAAQ;EAC3D,QAAQ,UAAU,EAAE,SAAS,GAAG,SAAS,GAAG,QAAQ;EACpD,QAAQ,YAAY,EAAE,SAAS,GAAG,SAAS,GAAG,QAAQ;EACtD,QAAQ,kBAAkB,EAAE,SAAS,GAAG,SAAS,GAAG,QAAQ;EAC5D,QAAQ,uBAAuB,EAAE,SAAS,GAAG,SAAS,GAAG,QAAQ;EACjE;EACA,OAAO;EACP,MAAM;;EAEN,IAAI;EACJ,MAAM,OAAO,CAAC,IAAI,CAAC,yBAAyB,EAAE,MAAM,CAAC;EACrD,MAAM;EACN;;EAEA,EAAE,IAAI,CAAC,SAAS,EAAE,QAAQ,EAAE,OAAO,CAAC;EACpC,EAAE,IAAI,CAAC,QAAQ,EAAE,cAAc,CAAC;EAChC;EACA,QAAQ,CAAC,gBAAgB,CAAC,sBAAsB,EAAE,mBAAmB,CAAC;;EAEtE;EACA;EACA;EACA;EACA;EACA;EACA,SAAS,oBAAoB,GAAG;EAChC,EAAE,IAAI,OAAO,MAAM,CAAC,IAAI,KAAK,UAAU,EAAE;;EAEzC,EAAE,IAAI,CAAC,SAAS,EAAE,SAAS,EAAE;EAC7B,IAAI,iBAAiB,EAAE,QAAQ;EAC/B,IAAI,UAAU,EAAE,QAAQ;EACxB,IAAI,YAAY,EAAE,QAAQ;EAC1B,IAAI,kBAAkB,EAAE,QAAQ;EAChC,IAAI,uBAAuB,EAAE,QAAQ;EACrC,IAAI,qBAAqB,EAAE,SAAS;EACpC,IAAI,gBAAgB,EAAE,SAAS;EAC/B,IAAI,eAAe,EAAE,GAAG;EACxB,GAAG,CAAC;EACJ;EACA,QAAQ,CAAC,gBAAgB,CAAC,qBAAqB,EAAE,oBAAoB,CAAC;;;;;;"}