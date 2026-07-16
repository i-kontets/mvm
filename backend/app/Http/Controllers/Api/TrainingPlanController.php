<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TrainingPlan;
use Illuminate\Http\Request;

class TrainingPlanController extends Controller
{
    public function index() { return TrainingPlan::orderBy('day_of_week')->get(); }
    public function store(Request $request) { return response()->json(TrainingPlan::create($this->rules($request)), 201); }
    public function update(Request $request, TrainingPlan $trainingPlan) { $trainingPlan->update($this->rules($request)); return $trainingPlan; }
    public function destroy(TrainingPlan $trainingPlan) { $trainingPlan->delete(); return response()->noContent(); }
    private function rules(Request $request): array { return $request->validate(['day_of_week' => ['required', 'integer', 'between:0,6'], 'title' => ['required', 'string', 'max:100'], 'focus_area' => ['nullable', 'string', 'max:100'], 'note' => ['nullable', 'string', 'max:500']]); }
}
