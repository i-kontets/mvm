<?php

use App\Http\Controllers\Api\BodyMetricController;
use App\Http\Controllers\Api\ExerciseController;
use App\Http\Controllers\Api\WorkoutController;
use App\Http\Controllers\Api\TrainingPlanController;
use App\Http\Controllers\Api\ScheduleEventController;
use App\Http\Controllers\Api\ReferenceVideoController;
use Illuminate\Support\Facades\Route;

Route::apiResource('exercises', ExerciseController::class);
Route::apiResource('workouts', WorkoutController::class)->only(['index', 'store', 'show', 'destroy']);
Route::apiResource('body-metrics', BodyMetricController::class)->only(['index', 'store']);
Route::apiResource('training-plans', TrainingPlanController::class)->only(['index', 'store', 'update', 'destroy']);
Route::apiResource('schedule-events', ScheduleEventController::class)->only(['index', 'store', 'update', 'destroy']);
Route::apiResource('reference-videos', ReferenceVideoController::class)->only(['index', 'store', 'destroy']);
