<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Workout;
use Illuminate\Http\Request;

class WorkoutController extends Controller
{
    public function index() { return Workout::with(['exercise', 'sets'])->latest('date')->get(); }
    public function show(Workout $workout) { return $workout->load(['exercise', 'sets']); }
    public function store(Request $request) {
        $data = $request->validate(['name' => ['nullable', 'string', 'max:100'], 'exercise_id' => ['required', 'exists:exercises,id'], 'date' => ['required', 'date'], 'category' => ['nullable', 'string', 'max:100'], 'tags' => ['nullable', 'array'], 'tags.*' => ['string', 'max:50'], 'sets' => ['required', 'array', 'min:1'], 'sets.*.weight' => ['required', 'numeric', 'min:0'], 'sets.*.reps' => ['required', 'integer', 'min:1']]);
        $workout = Workout::create($data);
        $workout->sets()->createMany($data['sets']);
        return response()->json($workout->load(['exercise', 'sets']), 201);
    }
    public function destroy(Workout $workout) { $workout->delete(); return response()->noContent(); }
}
