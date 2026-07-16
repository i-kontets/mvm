<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrainingPlan extends Model
{
    protected $fillable = ['day_of_week', 'title', 'focus_area', 'note'];
}
