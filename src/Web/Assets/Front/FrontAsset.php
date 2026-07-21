<?php

namespace developion\craftcookies\Web\Assets\Front;

use Craft;
use craft\helpers\Json;
use craft\web\AssetBundle;
use craft\web\View;
use developion\craftcookies\Plugin;
use developion\craftcookies\Web\Assets\Font\FontAsset;

class FrontAsset extends AssetBundle
{
	public function init()
	{
		$this->sourcePath = __DIR__ . '/../../../../public/Front/dist';

		$this->depends = [
			FontAsset::class,
		];

		$this->js = [
			[
				'js/cookie-consent.js',
				'type' => 'module'
			]
		];

		$this->css = [
			'css/cookie-consent.css',
			'css/cookie-table.css',
		];


		parent::init();
	}

	public function registerAssetFiles($view): void
	{
		parent::registerAssetFiles($view);

		$json = Json::encode([
			'csrfParam' => Craft::$app->getRequest()->csrfParam,
			'csrfToken' => Craft::$app->getRequest()->csrfToken,
			'cookieNamePrefix' => Plugin::getInstance()->getSettings()->cookieNamePrefix,
			'resetConsent' => Plugin::getInstance()->getCookieConsent()->shouldResetConsent(),
		]);

		$js = <<<JS
window.craftCookies = $json;
JS;
		$view->registerJs($js, View::POS_HEAD);
	}
}
