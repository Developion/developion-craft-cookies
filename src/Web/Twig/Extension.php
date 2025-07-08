<?php

namespace developion\craftcookies\Web\Twig;

use developion\craftcookies\Plugin;
use Twig\Extension\AbstractExtension;
use Twig\Extension\GlobalsInterface;

/**
 * Twig extension
 */
class Extension extends AbstractExtension implements GlobalsInterface
{

	public function getGlobals(): array
	{
		return [
			'cookieConsent' => Plugin::getInstance()
		];
	}

	public function getFilters()
	{
		return [];
	}

	public function getFunctions()
	{
		return [];
	}
}
