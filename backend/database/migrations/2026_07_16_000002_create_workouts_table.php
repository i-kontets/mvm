<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void { Schema::create('workouts', function (Blueprint $table) { $table->id(); $table->foreignId('exercise_id')->constrained()->restrictOnDelete(); $table->date('date'); }); }
    public function down(): void { Schema::dropIfExists('workouts'); }
};
