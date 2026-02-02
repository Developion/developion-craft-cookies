<?php

namespace developion\craftcookies\traits;

use developion\craftcookies\services\CookieConsentService;

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
}
