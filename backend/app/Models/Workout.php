<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Workout extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $fillable = ['name', 'exercise_id', 'date', 'category', 'tags'];
    protected $casts = ['date' => 'date', 'tags' => 'array'];
    public function exercise() { return $this->belongsTo(Exercise::class); }
    public function sets() { return $this->hasMany(WorkoutSet::class); }
}
