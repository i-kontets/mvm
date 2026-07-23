<?php

use App\Http\Controllers\MvmController;
use Illuminate\Support\Facades\Route;

Route::get('/workouts', [MvmController::class, 'workouts']);
Route::post('/workouts', [MvmController::class, 'storeWorkout']);
Route::put('/workouts/{id}', [MvmController::class, 'updateWorkout']);
Route::delete('/workouts/{id}', [MvmController::class, 'deleteWorkout']);

Route::get('/body-metrics', [MvmController::class, 'metrics']);
Route::post('/body-metrics', [MvmController::class, 'storeMetric']);

Route::get('/training-plans', [MvmController::class, 'plans']);
Route::post('/training-plans', [MvmController::class, 'storePlan']);
Route::put('/training-plans/{id}', [MvmController::class, 'updatePlan']);
Route::delete('/training-plans/{id}', [MvmController::class, 'deletePlan']);

Route::get('/schedule-events', [MvmController::class, 'events']);
Route::post('/schedule-events', [MvmController::class, 'storeEvent']);
Route::put('/schedule-events/{id}', [MvmController::class, 'updateEvent']);
Route::delete('/schedule-events/{id}', [MvmController::class, 'deleteEvent']);

Route::get('/reference-videos', [MvmController::class, 'videos']);
Route::post('/reference-videos', [MvmController::class, 'storeVideo']);
Route::put('/reference-videos/{id}', [MvmController::class, 'updateVideo']);
