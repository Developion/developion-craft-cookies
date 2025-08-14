<?php

namespace developion\craftcookies\Web\Twig;

use developion\craftcookies\Plugin;
use Twig\Extension\AbstractExtension;
use Twig\Extension\GlobalsInterface;
use Twig\TwigFilter;

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
		return [
			new TwigFilter('json_decode', function (string $json): array {
				return json_decode($json, true);
			}),
		];
	}

	public function getFunctions()
	{
		return [];
	}
}
