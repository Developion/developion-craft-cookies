<?php

namespace developion\craftcookies\services;

use Craft;
use craft\elements\GlobalSet;
use craft\fieldlayoutelements\CustomField;
use craft\fields\Dropdown;
use craft\fields\Matrix;
use craft\fields\PlainText;
use craft\helpers\StringHelper;
use craft\models\FieldGroup;
use craft\models\FieldLayout;
use craft\models\FieldLayoutTab;
use developion\base\records\Settings;
use developion\craftcookies\Plugin;
use Illuminate\Support\Arr;
use yii\base\Component;

/**
 * Install service
 */
class Install extends Component
{
	public function generateGlobalSet(): void
	{
		$transaction = Craft::$app->getDb()->beginTransaction();
		try {
			$layout = new FieldLayout();
			$layout->type = GlobalSet::class;

			$head = new FieldLayoutTab();
			$head->name = 'Head Snippets';
			$head->sortOrder = 1;
			$matrixField = $this->generateFields();
			$layoutElements = [];
			$layoutElements[] = Craft::createObject([
				'class' => CustomField::class,
				'uid' => $matrixField->uid,
				'required' => false,
				'width' => 100,
			], [$matrixField]);
			$head->setLayout($layout);
			$head->setElements(Arr::wrap($layoutElements));

			$layout->setTabs(Arr::wrap($head));

			$globalSet = new GlobalSet();
			$globalSet->name = 'CR Code Snippets';
			$globalSet->handle = 'crCodeSnippets';
			$globalSet->setFieldLayout($layout);

			if (!Craft::$app->getGlobals()->saveSet($globalSet)) {
				dd($globalSet->getErrors(), 'pera');
			}

			$transaction->commit();
		} catch (\Throwable $th) {
			$transaction->rollBack();
			$th->getMessage();
		}
	}

	public function generateFields(): Matrix
	{
		$fieldsService = Craft::$app->getFields();
		$group = new FieldGroup();
		$group->name = 'CR Cookie Consent';
		Craft::$app->getFields()->saveGroup($group);

		$setting = new Settings();
		$setting->plugin = Plugin::getInstance()->handle;
		$setting->setting = 'groupId';
		$setting->value = $group->id;
		if (!$setting->save()) {
			dd($setting->getErrors(), 'Settings Save Failed');
		}

		$codeSnippets = new Matrix([
			'name' => Craft::t('_craft-cookies', 'Code Snippets'),
			'handle' => 'crCodeSnippets',
			'minBlocks' => 0,
			'maxBlocks' => null,
			'localizeBlocks' => false,
			'groupId' => $group->id,
		]);
		$categories = [];
		if (Plugin::getInstance()->getSettings()->enableEssentialCookies) $categories['essential'] = 'Essential';
		if (Plugin::getInstance()->getSettings()->enableAnalyticsCookies) $categories['analytics'] = 'Analytics';
		if (Plugin::getInstance()->getSettings()->enableMarketingCookies) $categories['marketing'] = 'Marketing';

		$codeSnippets->setBlockTypes([
			[
				'name' => Craft::t('_craft-cookies', 'Code Snippet'),
				'handle' => 'crCodeSnippet',
				'fields' => [
					'new1' => [
						'type' => Dropdown::class,
						'name' => Craft::t('_craft-cookies', 'Category'),
						'handle' => 'crCategory',
						'width' => 100,
						'searchable' => false,
						'uid' => StringHelper::UUID(),
						'typesettings' => [
							'options' => $categories,
						]
					],
					'new2' => [
						'type' => PlainText::class,
						'name' => Craft::t('_craft-cookies', 'Code Snippet'),
						'handle' => 'crSnippet',
						'width' => 50,
						'searchable' => false,
						'uid' => StringHelper::UUID(),
						'typesettings' => [
							'multiline' => true,
						]
					],
					'new3' => [
						'type' => PlainText::class,
						'name' => Craft::t('_craft-cookies', 'Comments'),
						'handle' => 'crComments',
						'width' => 50,
						'searchable' => false,
						'uid' => StringHelper::UUID(),
						'typesettings' => [
							'multiline' => true,
						]
					],
				]
			]
		]);

		if (!$fieldsService->saveField($codeSnippets)) {
			dd($codeSnippets->getErrors(), 'laza');
		}
		return $codeSnippets;
	}

	public function deleteFields(): void
	{
		$global = Craft::$app->getGlobals()->getSetByHandle('crCodeSnippets');
		$layout = $global->getFieldLayout();
		$tabs = $layout->getTabs();
		foreach ($tabs as $tab) {
			$elements = $tab->getElements();
			foreach ($elements as $element) {
				Craft::$app->getFields()->deleteField($element->getField());
			}
		}
		Craft::$app->getGlobals()->deleteSet($global);
	}
}
