<?php

namespace developion\craftcookies\Web\Assets\Front;

use craft\Web\AssetBundle;
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
			'js/cookie-consent.js',
		];

		$this->css = [
			'css/cookie-consent.css',
		];

		parent::init();
	}
}
