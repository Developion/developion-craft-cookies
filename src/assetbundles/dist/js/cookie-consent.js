/**
 * Cookie Consent JavaScript
 */
(function () {
	//   "use strict";

	// DOM elements
	let consentBar;
	let settingsPanel;

	// Initialize on document load
	document.addEventListener("DOMContentLoaded", function () {
		// Create the cookie consent bar and settings panel
		createCookieConsentBar();
		createSettingsPanel();
		sendCookies();

		// Check if consent has been given
		if (!hasConsent()) {
			showConsentBar();
		}

		// Initialize event listeners
		initializeEventListeners();
	});

	/**
	 * Check if user has given consent
	 */
	function hasConsent() {
		return getCookie("cookieConsent_consent") === "true";
	}

	/**
	 * Create the cookie consent bar
	 */
	function createCookieConsentBar() {
		// Get settings from the window object (populated by the Twig template)
		const settings = window.cookieConsentSettings || {
			cookieBarPosition: "bottom",
			cookieBarTitle: "We use cookies",
			cookieBarMessage:
				"This website uses cookies to ensure you get the best experience on our website.",
			acceptAllButtonText: "Accept All",
			cookieSettingsButtonText: "Cookie Settings",
		};

		consentBar = document.createElement("div");
		consentBar.className = `cookie-consent-bar ${settings.cookieBarPosition}`;

		const consentContent = document.createElement("div");
		consentContent.className = "cookie-consent-content";

		const consentText = document.createElement("div");
		consentText.className = "cookie-consent-text";

		const title = document.createElement("h3");
		title.textContent = settings.cookieBarTitle;
		consentText.appendChild(title);

		const message = document.createElement("p");
		message.textContent = settings.cookieBarMessage;
		consentText.appendChild(message);

		const buttons = document.createElement("div");
		buttons.className = "cookie-consent-buttons";

		const acceptAllButton = document.createElement("button");
		acceptAllButton.className = "cookie-consent-button primary";
		acceptAllButton.textContent = settings.acceptAllButtonText;
		acceptAllButton.setAttribute("data-action", "accept-all");
		buttons.appendChild(acceptAllButton);

		const settingsButton = document.createElement("button");
		settingsButton.className = "cookie-consent-button secondary";
		settingsButton.textContent = settings.cookieSettingsButtonText;
		settingsButton.setAttribute("data-action", "open-settings");
		buttons.appendChild(settingsButton);

		consentText.appendChild(buttons);
		consentContent.appendChild(consentText);
		consentBar.appendChild(consentContent);

		document.body.appendChild(consentBar);
	}

	/**
	 * Create the cookie settings panel
	 */
	function createSettingsPanel() {
		// Get settings from the window object (populated by the Twig template)
		const settings = window.cookieConsentSettings || {
			cookieBarTitle: "Cookie Settings",
			essentialCookiesDescription:
				"Essential cookies are necessary for the website to function properly. They cannot be disabled.",
			analyticsCookiesDescription:
				"Analytics cookies help us understand how visitors interact with our website.",
			marketingCookiesDescription:
				"Marketing cookies are used to track visitors across websites to display relevant advertisements.",
			savePreferencesButtonText: "Save Preferences",
			enableEssentialCookies: true,
			enableAnalyticsCookies: true,
			enableMarketingCookies: true,
		};

		settingsPanel = document.createElement("div");
		settingsPanel.className = "cookie-settings-panel";

		const settingsContent = document.createElement("div");
		settingsContent.className = "cookie-settings-content";

		// Header
		const settingsHeader = document.createElement("div");
		settingsHeader.className = "cookie-settings-header";

		const title = document.createElement("h3");
		title.textContent = settings.cookieBarTitle;
		settingsHeader.appendChild(title);

		const closeButton = document.createElement("button");
		closeButton.className = "cookie-settings-close";
		closeButton.innerHTML = "&times;";
		closeButton.setAttribute("data-action", "close-settings");
		settingsHeader.appendChild(closeButton);

		settingsContent.appendChild(settingsHeader);

		// Cookie categories
		// Essential cookies - always enabled
		settingsContent.appendChild(
			createCategoryElement(
				"essential",
				"Essential Cookies",
				settings.essentialCookiesDescription,
				true,
				true
			)
		);

		// Analytics cookies
		settingsContent.appendChild(
			createCategoryElement(
				"analytics",
				"Analytics Cookies",
				settings.analyticsCookiesDescription,
				settings.enableAnalyticsCookies,
				false
			)
		);

		// Marketing cookies
		settingsContent.appendChild(
			createCategoryElement(
				"marketing",
				"Marketing Cookies",
				settings.marketingCookiesDescription,
				settings.enableMarketingCookies,
				false
			)
		);

		// Footer
		const settingsFooter = document.createElement("div");
		settingsFooter.className = "cookie-settings-footer";

		const saveButton = document.createElement("button");
		saveButton.className = "cookie-consent-button primary";
		saveButton.textContent = settings.savePreferencesButtonText;
		saveButton.setAttribute("data-action", "save-preferences");
		settingsFooter.appendChild(saveButton);

		settingsContent.appendChild(settingsFooter);
		settingsPanel.appendChild(settingsContent);

		document.body.appendChild(settingsPanel);
	}

	/**
	 * Create a category element for the cookie settings panel
	 */
	function createCategoryElement(id, title, description, checked, disabled) {
		const category = document.createElement("div");
		category.className = "cookie-category";

		const header = document.createElement("div");
		header.className = "cookie-category-header";

		const titleEl = document.createElement("div");
		titleEl.className = "cookie-category-title";
		titleEl.textContent = title;
		header.appendChild(titleEl);

		const toggle = document.createElement("label");
		toggle.className = `cookie-category-toggle ${disabled ? "disabled" : ""}`;

		const input = document.createElement("input");
		input.type = "checkbox";
		input.checked = checked;
		input.disabled = disabled;
		input.setAttribute("data-category", id);
		toggle.appendChild(input);

		const slider = document.createElement("span");
		slider.className = "cookie-category-slider";
		toggle.appendChild(slider);

		header.appendChild(toggle);
		category.appendChild(header);

		const desc = document.createElement("div");
		desc.className = "cookie-category-description";
		desc.textContent = description;
		category.appendChild(desc);

		return category;
	}

	/**
	 * Initialize event listeners
	 */
	function initializeEventListeners() {
		// Accept all cookies
		document
			.querySelectorAll('[data-action="accept-all"]')
			.forEach(function (button) {
				button.addEventListener("click", function () {
					saveConsent({
						essential: true,
						analytics: true,
						marketing: true,
					});
					hideConsentBar();
				});
			});

		// Open settings panel
		document
			.querySelectorAll('[data-action="open-settings"]')
			.forEach(function (button) {
				button.addEventListener("click", function () {
					showSettingsPanel();
				});
			});

		// Close settings panel
		document
			.querySelectorAll('[data-action="close-settings"]')
			.forEach(function (button) {
				button.addEventListener("click", function () {
					hideSettingsPanel();
				});
			});

		// Save preferences
		document
			.querySelectorAll('[data-action="save-preferences"]')
			.forEach(function (button) {
				button.addEventListener("click", function () {
					const preferences = {
						essential: true,
						analytics: document.querySelector(
							'input[data-category="analytics"]'
						).checked,
						marketing: document.querySelector(
							'input[data-category="marketing"]'
						).checked,
					};

					saveConsent(preferences);
					hideSettingsPanel();
					hideConsentBar();
				});
			});

		// Close when clicking outside the settings panel
		settingsPanel.addEventListener("click", function (event) {
			if (event.target === settingsPanel) {
				hideSettingsPanel();
			}
		});
	}

	/**
	 * Save cookie consent preferences
	 */
	function saveConsent(preferences) {
		// Set cookies directly
		const expiration = new Date();
		expiration.setDate(expiration.getDate() + 365); // 1 year

		setCookie("cookieConsent_consent", "true", expiration);
		setCookie("cookieConsent_essential", "true", expiration);
		setCookie(
			"cookieConsent_analytics",
			preferences.analytics ? "true" : "false",
			expiration
		);
		setCookie(
			"cookieConsent_marketing",
			preferences.marketing ? "true" : "false",
			expiration
		);

		// Send preferences to server
		const formData = new FormData();
		formData.append("analytics", preferences.analytics ? "1" : "0");
		formData.append("marketing", preferences.marketing ? "1" : "0");

		fetch("/actions/_craft-cookies/consent/save-preferences", {
			method: "POST",
			body: formData,
			headers: {
				"X-CSRF-Token": getCsrfToken(),
				"X-Requested-With": "XMLHttpRequest",
			},
		}).catch(function (error) {
			console.error("Error saving cookie preferences:", error);
		});

		// Trigger event
		const event = new CustomEvent("cookieConsentUpdated", {
			detail: preferences,
		});
		document.dispatchEvent(event);
	}

	/**
	 * Get CSRF token from meta tag
	 */
	function getCsrfToken() {
		const metaTag = document.querySelector('meta[name="csrf-token"]');
		return metaTag ? metaTag.getAttribute("content") : "";
	}

	/**
	 * Show cookie consent bar
	 */
	function showConsentBar() {
		if (consentBar) {
			consentBar.style.display = "block";
		}
	}

	/**
	 * Hide cookie consent bar
	 */
	function hideConsentBar() {
		if (consentBar) {
			consentBar.style.display = "none";
		}
	}

	/**
	 * Show settings panel
	 */
	function showSettingsPanel() {
		if (settingsPanel) {
			settingsPanel.style.display = "block";
		}
	}

	/**
	 * Hide settings panel
	 */
	function hideSettingsPanel() {
		if (settingsPanel) {
			settingsPanel.style.display = "none";
		}
	}

	/**
	 * Set a cookie
	 */
	function setCookie(name, value, expires) {
		document.cookie =
			name +
			"=" +
			encodeURIComponent(value) +
			"; expires=" +
			expires.toUTCString() +
			"; path=/; SameSite=Lax";
	}

	/**
	 * Get a cookie value
	 */
	function getCookie(name) {
		const cookies = document.cookie.split(";");
		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i].trim();
			if (cookie.indexOf(name + "=") === 0) {
				return decodeURIComponent(cookie.substring(name.length + 1));
			}
		}
		return null;
	}

	function sendCookies() {
		const formData = new FormData();
		formData.append("cookies", JSON.stringify(getAllCookies()));
		fetch("/actions/_craft-cookies/consent/send-cookies", {
			method: "POST",
			body: formData
		})
	}

	function getAllCookies() {
		return document.cookie
			.split('; ')
			.map(cookie => cookie.split('='))
			.reduce((acc, [key, value]) => {
				acc[decodeURIComponent(key)] = decodeURIComponent(value);
				return acc;
			}, {});

	}
})();
