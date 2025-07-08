<?php

declare(strict_types=1);

namespace developion\craftcookies\Web\Assets\Font;

use craft\web\AssetBundle;

/**
 * @property string[] $depends
 * @property string[]|array<string>[] $js
 * @property string[]|array<string>[] $css
 */
class FontAsset extends AssetBundle
{
	public function init()
	{
		$this->sourcePath = __DIR__ . '/../../../../public/Font/dist';

		$this->depends = [];

		$this->js = [];

		$this->css = [
			'css/fonts.css',
			'as' => 'style',
			'rel' => 'stylesheet preload',
		];

		parent::init();
	}
}
