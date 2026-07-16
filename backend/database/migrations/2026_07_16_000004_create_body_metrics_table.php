<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void { Schema::create('body_metrics', function (Blueprint $table) { $table->id(); $table->decimal('weight', 5, 2); $table->decimal('arm_size', 5, 2)->nullable(); $table->date('recorded_at'); }); }
    public function down(): void { Schema::dropIfExists('body_metrics'); }
};
