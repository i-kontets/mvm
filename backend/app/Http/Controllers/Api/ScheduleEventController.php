<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ScheduleEvent;
use Illuminate\Http\Request;

class ScheduleEventController extends Controller
{
    public function index() { return ScheduleEvent::orderBy('start_date')->get(); }
    public function store(Request $request) { return response()->json(ScheduleEvent::create($this->rules($request)), 201); }
    public function update(Request $request, ScheduleEvent $scheduleEvent) { $scheduleEvent->update($this->rules($request)); return $scheduleEvent; }
    public function destroy(ScheduleEvent $scheduleEvent) { $scheduleEvent->delete(); return response()->noContent(); }
    private function rules(Request $request): array { return $request->validate(['title' => ['required', 'string', 'max:100'], 'start_date' => ['required', 'date'], 'end_date' => ['nullable', 'date', 'after_or_equal:start_date']]); }
}
