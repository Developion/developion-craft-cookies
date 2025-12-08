<?php

namespace developion\craftcookies\controllers;

use developion\craftcookies\Plugin;
use Craft;
use craft\helpers\App;
use craft\helpers\StringHelper;
use craft\helpers\UrlHelper;
use craft\web\Controller;
use DateTime;
use GuzzleHttp\Client;
use GuzzleHttp\RequestOptions;
use yii\web\Response;

/**
 * Consent controller
 */
class ConsentController extends Controller
{
	protected array|int|bool $allowAnonymous = self::ALLOW_ANONYMOUS_LIVE;

	/**
	 * Save cookie preferences
	 *
	 * @return Response
	 */
	public function actionSavePreferences(): Response
	{
		$this->requirePostRequest();
		$request = Craft::$app->getRequest()->getBodyParams();
		unset($request['CRAFT_CSRF_TOKEN']);
		unset($request['action']);

		Plugin::getInstance()->getCookieConsent()->savePreferences($request);

		return $this->asJson(['success' => true]);
	}

	public function actionSendCookies()
	{
		if (!rand(0, 9) === 5) {
			return;
		}
		$url = App::parseEnv(Plugin::getInstance()->getSettings()->cookieManagerUrl);
		$frontEndCookies = array_keys(json_decode($this->request->getBodyParam('cookies'), true));
		$cookies = [];
		foreach (Craft::$app->getRequest()->getCookies() as $cookie) {
			$cookies[] = $cookie->name;
		}
		$cookies = array_merge($cookies, $frontEndCookies);
		try {
			$request = new Client([
				'base_uri' => $url,
			]);
			$response = $request->post('/api/cookies', [
				'headers' => [
					'Authorization' => 'Bearer ' . App::parseEnv(Plugin::getInstance()->getSettings()->apiKey),
				],
				RequestOptions::FORM_PARAMS => [
					'domain' => [
						'name' => Craft::$app->getSystemName(),
						'url' => UrlHelper::baseSiteUrl()
					],
					'cookies' => $cookies
				],
			]);
		} catch (\Throwable $th) {
			return $this->asJson(['success' => false, 'message' => $th->getMessage()]);
		}

		return $this->asJson(['success' => true]);
	}

	public function actionGetCookies(): Response
	{
		$cookies = Plugin::getInstance()->getCookieConsent()->getCookies();

		return $this->asJson($cookies);
	}

	public function actionSaveConsentData(): void
	{
		$this->requirePostRequest();
		$consent = Craft::$app->getRequest()->getBodyParam('consent');
		$userIp = Craft::$app->getRequest()->userIP;

		$longIp = ip2long($userIp);
		$anonLong = $longIp & 0xFFFFFF00;
		$anonIp = long2ip($anonLong);
		try {
			$request = new Client([
				'base_uri' => App::parseEnv(Plugin::getInstance()->getSettings()->cookieManagerUrl),
			]);

			$reponse = $request->post('/api/consent', [
				'headers' => [
					'Accept' => 'application/json',
					'Authorization' => 'Bearer ' . App::parseEnv(Plugin::getInstance()->getSettings()->apiKey),

				],
				'json' => [
					'consentGiven' => json_decode($consent, true),
					'consentId' => StringHelper::UUID(),
					'timestamp' => date('Y-m-d H:i:s', time()),
					'pluginVersion' => Plugin::getInstance()->getVersion(),
					'site' => UrlHelper::baseSiteUrl(),
					'userId' => sprintf('user-%04x%04x', random_int(0, 0xffff), random_int(0, 0xffff)),
					'source' => $anonIp,
				]
			]);
		} catch (\Throwable $th) {
			Craft::error('Error sending consent data: ' . $th->getMessage(), __METHOD__);
		}
	}
}
