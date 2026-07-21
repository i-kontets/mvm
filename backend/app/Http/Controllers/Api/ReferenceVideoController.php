<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReferenceVideo;
use Illuminate\Http\Request;

class ReferenceVideoController extends Controller
{
    public function index() { return ReferenceVideo::latest()->get(); }
    public function store(Request $request) { return response()->json(ReferenceVideo::create($this->rules($request)), 201); }
    public function destroy(ReferenceVideo $referenceVideo) { $referenceVideo->delete(); return response()->noContent(); }
    private function rules(Request $request): array { return $request->validate(['title' => ['required', 'string', 'max:255'], 'url' => ['required', 'url', 'max:2048'], 'category' => ['nullable', 'string', 'max:100'], 'thumbnail_url' => ['nullable', 'url', 'max:2048']]); }
}
