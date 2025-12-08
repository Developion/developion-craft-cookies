<?php

namespace developion\craftcookies\console\controllers;

use Craft;
use craft\console\Controller;
use developion\craftcookies\Plugin;
use yii\console\ExitCode;

/**
 * Cache Controller controller
 */
class CacheController extends Controller
{
    public $defaultAction = 'index';

    public function options($actionID): array
    {
        $options = parent::options($actionID);
        switch ($actionID) {
            case 'index':
                // $options[] = '...';
                break;
        }
        return $options;
    }

    /**
     * _craft-cookies/set-cookies command
     */
    public function actionSetCookies(): int
    {
        Plugin::getInstance()->getCookieConsent()->setCookies();
        return ExitCode::OK;
    }

    /**
     * _craft-cookies/set-cookie-categories command
     */
    public function actionSetCookieCategories(): int
    {
        Plugin::getInstance()->getCookieConsent()->setCookieCategories();
        return ExitCode::OK;
    }
}
