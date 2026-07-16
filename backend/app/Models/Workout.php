<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Workout extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $fillable = ['exercise_id', 'date'];
    protected $casts = ['date' => 'date'];
    public function exercise() { return $this->belongsTo(Exercise::class); }
    public function sets() { return $this->hasMany(WorkoutSet::class); }
}
