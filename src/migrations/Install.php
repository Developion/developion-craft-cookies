<?php
declare(strict_types=1);

namespace developion\craftcookies\migrations;

use craft\db\Migration;

class Install extends Migration
{
	// Hoanzl Products Table
	public const TABLE_COOKIES = '{{%developion_cookies}}';

	public function safeUp(): bool
	{
		$this->createTable(self::TABLE_COOKIES, [
			'id' => $this->primaryKey(),
			'name' => $this->string()->notNull(),
			'category' => $this->string(),
			'description' => $this->string(),
			'vendor' => $this->string(),
		]);

		return true;
	}

	public function safeDown(): bool
	{
		$this->dropTableIfExists(self::TABLE_COOKIES);

		return true;
	}

}
