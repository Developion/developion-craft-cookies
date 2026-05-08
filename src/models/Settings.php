<?php

namespace developion\craftcookies\models;

use Craft;
use craft\base\Model;

/**
 * Developion Cookies settings
 */
class Settings extends Model
{
	public int $cookieExpiration = 365; // days

	public string $cookieNamePrefix = 'cookieConsent_';
	public string $cookieManagerUrl = '$COOKIE_MANAGER_URL';
	public string $cookieBannerPosition = 'bottom--center';
	public string $apiKey = '';

	public function rules(): array
	{
		return [
			[['cookieManagerUrl', 'apiKey'], 'required'],
		];
	}
}
