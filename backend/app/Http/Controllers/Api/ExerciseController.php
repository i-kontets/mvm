<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Exercise;
use Illuminate\Http\Request;

class ExerciseController extends Controller
{
    public function index() { return Exercise::orderBy('name')->get(); }
    public function store(Request $request) { return response()->json(Exercise::create($request->validate(['name' => ['required', 'string', 'max:255'], 'user_id' => ['nullable', 'integer']])), 201); }
    public function show(Exercise $exercise) { return $exercise; }
    public function update(Request $request, Exercise $exercise) { $exercise->update($request->validate(['name' => ['required', 'string', 'max:255']])); return $exercise; }
    public function destroy(Exercise $exercise) { $exercise->delete(); return response()->noContent(); }
}
