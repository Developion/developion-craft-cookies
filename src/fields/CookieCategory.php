<?php

namespace developion\craftcookies\fields;

use Craft;
use craft\base\ElementInterface;
use craft\base\Field;
use developion\craftcookies\Plugin;

/**
 * Cookie Category field type
 */
class CookieCategory extends Field
{

	public $dropdownOptions = '';
	public string $columnType = 'text';

	// public function getContentColumnType(): string
	// {
	// 	return 'text';
	// }

	public function init(): void
	{
		parent::init();
	}

	public static function displayName(): string
	{
		return Craft::t('_craft-cookies', 'Cookie Category');
	}

	public function getSettingsHtml(): ?string
	{
		return '';
	}

	public function normalizeValue($value, ElementInterface $element = null): string
	{
		$view = Craft::$app->getView();
		$templateMode = $view->getTemplateMode();
		$view->setTemplateMode($view::TEMPLATE_MODE_SITE);

		$variables['element'] = $element;
		$variables['this'] = $this;

		$options = json_decode($view->renderString($this->dropdownOptions, $variables), true);

		$view->setTemplateMode($templateMode);

		if (!$value && $this->isFresh($element)) :
			foreach ($options as $key => $option) :
				if (!empty($option['default'])) :
					$value = $option['value'];
				endif;
			endforeach;
		endif;

		return (is_null($value) ? '' : $value);
	}

	public function getInputHtml($value, ElementInterface $element = null): string
	{
		$this->dropdownOptions = Plugin::getInstance()->getCookieConsent()->getCookieCategories();
		$view = Craft::$app->getView();
		$templateMode = $view->getTemplateMode();
		$view->setTemplateMode($view::TEMPLATE_MODE_SITE);

		$variables['element'] = $element;
		$variables['this'] = $this;

		$options = json_decode($view->renderString($this->dropdownOptions, $variables) , true);

		$view->setTemplateMode($templateMode);

		return Craft::$app->getView()->renderTemplate('_craft-cookies/fields/cookieCategory/input.twig', [
			'name' => $this->handle,
			'value' => $value,
			'options' => $options
		]);
	}
}
