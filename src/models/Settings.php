<?php

namespace developion\craftcookies\models;

use Craft;
use craft\base\Model;

/**
 * Developion Cookies settings
 */
class Settings extends Model
{
	public bool $enableCookieConsent = true;
	public string $cookieBarPosition = 'bottom'; // 'bottom', 'top', 'bottom-left', 'bottom-right'
	public int $cookieExpiration = 365; // days

	public bool $enableEssentialCookies = true;
	public bool $enableAnalyticsCookies = true;
	public bool $enableMarketingCookies = true;

	public string $cookieBarTitle = 'We use cookies';
	public string $cookieBarMessage = 'This website uses cookies to ensure you get the best experience on our website.';
	public string $essentialCookiesDescription = 'Essential cookies are necessary for the website to function properly. They cannot be disabled.';
	public string $analyticsCookiesDescription = 'Analytics cookies help us understand how visitors interact with our website.';
	public string $marketingCookiesDescription = 'Marketing cookies are used to track visitors across websites to display relevant advertisements.';
	public string $acceptAllButtonText = 'Accept All';
	public string $savePreferencesButtonText = 'Save Preferences';
	public string $cookieSettingsButtonText = 'Cookie Settings';

	public string $cookieNamePrefix = 'cookieConsent_';

	public string $cookieManagerUrl = 'https://cookie-manager.ddev.site/';
}
