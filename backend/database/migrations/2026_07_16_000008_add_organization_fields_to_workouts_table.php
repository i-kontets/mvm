<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void { Schema::table('workouts', function (Blueprint $table) { $table->string('name')->nullable()->after('id'); $table->string('category')->nullable()->after('date'); $table->json('tags')->nullable()->after('category'); }); }
    public function down(): void { Schema::table('workouts', function (Blueprint $table) { $table->dropColumn(['name', 'category', 'tags']); }); }
};
