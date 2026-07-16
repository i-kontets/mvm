<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkoutSet extends Model
{
    public $timestamps = false;
    protected $fillable = ['workout_id', 'weight', 'reps'];
    public function workout() { return $this->belongsTo(Workout::class); }
}
