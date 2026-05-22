<?php
declare(strict_types=1);

namespace developion\craftcookies\Web\Assets\Cookies4;

use Craft;
use craft\ckeditor\web\assets\BaseCkeditorPackageAsset;
use craft\web\View;

class Cookies4Asset extends BaseCkeditorPackageAsset
{
	public $sourcePath = __DIR__ . '/build';

	public $js = [
		'cookies.js',
	];

	public array $pluginNames = [
		'Cookies',
	];

	public array $toolbarItems = [
		'cookies',
	];

	public function registerPackage(View $view): void
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
		$view->registerJs($js, View::POS_HEAD);
		parent::registerPackage($view);
	}
}
