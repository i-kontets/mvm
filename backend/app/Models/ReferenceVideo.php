<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReferenceVideo extends Model
{
    protected $fillable = ['title', 'url', 'category', 'thumbnail_url'];
}
