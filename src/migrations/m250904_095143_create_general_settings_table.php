<?php

namespace developion\craftcookies\migrations;

use Craft;
use craft\db\Migration;
use craft\db\Table;
use developion\craftcookies\models\GeneralSettings as GeneralSettingsModel;
use developion\craftcookies\records\GeneralSettings;
use Throwable;

/**
 * m250904_095143_create_general_settings_table migration.
 */
class m250904_095143_create_general_settings_table extends Migration
{
	/**
	 * @inheritdoc
	 */
	public function safeUp(): bool
	{
		if (!Craft::$app->getDb()->getTableSchema(GeneralSettings::TABLE)) {
			$this->createTable(GeneralSettings::TABLE, [
				'id' => $this->primaryKey(),
				'siteId' => $this->integer()->notNull(),
				'bannerTitle' => $this->string(),
				'bannerMessage' => $this->text(),
				'denyText' => $this->string(),
				'acceptText' => $this->string(),
				'settingsText' => $this->string(),
				'saveText' => $this->string(),
				'settingsTitle' => $this->string(),

				'dateCreated' => $this->dateTime()->notNull(),
				'dateUpdated' => $this->dateTime()->notNull(),
				'uid' => $this->uid(),
			]);
		}
		$this->addForeignKey(null, GeneralSettings::TABLE, ['siteId'], Table::SITES, ['id']);
		$transaction = Craft::$app->getDb()->beginTransaction();
		try {
			GeneralSettings::deleteAll();
			Craft::$app->getSites()->getAllSiteIds(true);
			foreach (Craft::$app->getSites()->getAllSiteIds(true) as $id) {
				$this->createDefaultRecord($id);
			}
			$transaction->commit();
		} catch (Throwable) {
			$transaction->rollBack();
			return false;
		}

		return true;
	}

	/**
	 * @inheritdoc
	 */
	public function safeDown(): bool
	{
		$this->dropTable(GeneralSettings::TABLE);
		return true;
	}

	public function createDefaultRecord(int $id): void
	{
		$model = new GeneralSettingsModel();
		$settings = new GeneralSettings([
			'siteId' => $id,
			'bannerTitle' => $model->bannerTitle,
			'bannerMessage' => $model->bannerMessage,
			'denyText' => $model->denyText,
			'acceptText' => $model->acceptText,
			'settingsText' => $model->settingsText,
			'saveText' => $model->saveText,
			'settingsTitle' => $model->settingsTitle,
		]);
		$settings->save();
	}
}
