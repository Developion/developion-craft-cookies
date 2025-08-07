<?php

namespace developion\craftcookies;

use Craft;
use developion\craftcookies\models\Settings;
use developion\craftcookies\services\CookieConsentService;
use developion\craftcookies\traits\Services;
use developion\craftcookies\Web\Twig\Extension;
use craft\base\Model;
use craft\base\Plugin as BasePlugin;
use craft\events\RegisterTemplateRootsEvent;
use craft\events\RegisterUrlRulesEvent;
use craft\web\UrlManager;
use craft\web\View;
use yii\base\Event;

/**
 * Developion Cookies plugin
 *
 * @method static Plugin getInstance()
 * @method Settings getSettings()
 * @property-read CookieConsentService $cookieConsentService
 */
class Plugin extends BasePlugin
{
	use Services;

	public string $schemaVersion = '1.0.0';
	public bool $hasCpSettings = true;
	public bool $hasCpSection = true;

	public static function config(): array
	{
		return [
			'components' => [
				'cookieConsent' => CookieConsentService::class,
			],
		];
	}

	public function init(): void
	{
		parent::init();
		$this->attachEventHandlers();

		Craft::$app->onInit(function () {

		});
		Craft::$app->view->registerTwigExtension(new Extension());
	}

	protected function createSettingsModel(): ?Model
	{
		return new Settings();
	}

	protected function settingsHtml(): ?string
	{
		return Craft::$app->view->renderTemplate('_craft-cookies/_settings', [
			'plugin' => $this,
			'settings' => $this->getSettings(),
		]);
	}

	private function attachEventHandlers(): void
	{
		Event::on(
			UrlManager::class,
			UrlManager::EVENT_REGISTER_CP_URL_RULES,
			function (RegisterUrlRulesEvent $event) {
				$event->rules['craft-cookies'] = ['template' => '_craft-cookies/'];
			}
		);

		Event::on(
			View::class,
			View::EVENT_REGISTER_SITE_TEMPLATE_ROOTS,
			static function (RegisterTemplateRootsEvent $event): void {
				$event->roots['_craft-cookies'] = __DIR__ . '/templates';
			}
		);

		if ($this->getSettings()->enableCookieConsent && Craft::$app->getRequest()->getIsSiteRequest() && !Craft::$app->getRequest()->getIsConsoleRequest()) {
			Event::on(
				View::class,
				View::EVENT_END_BODY,
				static function ($event): void {
					echo Craft::$app->view->renderTemplate('_craft-cookies/cookieConsent');
				}
			);
		}
	}

	public function getCpNavItem(): ?array
	{
		$navItems = parent::getCpNavItem();

		$navItems['subnav']['codeSnippets'] = [
			'label' => Craft::t('_craft-cookies', 'Code Snippets'),
			'url' => 'craft-cookies',
		];

		$navItems['subnav']['settings'] = [
			'label' => Craft::t('_craft-cookies', 'Settings'),
			'url' => 'settings/plugins/_craft-cookies',
		];

		return $navItems;
	}
}
