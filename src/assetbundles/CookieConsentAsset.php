<?php

namespace developion\craftcookies\assetbundles;

use craft\web\AssetBundle;

class CookieConsentAsset extends AssetBundle
{
	public function init()
	{
		$this->sourcePath = __DIR__ . '/dist';

		$this->depends = [];

		$this->js = [
			'js/cookie-consent.js',
		];

		$this->css = [
			'css/cookie-consent.css',
		];

		parent::init();
	}
}
