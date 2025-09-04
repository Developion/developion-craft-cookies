<?php

namespace developion\craftcookies\Web\Twig;

use developion\craftcookies\Plugin;
use Twig\Environment;
use Twig\Extension\AbstractExtension;
use Twig\Extension\GlobalsInterface;
use Twig\TwigFilter;
use Twig\TwigFunction;

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
		return [
			new TwigFunction('hasConsentFor', Plugin::getInstance()->getCookieConsent()->hasConsentFor(...)),
			new TwigFunction('callIfExists', function (Environment $twig, string $name, ...$args) {
				$function = $twig->getFunction($name);
				if (!$function) return null;
				$callable = $function->getCallable();
				return $callable(...$args);
			}, ['needs_environment' => true]),
		];
	}
}
