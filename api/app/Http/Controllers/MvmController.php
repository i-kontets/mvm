<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MvmController extends Controller
{
    // 「記録」画面に出すワークアウト一覧を返す。
    public function workouts()
    {
        // 記録本体に、種目名・重量・回数をくっつけて取得する。
        return DB::table('workouts')
            ->join('exercises', 'workouts.exercise_id', '=', 'exercises.id')
            ->leftJoin('workout_sets', 'workout_sets.workout_id', '=', 'workouts.id')
            ->select(
                'workouts.id',
                'workouts.name',
                'workouts.date',
                'workouts.category',
                'workouts.tags',
                'workouts.training_place',
                'workouts.record_type',
                'workouts.duration_minutes',
                'workouts.weight_mode',
                'exercises.name as exercise',
                'workout_sets.weight',
                'workout_sets.reps',
            )
            ->orderByDesc('workouts.date')
            ->get()
            ->map(fn ($workout) => [
                ...(array) $workout,
                'tags' => json_decode($workout->tags ?? '[]'),
                'training_place' => $workout->training_place ?? 'home',
                'record_type' => $workout->record_type ?? 'strength',
                'duration_minutes' => $workout->duration_minutes ? (int) $workout->duration_minutes : null,
                'video_ids' => DB::table('workout_videos')
                    ->where('workout_id', $workout->id)
                    ->pluck('reference_video_id')
                    ->map(fn ($id) => (int) $id)
                    ->all(),
            ]);
    }

    // フォームで入力した新しいワークアウトを保存
    public function storeWorkout(Request $request)
    {
        $id = $this->writeWorkout($this->workoutData($request));

        return response()->json(['id' => $id], 201);
    }

    // 指定されたワークアウトの内容を保存し直す。
    public function updateWorkout(Request $request, int $id)
    {
        abort_unless(DB::table('workouts')->where('id', $id)->exists(), 404);

        $this->writeWorkout($this->workoutData($request), $id);

        return response()->json(['id' => $id]);
    }

    // 指定されたワークアウトを削除する。
    public function deleteWorkout(int $id)
    {
        abort_unless(DB::table('workouts')->where('id', $id)->exists(), 404);

        // この記録に付いている重量・回数と参考動画のつながりも一緒に消す。
        // 3つの削除が全部成功した時だけ、削除を確定させる。
        DB::transaction(function () use ($id) {
            DB::table('workout_sets')->where('workout_id', $id)->delete();
            DB::table('workout_videos')->where('workout_id', $id)->delete();
            DB::table('workouts')->where('id', $id)->delete();
        });

        return response()->noContent();
    }

    // 送られてきた入力内容を確認し、足りない初期値を入れる。
    private function workoutData(Request $request)
    {
        $request->merge([
            'training_place' => $request->input('training_place', 'gym'),
            'record_type' => $request->input('record_type', 'strength'),
        ]);

        return $request->validate([
            'name' => ['nullable', 'string', 'max:100'],
            'exercise' => ['required', 'string', 'max:255'],
            'training_place' => ['required', 'in:home,gym'],
            'record_type' => ['required', 'in:strength,cardio'],
            'weight_mode' => ['nullable', 'in:weighted,bodyweight'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'reps' => ['nullable', 'integer', 'min:1', 'required_if:record_type,strength'],
            'duration_minutes' => ['nullable', 'integer', 'min:1', 'required_if:record_type,cardio'],
            'date' => ['required', 'date'],
            'category' => ['nullable', 'string', 'max:100'],
            'tags' => ['array'],
            'video_ids' => ['array'],
            'video_ids.*' => ['integer', 'exists:reference_videos,id'],
        ]);
    }

    // ワークアウト・重量と回数・参考動画をまとめて保存
    private function writeWorkout(array $data, ?int $id = null)
    {
        $recordType = $data['record_type'];
        $weightMode = $recordType === 'cardio'
            ? 'weighted'
            : ($data['weight_mode'] ?? 'weighted');
        // 初めて入力した自宅の種目は、次回の入力候補にも追加する。
        $exerciseId = DB::table('exercises')->where('name', $data['exercise'])->value('id')
            ?? DB::table('exercises')->insertGetId([
                'name' => $data['exercise'],
                'created_at' => now(),
            ]);
        // ワークアウトの基本情報（種目、日付、場所など）
        $payload = [
            'name' => $data['name'] ?? $data['exercise'],
            'exercise_id' => $exerciseId,
            'date' => $data['date'],
            'category' => $data['category'] ?? null,
            'tags' => json_encode($data['tags'] ?? []),
            'training_place' => $data['training_place'],
            'record_type' => $recordType,
            'duration_minutes' => $recordType === 'cardio' ? $data['duration_minutes'] : null,
            'weight_mode' => $weightMode,
        ];
        // その日の重量と回数。自重や有酸素では0を保存する。
        $setPayload = [
            'weight' => $recordType === 'cardio' || $weightMode === 'bodyweight'
                ? 0
                : ($data['weight'] ?? 0),
            'reps' => $recordType === 'cardio' ? 0 : $data['reps'],
        ];

        if ($id) {
            // 編集は、元の記録を新しい入力内容で上書きする。
            DB::table('workouts')->where('id', $id)->update($payload);
            DB::table('workout_sets')->where('workout_id', $id)->update($setPayload);
            DB::table('workout_videos')->where('workout_id', $id)->delete();
            $workoutId = $id;
        } else {
            // 新規は、記録を作ってから重量・回数を付ける。
            $workoutId = DB::table('workouts')->insertGetId($payload);
            DB::table('workout_sets')->insert([
                'workout_id' => $workoutId,
                ...$setPayload,
            ]);
        }

        // 選んだ参考動画を、対象のワークアウトに付ける。
        foreach ($data['video_ids'] ?? [] as $videoId) {
            DB::table('workout_videos')->insert([
                'workout_id' => $workoutId,
                'reference_video_id' => $videoId,
            ]);
        }

        return $workoutId;
    }

    // 登録した体重を、新しい日付から順に返す。
    public function metrics()
    {
        return DB::table('body_metrics')
            ->orderByDesc('recorded_at')
            ->get()
            ->map(fn ($metric) => [
                'id' => $metric->id,
                'weight' => $metric->weight,
                'date' => $metric->recorded_at,
            ]);
    }

    // フォームで入力した体重を保存する。
    public function storeMetric(Request $request)
    {
        $data = $request->validate([
            'weight' => ['required', 'numeric', 'min:0'],
            'date' => ['required', 'date'],
        ]);
        $id = DB::table('body_metrics')->insertGetId([
            'weight' => $data['weight'],
            'recorded_at' => $data['date'],
        ]);

        return response()->json(['id' => $id], 201);
    }

    // 「毎週火曜は胸」のような毎週の予定を返す。
    public function plans()
    {
        return DB::table('training_plans')
            ->orderBy('day_of_week')
            ->get()
            ->map(fn ($plan) => [
                'id' => $plan->id,
                'day' => $plan->day_of_week,
                'title' => $plan->title,
            ]);
    }

    // 毎週の予定を追加する
    public function storePlan(Request $request)
    {
        $data = $request->validate([
            'day' => ['required', 'integer', 'between:0,6'],
            'title' => ['required', 'string', 'max:100'],
        ]);
        $id = DB::table('training_plans')->insertGetId([
            'day_of_week' => $data['day'],
            'title' => $data['title'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['id' => $id], 201);
    }

    // 選んだ予定を書き換える。
    public function updatePlan(Request $request, int $id)
    {
        $data = $request->validate([
            'day' => ['required', 'integer', 'between:0,6'],
            'title' => ['required', 'string', 'max:100'],
        ]);
        DB::table('training_plans')->where('id', $id)->update([
            'day_of_week' => $data['day'],
            'title' => $data['title'],
            'updated_at' => now(),
        ]);

        return response()->json(['id' => $id]);
    }

    // 選んだ予定を削除する。
    public function deletePlan(int $id)
    {
        DB::table('training_plans')->where('id', $id)->delete();

        return response()->noContent();
    }

    // 「この週だけ」のような日付指定の予定を返す。
    public function events()
    {
        return DB::table('schedule_events')
            ->orderBy('start_date')
            ->get()
            ->map(fn ($event) => [
                'id' => $event->id,
                'title' => $event->title,
                'start' => $event->start_date,
                'end' => $event->end_date,
            ]);
    }

    // 日付指定の予定を1件追加する。
    public function storeEvent(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'start' => ['required', 'date'],
            'end' => ['nullable', 'date'],
        ]);
        $id = DB::table('schedule_events')->insertGetId([
            'title' => $data['title'],
            'start_date' => $data['start'],
            'end_date' => $data['end'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['id' => $id], 201);
    }

    // 日付指定の予定を書き換える。
    public function updateEvent(Request $request, int $id)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'start' => ['required', 'date'],
            'end' => ['nullable', 'date'],
        ]);
        DB::table('schedule_events')->where('id', $id)->update([
            'title' => $data['title'],
            'start_date' => $data['start'],
            'end_date' => $data['end'] ?? null,
            'updated_at' => now(),
        ]);

        return response()->json(['id' => $id]);
    }

    // 選んだ日付指定の予定を削除する。
    public function deleteEvent(int $id)
    {
        DB::table('schedule_events')->where('id', $id)->delete();

        return response()->noContent();
    }

    // 保存済みの参考動画を、新しい順で出す
    public function videos()
    {
        return DB::table('reference_videos')
            ->latest()
            ->get()
            ->map(fn ($video) => [
                'id' => $video->id,
                'title' => $video->title,
                'url' => $video->url,
                'category' => $video->category,
                'thumbnail' => $video->thumbnail_url,
            ]);
    }

    // 動画のタイトル・URL・サムネイルを保存する。
    public function storeVideo(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'url' => ['required', 'url'],
            'category' => ['nullable', 'string', 'max:100'],
            'thumbnail' => ['nullable', 'url'],
        ]);
        $id = DB::table('reference_videos')->insertGetId([
            'title' => $data['title'],
            'url' => $data['url'],
            'category' => $data['category'] ?? null,
            'thumbnail_url' => $data['thumbnail'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['id' => $id], 201);
    }

    // 選んだ参考動画の内容を書き換える。
    public function updateVideo(Request $request, int $id)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'url' => ['required', 'url'],
            'category' => ['nullable', 'string', 'max:100'],
            'thumbnail' => ['nullable', 'url'],
        ]);
        DB::table('reference_videos')->where('id', $id)->update([
            'title' => $data['title'],
            'url' => $data['url'],
            'category' => $data['category'] ?? null,
            'thumbnail_url' => $data['thumbnail'] ?? null,
            'updated_at' => now(),
        ]);

        return response()->json(['id' => $id]);
    }
}
