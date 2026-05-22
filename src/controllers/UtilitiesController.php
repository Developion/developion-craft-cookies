<?php

namespace developion\craftcookies\controllers;

use Craft;
use craft\helpers\App;
use craft\web\Controller;
use developion\craftcookies\Plugin;
use yii\web\Response;

/**
 * Utilities controller
 */
class UtilitiesController extends Controller
{
	protected array|int|bool $allowAnonymous = self::ALLOW_ANONYMOUS_NEVER;

	public function actionRefreshData(): Response
	{
		$this->requirePostRequest();

		Plugin::getInstance()->getCookieConsent()->refreshData();

		return $this->asSuccess('Cookie data refreshed successfully.');
	}

	public function actionHealthcheck(): Response
	{
		$client = Craft::createGuzzleClient(['base_uri' => App::parseEnv(Plugin::getInstance()->getSettings()->cookieManagerUrl)]);
		$response = $client->get('/api/health-check', [
			'headers' => [
				'Accept' => 'application/json',
				'Authorization' => 'Bearer ' . App::parseEnv(Plugin::getInstance()->getSettings()->apiKey),
			]
		]);
		if ($response->getStatusCode() !== 200) {
			throw new \Exception('Unexpected status code: ' . $response->getStatusCode());
		}
		return $this->asSuccess('Healthcheck successful.');
	}

	public function actionGetData()
	{
		$this->requirePostRequest();

		$data = Plugin::getInstance()->getCookieConsent()->getCookieData();

		return $this->asJson([
			'success' => true,
			'data' => $data
		]);
	}
}
