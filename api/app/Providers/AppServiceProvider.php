<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Laravelの追加機能を登録する場所。今は追加がないため空のままでいい
     */
    public function register(): void
    {
        //
    }

    /**
     * アプリ起動時の共通設定を書く場所。上と同じで今は追加がないため空のままでいい
     */
    public function boot(): void
    {
        //
    }
}
