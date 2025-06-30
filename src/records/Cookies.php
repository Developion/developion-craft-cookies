<?php

namespace developion\craftcookies\records;

use Craft;
use craft\db\ActiveRecord;
use developion\craftcookies\migrations\Install;

/**
 * Cookies record
 *
 * @property string $name
 * @property string $category
 * @property string $description
 * @property string $vendor
 *
 */
class Cookies extends ActiveRecord
{
	public static function tableName()
	{
		return Install::TABLE_COOKIES;
	}

	protected function defineRules(): array
	{
		$rules = parent::defineRules();
		$rules[] = [['name'], 'required'];
		$rules[] = [['category', 'description', 'vendor'], 'safe'];

		return $rules;
	}
}
