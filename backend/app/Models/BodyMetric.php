<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BodyMetric extends Model
{
    public $timestamps = false;
    protected $fillable = ['user_id', 'weight', 'arm_size', 'recorded_at'];
    protected $casts = ['recorded_at' => 'date'];
}
