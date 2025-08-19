import './gtag';

(function () {
	const consentBar = document.querySelector('.cookie-consent-bar');
	const cookieOpener = document.querySelector('.cookie-opener-icon');
	let categories = [...document.querySelectorAll('[data-cookie-category]')].map(item => item.getAttribute('data-cookie-category'))
	categories.unshift('essential')

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
		return document.cookie.split('; ').some(cookie => cookie.startsWith(`${window.craftCookies.cookieNamePrefix}consent`));
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

	function mapCategoryValues(categories, status = null) {
		return categories.reduce((acc, item) => {
			let value
			if (item !== 'essential') {
				switch (status) {
					case 'ACCEPT_ALL':
						value = true
						break
					case 'DENY_ALL':
						value = false
						break
					default:
						value = document.querySelector(`input[data-cookie-category="${item}"]`).checked
						break
				}
			}
			acc[item] = value
			acc['essential'] = true
			return acc
	}, { })

}

	function initializeEventListeners() {
	bindConsentAction('[data-action="accept-all"]', mapCategoryValues(categories, 'ACCEPT_ALL'), 'ACCEPT_ALL');

	bindConsentAction('[data-action="deny-all"]', mapCategoryValues(categories, 'DENY_ALL'), 'DENY_ALL');

	bindClick('[data-action="open-settings"]', showSettingsPanel);
	bindClick('[data-action="close-settings"]', hideSettingsPanel);

	document.querySelectorAll('[data-action="save-preferences"]').forEach(button => {
		button.addEventListener('click', () => {
			saveConsent(mapCategoryValues(categories), 'UPDATE');
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
	const formData = new FormData();
	Object.entries(preferences).forEach(([key, value]) => {
		formData.append(key, value ? 'true' : 'false')
	})
	formData.append(window.craftCookies.csrfParam, window.craftCookies.csrfToken)
	formData.append('action', '_craft-cookies/consent/save-preferences')

	fetch(location.origin, {
		method: 'POST',
		body: formData,
	})
		.then(response => response.json())
		.then(data => {
			const expiration = new Date()
			expiration.setFullYear(expiration.getFullYear() + 1);
			document.cookie = `${window.craftCookies.cookieNamePrefix}consent=${encodeURIComponent(true)}; expires=${expiration.toUTCString()}; path=/; SameSite=Lax`;
		})
		.catch(error => console.error('Error saving cookie preferences:', error));

	document.dispatchEvent(new CustomEvent('cookieConsentUpdated', {
		detail: { preferences, status }
	}));
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

function sendCookies() {
	const formData = new FormData();
	formData.append('cookies', JSON.stringify(getAllCookies()));
	formData.append(window.craftCookies.csrfParam, window.craftCookies.csrfToken)
	formData.append('action', '_craft-cookies/consent/send-cookies')
	fetch(location.origin, {
		method: 'POST',
		body: formData
	})
		.then(response => response.json()) //delete after debugging
}

function getAllCookies() {
	return document.cookie.split('; ').reduce((acc, cookie) => {
		const [key, val] = cookie.split('=');
		acc[decodeURIComponent(key)] = decodeURIComponent(val);
		return acc;
	}, {});
}
}) ();
