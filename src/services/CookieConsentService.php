<?php

namespace developion\craftcookies\services;

use developion\craftcookies\models\Settings;
use developion\craftcookies\Plugin;
use Craft;
use yii\base\Component;

/**
 * Cookie Consent Service service
 */
class CookieConsentService extends Component
{

	public function getSettings(): Settings
	{
		return Plugin::getInstance()->getSettings();
	}

	public function savePreferences(array $preferences): bool
	{
		$settings = $this->getSettings();
		$prefix = $settings->cookieNamePrefix;
		$expiration = time() + ($settings->cookieExpiration * 86400);

		$preferences['essential'] = true;

		$this->setCookie($prefix . 'consent', 'true', $expiration);
		$this->setCookie($prefix . 'essential', 'true', $expiration);
		$this->setCookie($prefix . 'analytics', $preferences['analytics'] ? 'true' : 'false', $expiration);
		$this->setCookie($prefix . 'marketing', $preferences['marketing'] ? 'true' : 'false', $expiration);

		return true;
	}

	public function isCategoryAllowed(string $category): bool
	{
		$settings = $this->getSettings();
		$prefix = $settings->cookieNamePrefix;

		if ($category === 'essential') {
			return true;
		}

		if (!isset($_COOKIE[$prefix . 'consent'])) {
			if ($category === 'analytics') {
				return $settings->enableAnalyticsCookies;
			}
			if ($category === 'marketing') {
				return $settings->enableMarketingCookies;
			}
			return false;
		}

		return isset($_COOKIE[$prefix . $category]) && $_COOKIE[$prefix . $category] === 'true';
	}

	public function hasConsent(): bool
	{
		$settings = $this->getSettings();
		$prefix = $settings->cookieNamePrefix;

		return isset($_COOKIE[$prefix . 'consent']) && $_COOKIE[$prefix . 'consent'] === 'true';
	}

	public function setCookie(string $name, string $value, int $expiration): bool
	{
		$secure = Craft::$app->getRequest()->getIsSecureConnection();
		$sameSite = 'Strict';

		return setcookie($name, $value, [
			'expires' => $expiration,
			'path' => '/',
			'domain' => '',
			'secure' => $secure,
			'httponly' => false,
			'samesite' => $sameSite
		]);
	}
}
