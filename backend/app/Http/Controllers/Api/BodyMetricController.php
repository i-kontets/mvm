<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BodyMetric;
use Illuminate\Http\Request;

class BodyMetricController extends Controller
{
    public function index() { return BodyMetric::latest('recorded_at')->get(); }
    public function store(Request $request) { return response()->json(BodyMetric::create($request->validate(['weight' => ['required', 'numeric', 'min:0'], 'arm_size' => ['nullable', 'numeric', 'min:0'], 'recorded_at' => ['required', 'date']])), 201); }
}
