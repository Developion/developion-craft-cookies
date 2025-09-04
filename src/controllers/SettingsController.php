<?php

namespace developion\craftcookies\controllers;

use Craft;
use craft\ckeditor\Field;
use craft\web\Controller;
use developion\craftcookies\records\GeneralSettings;

class SettingsController extends Controller
{
	public function actionGeneral()
	{
		$generalSettings = GeneralSettings::find()
			->where(['siteId' => Craft::$app->getSites()->getCurrentSite()->id])
			->one();
		$bannerMessage = $this->richTextField($generalSettings);
		return $this->renderTemplate('_craft-cookies/cp/generalSettings.twig', compact('generalSettings', 'bannerMessage'));
	}

	public function actionSave()
	{
		$params = $this->request->getBodyParams();
		unset($params['CRAFT_CSRF_TOKEN']);
		unset($params['action']);

		$record = GeneralSettings::find()
			->where(['siteId' => $this->request->getBodyParam('siteId')])
			->one();

		foreach ($params as $key => $value) {
			$record->$key = $value;
		}

		$record->save();
	}

	private function richTextField(GeneralSettings $generalSettings): ?string
	{
		$field = Craft::$app->getFields()->createField([
			'type' => Field::class,
			'name' => Craft::t('_craft-cookies', 'Banner Message'),
			'handle' => 'bannerMessage'
		]);

		return $field->getInputHtml($generalSettings->bannerMessage ?? '');
	}
}
