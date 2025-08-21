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

		foreach ($preferences as $preference => $value) {
			if ($preference === 'essential') $value = true;
			$this->setCookie($prefix . $preference, filter_var($value, FILTER_VALIDATE_BOOLEAN), $expiration);
		}

		return true;
	}

	public function hasConsentFor(string $category): bool
	{
		$settings = $this->getSettings();
		$prefix = $settings->cookieNamePrefix;

		return Craft::$app->getRequest()
			->getCookies()
			->getValue($prefix . $category) ?? false
		;
	}

	public function setCookie(string $name, bool $value, int $expiration)
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
		return Craft::$app->getCache()->getOrSet(
			'craft_categories',
			function () {
				$url = Plugin::getInstance()->getSettings()->cookieManagerUrl;

				$client = new Client(['base_uri' => $url]);
				return $client->get("/api/categories", [
					RequestOptions::HEADERS => [
						'Origin' => UrlHelper::baseSiteUrl(),
					]
				])
				->getBody()->getContents();
			}, 60 * 60
		);

	}

	public function getCookies(): string
	{
		return Craft::$app->getCache()->getOrSet(
			'craft_cookies',
			function () {
				$url = Plugin::getInstance()->getSettings()->cookieManagerUrl;

				$client = new Client(['base_uri' => $url]);
				return $client->get("/api/cookies", [
					RequestOptions::HEADERS => [
						'Origin' => UrlHelper::baseSiteUrl(),
					]
				])
				->getBody()->getContents();
			}, 60 * 60
		);

	}
}
