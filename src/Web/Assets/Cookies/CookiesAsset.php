<?php
declare(strict_types=1);

namespace developion\craftcookies\Web\Assets\Cookies;

use Craft;
use craft\ckeditor\web\assets\BaseCkeditorPackageAsset;
use craft\web\View;

class CookiesAsset extends BaseCkeditorPackageAsset
{
	public $sourcePath = __DIR__ . '/dist';
	public string $namespace = '@developion/ckeditor5-cookies';

	public $js = [
		['cookies.js', 'type' => 'module']
	];

	public array $pluginNames = [
		'Cookies',
	];

	public array $toolbarItems = [
		'cookies',
	];

	public function registerPackage(): void
	{
		$shyButton = json_encode([
			'label' => Craft::t('site', 'Soft Hyphen'),
			'handle' => 'soft-hyphen',
			'placeholder' => '🔹',
			'value' => '<span class="entity-shy"></span>',
			'icon' => @file_get_contents(__DIR__ . DIRECTORY_SEPARATOR . 'icons' . DIRECTORY_SEPARATOR . 'soft-hyphen.svg'),
		]);

		$js = <<<JS
window.shyButton = {$shyButton};
JS;
		Craft::$app->getView()->registerJs($js, View::POS_HEAD);
		parent::registerPackage();
	}
}
