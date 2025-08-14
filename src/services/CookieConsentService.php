<?php

namespace developion\craftcookies\services;

use developion\craftcookies\models\Settings;
use developion\craftcookies\Plugin;
use Craft;
use craft\helpers\UrlHelper;
use GuzzleHttp\Client;
use GuzzleHttp\RequestOptions;
use yii\base\Component;
use yii\web\Cookie;

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

	public function setCookie(string $name, string $value, int $expiration)
	{
		$secure = Craft::$app->getRequest()->getIsSecureConnection();
		return Craft::$app->getResponse()->getCookies()->add(new Cookie([
			'name' => $name,
			'value' => $value,
			'path' => '/',
			'domain' => '',
			'secure' => $secure,
			'httpOnly' => true,
			'sameSite' => null
		]));
	}

	public function getCookieCategories(): string
	{
		// return Craft::$app->getCache()->getOrSet(
		// 	'craft_cookies',
		// 	function () {
				$url = Plugin::getInstance()->getSettings()->cookieManagerUrl;

				$client = new Client(['base_uri' => $url]);
				return $client->get("/api/categories", [
					RequestOptions::HEADERS => [
						'Origin' => UrlHelper::baseUrl(),
					]
				])
				->getBody()->getContents();
		// 	}, 60 * 60
		// );

	}

	public function getCookies(): string
	{
		// return Craft::$app->getCache()->getOrSet(
		// 	'craft_cookies',
		// 	function () {
				$url = Plugin::getInstance()->getSettings()->cookieManagerUrl;

				$client = new Client(['base_uri' => $url]);
				return $client->get("/api/cookies", [
					RequestOptions::HEADERS => [
						'Origin' => UrlHelper::baseUrl(),
					]
				])
				->getBody()->getContents();
		// 	}, 60 * 60
		// );

	}

	public function checkConsent(): bool
	{
		dd(
			$_COOKIE,
			Craft::$app->getRequest()->getCookies()
		);
	}
}
