<?php

namespace developion\craftcookies\records;

use craft\db\ActiveRecord;

class GeneralSettings extends ActiveRecord
{
	public const TABLE = '{{craft_cookies_general_settings}}';

	public static function tableName(): string
	{
		return self::TABLE;
	}
}
