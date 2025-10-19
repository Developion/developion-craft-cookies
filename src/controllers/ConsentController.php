<?php

namespace developion\craftcookies\controllers;

use developion\craftcookies\Plugin;
use Craft;
use craft\helpers\UrlHelper;
use craft\web\Controller;
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
		$url = Plugin::getInstance()->getSettings()->cookieManagerUrl;
		$frontEndCookies = array_keys(json_decode($this->request->getBodyParam('cookies'), true));
		$cookies = [];
		foreach (Craft::$app->getRequest()->getCookies() as $cookie) {
			$cookies[] = $cookie->name;
		}
		$cookies = array_merge($cookies, $frontEndCookies);
		$request = new Client([
			'base_uri' => $url,
			'http_errors' => false,
		]);
		$response = $request->post('/api/cookies', [
			RequestOptions::FORM_PARAMS => [
				'domain' => [
					'name' => Craft::$app->getSystemName(),
					'url' => UrlHelper::baseSiteUrl()
				],
				'cookies' => $cookies
			],
		]);

		return $this->asJson(['success' => true]);
	}

	public function actionGetCookies(): Response
	{
		$cookies = Plugin::getInstance()->getCookieConsent()->getCookies();

		return $this->asJson($cookies);
	}
}
