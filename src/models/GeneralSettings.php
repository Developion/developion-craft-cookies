<?php

namespace developion\craftcookies\models;

use craft\base\Model;

class GeneralSettings extends Model
{
	public string $bannerTitle = 'We use cookies';
	public string $bannerMessage = '<p>Wir verwenden notwendige Cookies, um dir eine perfekte Website-Erfahrung zu bieten. Zusätzlich würden wir gerne weitere Cookies einsetzen, um die Leistung unserer Website zu analysieren und Informationen für dich zu personalisieren – aber nur, wenn du zustimmst. Mehr über deine Auswahlmöglichkeiten erfährst du in unserer Cookie-Richtlinie.</p>';

	public string $denyText = 'Deny';
	public string $acceptText = 'Accept All';
	public string $settingsText = 'Cookie Settings';

	public string $saveText = 'Save Preferences';
	public string $settingsTitle = 'Cookie Settings';
}
