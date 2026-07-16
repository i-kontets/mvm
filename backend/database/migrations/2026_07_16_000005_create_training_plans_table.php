<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void { Schema::create('training_plans', function (Blueprint $table) { $table->id(); $table->unsignedTinyInteger('day_of_week'); // 0=日曜, 6=土曜
        $table->string('title'); $table->string('focus_area')->nullable(); $table->text('note')->nullable(); $table->timestamps(); }); }
    public function down(): void { Schema::dropIfExists('training_plans'); }
};
