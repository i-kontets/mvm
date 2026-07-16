<?php

use App\Http\Controllers\Api\BodyMetricController;
use App\Http\Controllers\Api\ExerciseController;
use App\Http\Controllers\Api\WorkoutController;
use Illuminate\Support\Facades\Route;

Route::apiResource('exercises', ExerciseController::class);
Route::apiResource('workouts', WorkoutController::class)->only(['index', 'store', 'show', 'destroy']);
Route::apiResource('body-metrics', BodyMetricController::class)->only(['index', 'store']);
