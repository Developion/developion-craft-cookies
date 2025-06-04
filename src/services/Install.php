<?php

namespace developion\craftcookies\services;

use Craft;
use craft\base\Field;
use craft\elements\GlobalSet;
use craft\fieldlayoutelements\CustomField;
use craft\fields\Dropdown;
use craft\fields\Matrix;
use craft\fields\PlainText;
use craft\helpers\ArrayHelper;
use craft\helpers\StringHelper;
use craft\models\FieldGroup;
use craft\models\FieldLayout;
use craft\models\FieldLayoutTab;
use craft\models\MatrixBlockType;
use craft\services\ElementSources;
use craft\web\View;
use Illuminate\Support\Arr;
use yii\base\Component;

/**
 * Install service
 */
class Install extends Component
{
	public function generateGlobalSet(): void
	{
		$layout = new FieldLayout();
		$layout->type = GlobalSet::class;

		$tab = new FieldLayoutTab();
		$tab->name = 'Head Snippets';
		$tab->sortOrder = 1;
		$matrixField = $this->generateFields();
		$layoutElements = [];
		$layoutElements[] = Craft::createObject([
			'class' => CustomField::class,
			'uid' => $matrixField->uid,
			'required' => false,
			'width' => 100,
		], [$matrixField]);
		$tab->setLayout($layout);
		$tab->setElements(Arr::wrap($layoutElements));

		$layout->setTabs(Arr::wrap($tab));

		$globalSet = new GlobalSet();
		$globalSet->name = 'CR Code Snippets';
		$globalSet->handle = 'crCodeSnippets';
		$globalSet->setFieldLayout($layout);

		if (!Craft::$app->getGlobals()->saveSet($globalSet)) {
			dd($globalSet->getErrors(), 'pera');
		}
	}

	public function generateFields(): Matrix
	{
		$fieldsService = Craft::$app->getFields();
		$group = new FieldGroup();
		$group->name = 'CR Cookie Consent20';
		Craft::$app->getFields()->saveGroup($group);

		$codeSnippets = new Matrix([
			'name' => Craft::t('_craft-cookies', 'Code Snippets'),
			'handle' => 'crCodeSnippets20',
			'instructions' => Craft::t('_craft-cookies', 'Add content blocks as needed.'),
			'minBlocks' => 0,
			'maxBlocks' => null,
			'localizeBlocks' => false,
			'groupId' => $group->id,
		]);

		$codeSnippets->setBlockTypes([
			[
				'name' => Craft::t('_craft-cookies', 'Code Snippet'),
				'handle' => 'crCodeSnippet',
				'fields' => [
					'new1' => [
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
					'new2' => [
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
