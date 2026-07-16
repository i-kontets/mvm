<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void { Schema::create('schedule_events', function (Blueprint $table) { $table->id(); $table->string('title'); $table->date('start_date'); $table->date('end_date')->nullable(); $table->timestamps(); }); }
    public function down(): void { Schema::dropIfExists('schedule_events'); }
};
