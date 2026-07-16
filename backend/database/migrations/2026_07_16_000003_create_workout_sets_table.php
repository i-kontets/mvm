<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void { Schema::create('workout_sets', function (Blueprint $table) { $table->id(); $table->foreignId('workout_id')->constrained()->cascadeOnDelete(); $table->decimal('weight', 7, 2); $table->unsignedInteger('reps'); }); }
    public function down(): void { Schema::dropIfExists('workout_sets'); }
};
