<?php

namespace developion\craftcookies\traits;

use developion\craftcookies\services\CookieConsentService;
use developion\craftcookies\services\Install;

/**
 * @mixin Plugin
 */
trait Services
{
	public function getCookieConsent(): CookieConsentService
	{
		return $this->get('cookieConsent');
	}

	public function getInstall(): Install
	{
		return $this->get('install');
	}
}