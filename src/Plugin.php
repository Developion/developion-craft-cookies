<?php

namespace developion\craftcookies;

use Craft;
use craft\base\Model;
use craft\base\Plugin as BasePlugin;
use craft\events\DefineInputOptionsEvent;
use craft\events\RegisterComponentTypesEvent;
use craft\events\RegisterTemplateRootsEvent;
use craft\events\RegisterUrlRulesEvent;
use craft\helpers\App;
use craft\services\Fields;
use craft\web\UrlManager;
use craft\web\View;
use developion\craftcookies\Web\Twig\Extension;
use developion\craftcookies\fields\CookieCategory;
use developion\craftcookies\models\Settings;
use developion\craftcookies\records\GeneralSettings;
use developion\craftcookies\services\CookieConsentService;
use developion\craftcookies\traits\Services;
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

		Craft::$app->onInit(function () {});
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
				$event->rules['_craft-cookies'] = '_craft-cookies/settings/general';
				$event->rules['craft-cookies/general-settings'] = '_craft-cookies/settings/general';
			}
		);

		Event::on(
			View::class,
			View::EVENT_REGISTER_SITE_TEMPLATE_ROOTS,
			static function (RegisterTemplateRootsEvent $event): void {
				$event->roots['_craft-cookies'] = __DIR__ . '/templates';
			}
		);

		if (App::parseEnv('$COOKIE_FRONTEND_ENABLED') &&
			Craft::$app->getCache()->get('craft_cookies') &&
			Craft::$app->getRequest()->getIsSiteRequest() &&
			!Craft::$app->getRequest()->getIsConsoleRequest()
		) {
			Event::on(
				View::class,
				View::EVENT_END_BODY,
				static function ($event): void {
					$generalSettings = GeneralSettings::find()
						->where(['siteId' => Craft::$app->getSites()->getCurrentSite()->id])
						->one();
					echo Craft::$app->view->renderTemplate('_craft-cookies/cookieConsent', compact('generalSettings'));
				}
			);
		}

		Event::on(
			Fields::class,
			Fields::EVENT_REGISTER_FIELD_TYPES,
			function (RegisterComponentTypesEvent $event) {
				$event->types[] = CookieCategory::class;
		});
	}

	public function getCpNavItem(): ?array
	{
		$navItems = parent::getCpNavItem();

		$navItems['subnav']['codeSnippets'] = [
			'label' => Craft::t('_craft-cookies', 'General Settings'),
			'url' => 'craft-cookies/general-settings',
		];
		if (Craft::$app->getUser()->getIsAdmin() && Craft::$app->getConfig()->getGeneral()->allowAdminChanges) {
			$navItems['subnav']['settings'] = [
				'label' => Craft::t('_craft-cookies', 'Settings'),
				'url' => 'settings/plugins/_craft-cookies',
			];
		}

		return $navItems;
	}
}
