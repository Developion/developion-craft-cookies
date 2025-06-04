<?php

namespace contentreactor\hoanzlkekse\controllers;

use contentreactor\hoanzlkekse\Plugin;
use Craft;
use craft\web\Controller;
use yii\web\Response;

/**
 * Consent controller
 */
class ConsentController extends Controller
{
	public $defaultAction = 'index';
	protected array|int|bool $allowAnonymous = self::ALLOW_ANONYMOUS_NEVER;

	/**
	 * Save cookie preferences
	 *
	 * @return Response
	 */
	public function actionSavePreferences(): Response
	{
		$this->requirePostRequest();

		$request = Craft::$app->getRequest();

		$preferences = [
			'essential' => true, // Essential cookies are always enabled
			'analytics' => (bool)$request->getParam('analytics', false),
			'marketing' => (bool)$request->getParam('marketing', false),
		];

		Plugin::getInstance()->getCookieConsent()->savePreferences($preferences);

		if ($request->getAcceptsJson()) {
			return $this->asJson(['success' => true]);
		}

		return $this->redirectToPostedUrl();
	}

	public function actionTestFields()
	{
		Plugin::getInstance()->getInstall()->generateGlobalSet();
	}

	public function actionDeleteFields()
	{
		Plugin::getInstance()->getInstall()->deleteFields();
	}
}
