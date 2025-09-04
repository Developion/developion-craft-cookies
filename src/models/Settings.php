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

	//ovo treba da bude pseudo-settings
	public string $cookieBarTitle = 'We use cookies';
	public string $cookieBarMessage = 'This website uses cookies to ensure you get the best experience on our website.';

	public string $acceptAllButtonText = 'Accept All';
	public string $savePreferencesButtonText = 'Save Preferences';
	public string $cookieSettingsButtonText = 'Cookie Settings';

	public string $cookieNamePrefix = 'cookieConsent_';

	public string $cookieManagerUrl = 'https://cookie-manager.ddev.site/';

	public function rules(): array
	{
		return [
			[['cookieManagerUrl'], 'required'],
		];
	}
}
