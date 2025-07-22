<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserCourseMode extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'practice_count',
        'quiz_count',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id');
    }
}
