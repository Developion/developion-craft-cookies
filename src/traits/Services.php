<?php

namespace developion\craftcookies\traits;

use developion\craftcookies\services\CookieConsentService;
use yii\caching\FileCache;

/**
 * @mixin Plugin
 * @property CookieConsentService $cookieConsentService
 */
trait Services
{
	public function getCookieConsent(): CookieConsentService
	{
		return $this->get('cookieConsent');
	}

	public function getCookieCache(): FileCache
	{
		return $this->get('cookieCache');
	}
}
