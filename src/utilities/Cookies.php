<?php

namespace developion\craftcookies\utilities;

use Craft;
use craft\base\Utility;
use craft\web\assets\clearcaches\ClearCachesAsset;
use craft\web\assets\dbbackup\DbBackupAsset;

/**
 * Cookies utility
 */
class Cookies extends Utility
{
	public static function displayName(): string
	{
		return Craft::t('_craft-cookies', 'Cookies');
	}

	static function id(): string
	{
		return 'cookies';
	}

	public static function icon(): ?string
	{
		return 'cookie-bite';
	}

	static function contentHtml(): string
	{
		$view = Craft::$app->getView();

		return $view->renderTemplate('_craft-cookies/utilities/cookies');
	}
}
