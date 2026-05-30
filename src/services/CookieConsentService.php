<?php

namespace developion\craftcookies\services;

use developion\craftcookies\models\Settings;
use developion\craftcookies\Plugin;
use Craft;
use craft\helpers\App;
use craft\helpers\Json;
use craft\helpers\UrlHelper;
use GuzzleHttp\Client;
use GuzzleHttp\RequestOptions;
use yii\base\Component;
use yii\caching\TagDependency;
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

		if ($this->isCategoryMandatory($category)) {
			return true;
		}

		if (Craft::$app->getRequest()
			->getCookies()
			->get($prefix . $category)
		) {
			return Craft::$app->getRequest()
				->getCookies()
				->getValue($prefix . $category) ?? false;
		}

		return false;
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
			'sameSite' => null,
			'expire' => $expiration,
		]));
	}

	public function setCookieCategories(): string
	{
		$url = App::parseEnv(Plugin::getInstance()->getSettings()->cookieManagerUrl);

		$client = new Client([
			'base_uri' => $url,
			'http_errors' => false,
		]);
		$value =  $client->get("/api/categories", [
			RequestOptions::HEADERS => [
				'Origin' => UrlHelper::baseSiteUrl(),
				'Authorization' => 'Bearer ' . App::parseEnv(Plugin::getInstance()->getSettings()->apiKey),
			]
		])
			->getBody()->getContents();
		return Plugin::getInstance()->getCookieCache()->set(
			'craft_categories',
			$value,
			null,
			new TagDependency(['tags' => ['craft_cookies']])
		);
	}

	public function getCookieCategories(): string
	{
		return Plugin::getInstance()->getCookieCache()->get('craft_categories');
	}

	public function setCookies()
	{
		$url = App::parseEnv(Plugin::getInstance()->getSettings()->cookieManagerUrl);
		$client = new Client([
			'base_uri' => $url,
			'http_errors' => false,
		]);
		$value = $client->get("/api/cookies", [
			RequestOptions::HEADERS => [
				'Origin' => UrlHelper::baseSiteUrl(),
				'Authorization' => 'Bearer ' . App::parseEnv(Plugin::getInstance()->getSettings()->apiKey),
			]
		])
			->getBody()->getContents();
		return Plugin::getInstance()->getCookieCache()->set(
			'craft_cookies',
			$value,
			null,
			new TagDependency(['tags' => ['craft_cookies']])
		);
	}

	public function getCookies(): string
	{
		return Plugin::getInstance()->getCookieCache()->get('craft_cookies');
	}

	public function invalidateCaches(): void
	{
		$cache = Plugin::getInstance()->getCookieCache();
		TagDependency::invalidate($cache, ['craft_cookies']);
	}

	public function refreshData(): void
	{
		$this->invalidateCaches();
		$this->setCookies();
		$this->setCookieCategories();
		$this->setCookieData();
	}

	public function isCategoryMandatory(string $category): bool
	{
		$cookies = collect(json_decode($this->getCookies(), true));
		$cookie = $cookies->firstWhere('handle', $category);
		if ($cookie) {
			return $cookie['mandatory'] ?? false;
		}

		return false;
	}

	public function shouldResetConsent(): bool
	{
		$cookieCategory = collect(Craft::$app->getRequest()->getCookies()->toArray())
			->map(function ($item, $key) {
				if (str_starts_with($key, Plugin::getInstance()->getSettings()->cookieNamePrefix)) {
					return $key;
				}
			})
			->filter()
			->flatten();
		$cookies = collect(json_decode($this->getCookies(), true))
			->map(function ($item) {
				if ($item['handle']) {
					return Plugin::getInstance()->getSettings()->cookieNamePrefix . $item['handle'];
				}
			})
			->filter()
			->diff($cookieCategory)
			->isNotEmpty();

		return $cookies;
	}

	public function setCookieData(): bool
	{
		$url = App::parseEnv(Plugin::getInstance()->getSettings()->cookieManagerUrl);
		$client = new Client([
			'base_uri' => $url,
			'http_errors' => false,
		]);
		$response = $client->get("/api/cookie-data", [
			RequestOptions::HEADERS => [
				'Origin' => UrlHelper::baseSiteUrl(),
				'Authorization' => 'Bearer ' . App::parseEnv(Plugin::getInstance()->getSettings()->apiKey),
			]
		])
			->getBody()->getContents();

		$response = Json::decode($response, true);

		$data = array_map(function (array $cookie) {
			return array_filter($cookie, function ($value) {
				return $value !== null && (!is_string($value) || trim($value) !== '');
			});
		}, $response['data']);


		return Plugin::getInstance()->getCookieCache()->set(
			'craft_cookie_data',
			$data,
			null,
			new TagDependency(['tags' => ['craft_cookies']])
		);
	}

	public function getCookieData(): mixed
	{
		return Plugin::getInstance()->getCookieCache()->get('craft_cookie_data');
	}

	public function cookieData(): string
	{
		return Craft::$app->getView()->renderTemplate('_craft-cookies/_cookieData', [
			'data' => $this->getCookieData()
		]);
	}
}
